import { Decimal } from "@prisma/client/runtime/library"
import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import {
  ADMIN_WALLET_ID,
  COMMISSION_RATE,
  POINTS_CONVERSION_RATE,
} from "../utils/constants.js"
import { addPointsToUser } from "./wallet.service.js"
import { createChapaPayment } from "./payment.service.js"

//Helper function
export async function generateUniqueReservationCode(tx) {
  const MAX_ATTEMPTS = 5

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    const code = `EVE-RES-${timestamp}${random}`

    // Check if this code already exists in the DB
    const existing = await tx.eVReservation.findUnique({
      where: { reservationCode: code },
    })

    if (!existing) return code
  }

  throw new Error(
    "Failed to generate a unique reservation code after multiple attempts",
  )
}
/**
 * Create a new reservation
 */

export const createReservationService = async (data) => {
  try {
    const {
      vehicleId,
      chargingPointId,
      startTime,
      endTime,
      userId,
      targetBatteryPercentage,
      targetKwh,
      calculatedAmount,
      paymentFlow = "POINTS_WALLET",
      // POINTS_WALLET | POINTS_EXTERNAL | WALLET_ONLY | EXTERNAL_ONLY
      paymentMethod = "MOBILE_MONEY",
    } = data

    // VALIDATION
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    const oneWeek = new Date(now)
    oneWeek.setDate(now.getDate() + 7)

    if (start < now)
      return errorResponse("Reservation cannot start in the past", 400)

    if (start > oneWeek || end > oneWeek)
      return errorResponse("Reservation cannot exceed 1 week", 400)

    if (end <= start) return errorResponse("Invalid time range", 400)

    if (!calculatedAmount || Number(calculatedAmount) <= 0)
      return errorResponse("Invalid payment amount", 400)

    // OVERLAP CHECK
    const overlap = await prisma.eVReservation.findFirst({
      where: {
        chargingPointId,
        status: { not: "CANCELLED" },
        OR: [{ startTime: { lte: end }, endTime: { gte: start } }],
      },
    })

    if (overlap) return errorResponse("Charging point already reserved", 400)

    // FETCH CHARGING POINT → STATION → MANAGER
    // We need the station manager before the main transaction
    const chargingPoint = await prisma.chargingPoint.findUnique({
      where: { id: chargingPointId },
      include: {
        station: {
          include: {
            manager: {
              include: {
                wallet: true,
              },
            },
          },
        },
      },
    })

    if (!chargingPoint) return errorResponse("Charging point not found", 404)
    if (!chargingPoint.station)
      return errorResponse("Charging station not found", 404)

    const managerId = chargingPoint.station.managerId
    const managerWallet = chargingPoint.station.manager?.wallet

    if (!managerWallet)
      return errorResponse("Station manager wallet not found", 404)

    // MONEY SPLIT
    // Admin keeps COMMISSION_RATE (e.g. 20%), provider gets the rest
    const totalPaid = Number(calculatedAmount)
    const commission = new Decimal(totalPaid * COMMISSION_RATE).toDecimalPlaces(
      2,
    )
    const providerAmount = new Decimal(totalPaid)
      .minus(commission)
      .toDecimalPlaces(2)

    // MAIN TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      let remainingAmount = totalPaid

      let pointsUsed = 0
      let pointsValueUsed = 0
      let walletUsed = 0

      const wallet = await tx.wallet.findUnique({
        where: { userId },
      })

      if (!wallet) {
        return errorResponse("Wallet not found", 404)
      }

      // Lock wallet
      await tx.$executeRaw`
        SELECT * FROM "Wallet" WHERE id = ${wallet.id} FOR UPDATE
      `

      // 1. POINTS (DISCOUNT LAYER)
      if (
        (paymentFlow === "POINTS_WALLET" ||
          paymentFlow === "POINTS_EXTERNAL") &&
        wallet.points > 0
      ) {
        const maxPointsValue = wallet.points * POINTS_CONVERSION_RATE

        if (maxPointsValue >= remainingAmount) {
          pointsValueUsed = remainingAmount
          pointsUsed = Math.ceil(remainingAmount / POINTS_CONVERSION_RATE)
          remainingAmount = 0
        } else {
          pointsValueUsed = maxPointsValue
          pointsUsed = wallet.points
          remainingAmount -= pointsValueUsed
        }

        await tx.pointTransaction.create({
          data: {
            walletId: wallet.id,
            amount: -pointsUsed,
            type: "SPEND",
            reason: "EV Reservation",
          },
        })

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            points: wallet.points - pointsUsed,
          },
        })
      }

      // 2. WALLET (PRIMARY PAYMENT)
      if (
        (paymentFlow === "POINTS_WALLET" || paymentFlow === "WALLET_ONLY") &&
        remainingAmount > 0
      ) {
        const walletBalance = Number(wallet.balance)

        walletUsed = Math.min(walletBalance, remainingAmount)
        remainingAmount -= walletUsed

        if (walletUsed > 0) {
          const newBalance = wallet.balance - walletUsed

          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          })

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: walletUsed,
              type: "PAYMENT_OUT",
              status: "SUCCESS",
              serviceType: "EV_CHARGING",
              balanceAfter: newBalance,
              reference: `WT-${Date.now()}`,
              description: "EV Reservation payment",
            },
          })
        }
      }

      const isFullyPaid = remainingAmount === 0
      const reservationCode = await generateUniqueReservationCode(tx)

      // 3. RESERVATION
      const reservation = await tx.eVReservation.create({
        data: {
          vehicleId,
          chargingPointId,
          startTime: start,
          endTime: end,
          userId,
          targetBatteryPercentage,
          targetKwh,
          calculatedAmount,
          status: isFullyPaid ? "CONFIRMED" : "PENDING",
          paymentStatus: isFullyPaid ? "SUCCESS" : "PENDING",
          preAuthorizedAmount: calculatedAmount,
          reservationCode,
          isConnectorLocked: !isFullyPaid,
          expiresAt: new Date(new Date(start).getTime() + 15 * 60 * 1000),
        },
      })

      // 4. PAYMENT RECORD
      const payment = await tx.payment.create({
        data: {
          userId,
          amount: calculatedAmount,
          method: isFullyPaid ? "WALLET" : paymentMethod,
          gateway: isFullyPaid ? "INTERNAL" : "CHAPA",
          flow:
            paymentFlow === "EXTERNAL_ONLY"
              ? "DIRECT_PAYMENT"
              : "POINTS_WALLET",
          pointsUsed: pointsUsed || null,
          pointsValue: pointsValueUsed || null,
          status: isFullyPaid ? "SUCCESS" : "PENDING",
          reference: `PAY-${Date.now()}`,
          evReservationId: reservation.id,
          metadata: {
            walletUsed,
            externalAmount: remainingAmount,
            paymentFlow,
            type: "EV_RESERVATION",
          },
        },
      })

      // 5. TRANSACTION LEDGER
      await tx.transactionLedger.create({
        data: {
          userId,
          providerId: managerId,
          paymentId: payment.id,
          totalAmount: new Decimal(totalPaid),
          commission,
          providerAmount,
          serviceType: "EV_CHARGING",
          referenceId: String(reservation.id),
          referenceType: "EV_CHARGING_SESSION",
          paymentMethod: isFullyPaid ? "WALLET" : paymentMethod,
          currency: "ETB",
          status: isFullyPaid ? "COMPLETED" : "PENDING",
          isSettled: isFullyPaid,
          externalRef: `LEDGER-EV-${Date.now()}`,
          description: "EV charging reservation payment",
          metadata: {
            chargingPointId,
            stationId: chargingPoint.station.id,
            stationName: chargingPoint.station.name,
            managerId,
            vehicleId,
            startTime,
            endTime,
            targetBatteryPercentage: targetBatteryPercentage ?? null,
            targetKwh: targetKwh ?? null,
            walletUsed,
            pointsUsed,
            pointsValueUsed,
            paymentFlow,
          },
        },
      })

      if (isFullyPaid) {
        // 6a. ADMIN WALLET — receives commission
        const updatedAdmin = await tx.wallet.update({
          where: { id: ADMIN_WALLET_ID },
          data: { balance: { increment: commission } },
        })

        await tx.walletTransaction.create({
          data: {
            walletId: ADMIN_WALLET_ID,
            amount: commission,
            type: "COMMISSION",
            status: "SUCCESS",
            serviceType: "EV_CHARGING",
            balanceAfter: updatedAdmin.balance,
            reference: `TX-EV-ADMIN-${reservation.id}`,
            description: "EV reservation commission",
          },
        })

        // 6b. PROVIDER (STATION MANAGER) WALLET — receives providerAmount
        const updatedManager = await tx.wallet.update({
          where: { id: managerWallet.id },
          data: { balance: { increment: providerAmount } },
        })

        await tx.walletTransaction.create({
          data: {
            walletId: ADMIN_WALLET_ID,
            recipientWalletId: managerWallet.id,
            amount: providerAmount,
            type: "PAYMENT_OUT",
            status: "SUCCESS",
            serviceType: "EV_CHARGING",
            balanceAfter: updatedManager.balance,
            reference: `TX-EV-MGR-${reservation.id}`,
            description: `EV reservation payout to station manager`,
          },
        })

        // 6c. LOYALTY POINTS
        await addPointsToUser({
          tx,
          userId,
          amount: 100,
          type: "EARN",
          reason: "EV reservation reward",
          reference: `EV_RESERVATION_${reservation.id}`,
          metadata: {
            reservationId: reservation.id,
            chargingPointId,
            vehicleId,
          },
        })
      }

      return {
        reservation,
        payment,
        externalAmount: remainingAmount,
        needsExternalPayment: remainingAmount > 0,
      }
    })

    // AFTER the prisma.$transaction block, BEFORE the return:

    if (result.needsExternalPayment) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { name: true, email: true, phone: true },
      })

      // Update payment metadata with reservationId now that we have it
      await prisma.payment.update({
        where: { id: result.payment.id },
        data: {
          metadata: {
            ...result.payment.metadata,
            reservationId: result.reservation.id, // 🆕
            type: "EV_RESERVATION", // 🆕
          },
        },
      })

      const chapaResult = await createChapaPayment(
        {
          ...result.payment,
          amount: result.externalAmount, // only charge the remaining amount
          metadata: {
            ...result.payment.metadata,
            reservationId: result.reservation.id,
            type: "EV_RESERVATION",
          },
        },
        user,
        {
          callbackUrl: `${process.env.BACKEND_NEGROK_URL}/api/ev/reservation/callback`,
          returnUrl: `${process.env.FRONTEND_URL}/payment/success?ref=${result.payment.reference}&amount=${result.externalAmount}&flow=EV_CHARGING`,
        },
      )

      return successResponse(
        "Reservation created. Complete payment to confirm",
        {
          needsExternalPayment: true,
          reservation: result.reservation,
          payment: result.payment,
          paymentUrl: chapaResult.paymentUrl,
          expiresIn: "15 minutes",
        },
        201,
      )
    }
    // RESPONSE
    return successResponse(
      result.needsExternalPayment
        ? "Reservation created. External payment required"
        : "Reservation fully paid successfully",
      result,
      201,
    )
  } catch (error) {
    console.error("Reservation Error:", error)
    return errorResponse(error?.message || "Failed to create reservation", 500)
  }
}

/**
 * Get all reservations
 */
export const getAllReservationsService = async (filters) => {
  try {
    const { status, userId } = filters || {}
    const reservations = await prisma.eVReservation.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
      },
      include: {
        vehicle: true,
        user: true,
        chargingPoint: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return successResponse(
      "Reservations retrieved successfully",
      reservations,
      200,
    )
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return errorResponse("Failed to fetch reservations", 500)
  }
}

/**
 * Get reservation by id
 */
export const getReservationByIdService = async (id) => {
  try {
    const reservation = await prisma.eVReservation.findUnique({
      where: { id: Number(id) },
      include: {
        vehicle: true,
        user: true,
        chargingPoint: {
          include: {
            station: {
              include: {
                tariffs: true,
              },
            },
          },
        },
        payments: true,
      },
    })

    if (!reservation) return errorResponse("Reservation not found", 404)

    return successResponse(
      "Reservation retrieved successfully",
      reservation,
      200,
    )
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return errorResponse("Failed to fetch reservation", 500)
  }
}

/**
 * Update a reservation
 */
export const updateReservationService = async (id, data) => {
  try {
    const reservationId = Number(id)
    const existingReservation = await prisma.eVReservation.findUnique({
      where: { id: reservationId },
    })

    if (!existingReservation) {
      return errorResponse("Reservation not found", 404)
    }

    if (existingReservation.status === "CANCELLED") {
      return errorResponse("Cannot update a cancelled reservation", 400)
    }

    const { startTime, endTime, vehicleId, chargingPointId } = data

    // Validate time range if updating
    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      if (start >= end) {
        return errorResponse("startTime must be before endTime", 400)
      }

      // Check overlapping reservations for the same charging point
      const overlapPoint = await prisma.eVReservation.findFirst({
        where: {
          id: { not: reservationId },
          chargingPointId:
            chargingPointId ?? existingReservation.chargingPointId,
          status: { not: "CANCELLED" },
          OR: [
            {
              startTime: { lte: end },
              endTime: { gte: start },
            },
          ],
        },
      })

      if (overlapPoint) {
        return errorResponse(
          "This charging point is already reserved during the selected time",
          400,
        )
      }

      // Check overlapping reservations for the same vehicle
      const overlapVehicle = await prisma.eVReservation.findFirst({
        where: {
          id: { not: reservationId },
          vehicleId: vehicleId ?? existingReservation.vehicleId,
          status: { not: "CANCELLED" },
          OR: [
            {
              startTime: { lte: end },
              endTime: { gte: start },
            },
          ],
        },
      })

      if (overlapVehicle) {
        return errorResponse(
          "This vehicle already has a reservation during the selected time",
          400,
        )
      }
    }

    // Proceed to update
    const updatedReservation = await prisma.eVReservation.update({
      where: { id: reservationId },
      data,
      include: {
        vehicle: true,
        user: true,
        chargingPoint: true,
      },
    })

    return successResponse(
      "Reservation updated successfully",
      updatedReservation,
      200,
    )
  } catch (error) {
    console.error("Error updating reservation:", error)
    return errorResponse("Failed to update reservation", 500)
  }
}

/**
 * Delete a reservation
 */
export const deleteReservationService = async (id) => {
  try {
    await prisma.eVReservation.delete({ where: { id: Number(id) } })
    return successResponse("Reservation deleted successfully", null, 200)
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return errorResponse("Failed to delete reservation", 500)
  }
}

/**
 * Get reservations by vehicle
 */
export const getReservationsByVehicleService = async (vehicleId) => {
  try {
    const reservations = await prisma.eVReservation.findMany({
      where: { vehicleId: Number(vehicleId) },
      include: { vehicle: true, user: true, chargingPoint: true },
      orderBy: { startTime: "desc" },
    })
    return successResponse(
      "Reservations retrieved successfully",
      reservations,
      200,
    )
  } catch (error) {
    console.error("Error fetching reservations by vehicle:", error)
    return errorResponse("Failed to fetch reservations", 500)
  }
}

/**
 * Get reservations by charging point
 */
export const getReservationsByPointService = async (pointId) => {
  try {
    const reservations = await prisma.eVReservation.findMany({
      where: { chargingPointId: Number(pointId) },
      include: { vehicle: true, user: true, chargingPoint: true },
      orderBy: { startTime: "desc" },
    })
    return successResponse(
      "Reservations retrieved successfully",
      reservations,
      200,
    )
  } catch (error) {
    console.error("Error fetching reservations by point:", error)
    return errorResponse("Failed to fetch reservations", 500)
  }
}

/**
 * Get reservations by user
 */
export const getReservationsByUserService = async (userId) => {
  try {
    const reservations = await prisma.eVReservation.findMany({
      where: { userId },
      include: { vehicle: true, user: true, chargingPoint: true },
      orderBy: { startTime: "desc" },
    })
    return successResponse(
      "Reservations retrieved successfully",
      reservations,
      200,
    )
  } catch (error) {
    console.error("Error fetching reservations by user:", error)
    return errorResponse("Failed to fetch reservations", 500)
  }
}

export const getManagerPaymentsService = async (managerId) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        evReservation: {
          chargingPoint: {
            station: {
              managerId,
            },
          },
        },
      },
      include: {
        user: true,
        evReservation: {
          include: {
            chargingPoint: {
              include: {
                station: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = payments.map((payment) => {
      const reservation = payment.evReservation
      const station = reservation?.chargingPoint?.station

      return {
        id: `pay_${payment.id}`,
        reference: payment.reference,
        userName: payment.user?.name || "Unknown",
        userId: payment.userId,

        stationName: station?.name || "Unknown Station",
        stationId: station?.id,

        amount: Number(payment.amount),
        currency: payment.currency,

        method: payment.method,
        gateway: payment.gateway,
        status: payment.status,

        reservationCode: reservation?.reservationCode,
        startTime: reservation?.startTime,
        endTime: reservation?.endTime,

        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      }
    })

    return successResponse("Payments retrieved successfully", formatted, 200)
  } catch (error) {
    console.error("Error fetching manager payments:", error)
    return errorResponse("Failed to fetch payments", 500)
  }
}

export const verifyChargerService = async (userId, code, stationId) => {
  try {
    if (!code) {
      return errorResponse("code is required", 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        isSuspended: true,
        isDeleted: true,
      },
    })

    if (!user) return errorResponse("User not found", 404)
    if (user.isSuspended) return errorResponse("Your account is suspended", 403)
    if (user.isDeleted)
      return errorResponse("Your account no longer exists", 403)

    // ─── 3. Detect input type & find charging point ───────────────────
    // QR scan  → code = "EVE-CP-00423" (contains dash or long)
    // Manual   → code = "A3" or "12"   (short slot label)
    const isQrScan = code.length > 6

    let chargingPoint

    if (isQrScan) {
      // QR scan → find by stationCode
      chargingPoint = await prisma.chargingPoint.findFirst({
        where: {
          slotnumber: code.trim().toUpperCase(),
        },
        include: {
          station: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              status: true,
              isVerified: true,
            },
          },
        },
      })
    } else {
      // Manual type → find by slotNumber + stationId
      if (!stationId) {
        return errorResponse(
          "stationId is required when typing a slot number",
          400,
        )
      }

      chargingPoint = await prisma.chargingPoint.findFirst({
        where: {
          slotNumber: code.trim().toUpperCase(),
          stationId: Number(stationId),
        },
        include: {
          station: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              status: true,
              isVerified: true,
            },
          },
        },
      })
    }

    console.log(chargingPoint)
    // ─── 4. Charging point exists? ────────────────────────────────────
    if (!chargingPoint) {
      return errorResponse(
        isQrScan
          ? `No charging point found with code "${code}"`
          : `No charging point found with slot "${code}" at this station`,
        404,
      )
    }

    // ─── 5. Station checks ────────────────────────────────────────────
    if (chargingPoint.station.status !== "ACTIVE") {
      return errorResponse(
        `This station is currently ${chargingPoint.station.status}`,
        400,
      )
    }

    if (!chargingPoint.station.isVerified) {
      return errorResponse("This station is not yet verified", 400)
    }

    // ─── 6. Charging point available? ────────────────────────────────
    if (chargingPoint.status !== "AVAILABLE") {
      return errorResponse(
        `Charging point is currently ${chargingPoint.status}`,
        400,
      )
    }

    // ─── 7. Find active reservation for this user + charger ──────────
    const now = new Date()

    const reservation = await prisma.eVReservation.findFirst({
      where: {
        chargingPointId: chargingPoint.id,
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        // user can scan up to 10 mins before their startTime
        // startTime: { lte: new Date(now.getTime() + 10 * 60 * 1000) },
        // expiresAt: { gte: now },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            vin: true,
            model: true,
            manufacturer: true,
            connectorType: true,
          },
        },
      },
    })

    // ← ADD THIS to see what the actual values are
    console.log("now        →", now)
    console.log("startTime  →", reservation?.startTime)
    console.log("expiresAt  →", reservation?.expiresAt)
    console.log("status     →", reservation?.status)

    if (!reservation) {
      return errorResponse(
        "No active reservation found for this charging point",
        403,
      )
    }

    // ─── 8. Already used? ─────────────────────────────────────────────
    if (reservation.isUsed) {
      return errorResponse("This reservation has already been used", 400)
    }

    // ─── 9. Payment cleared? ──────────────────────────────────────────
    if (reservation.isConnectorLocked) {
      return errorResponse("Connector is locked — payment not completed", 400)
    }

    // ─── 10. Connector type match? ────────────────────────────────────
    if (reservation.vehicle.connectorType !== chargingPoint.connectorType) {
      return errorResponse(
        `Connector mismatch — vehicle uses ${reservation.vehicle.connectorType} but charger is ${chargingPoint.connectorType}`,
        400,
      )
    }

    // ─── 11. All checks passed → start session ────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.chargingSession.create({
        data: {
          userId,
          vehicleId: reservation.vehicleId,
          stationId: chargingPoint.stationId,
          chargingPointId: chargingPoint.id,
          startTime: now,
          status: "ACTIVE",
        },
      })

      const updatedReservation = await tx.eVReservation.update({
        where: { id: reservation.id },
        data: {
          status: "CONFIRMED",
          isUsed: true,
          isConnectorLocked: false,
          chargingSessionId: session.id,
        },
      })

      await tx.chargingPoint.update({
        where: { id: chargingPoint.id },
        data: { status: "OCCUPIED" },
      })

      return { session, updatedReservation }
    })

    // ─── 12. Return success ───────────────────────────────────────────
    return successResponse("Charging session started successfully", {
      method: isQrScan ? "QR_SCAN" : "MANUAL_TYPE",
      sessionId: result.session.id,
      reservationCode: reservation.reservationCode,
      startTime: result.session.startTime,

      chargingPoint: {
        id: chargingPoint.id,
        slotNumber: chargingPoint.slotNumber,
        connectorType: chargingPoint.connectorType,
        powerKw: chargingPoint.powerKw,
        chargingSpeed: chargingPoint.chargingSpeed,
      },

      station: {
        id: chargingPoint.station.id,
        name: chargingPoint.station.name,
        address: chargingPoint.station.address,
        city: chargingPoint.station.city,
      },

      vehicle: {
        id: reservation.vehicle.id,
        plateNumber: reservation.vehicle.plateNumber,
        model: reservation.vehicle.model,
        connectorType: reservation.vehicle.connectorType,
      },

      reservation: {
        id: reservation.id,
        targetBatteryPercentage: reservation.targetBatteryPercentage,
        targetKwh: reservation.targetKwh,
        calculatedAmount: reservation.calculatedAmount?.toString(),
        endTime: reservation.endTime,
      },
    })
  } catch (error) {
    console.error("Verify charger service error:", error)
    return errorResponse("Failed to verify charger", 500)
  }
}
