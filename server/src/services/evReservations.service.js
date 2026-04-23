import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import { POINTS_CONVERSION_RATE } from "../utils/constants.js"

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

    console.log(calculatedAmount)
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

    // MAIN TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      let remainingAmount = Number(calculatedAmount)

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

          paymentStatus: isFullyPaid ? "SUCCESS" : "PENDING",
          preAuthorizedAmount: calculatedAmount,
          reservationCode: `RES-${Date.now()}`,
          isConnectorLocked: !isFullyPaid,
        },
      })

      // 4. PAYMENT RECORD
      const payment = await tx.payment.create({
        data: {
          userId,
          amount: calculatedAmount,

          method: isFullyPaid ? "WALLET" : paymentMethod,
          gateway: isFullyPaid ? "INTERNAL" : "CHAPA",

          flow: paymentFlow,

          pointsUsed: pointsUsed || null,
          pointsValue: pointsValueUsed || null,

          status: isFullyPaid ? "SUCCESS" : "PENDING",

          reference: `PAY-${Date.now()}`,
          evReservationId: reservation.id,

          metadata: {
            walletUsed,
            externalAmount: remainingAmount,
            paymentFlow,
          },
        },
      })

      return {
        reservation,
        payment,
        externalAmount: remainingAmount,
        needsExternalPayment: remainingAmount > 0,
      }
    })

    // RESPONSE
    return successResponse(
      result.remainingAmount === 0
        ? "Reservation fully paid successfully"
        : "Reservation created. External payment required",
      result,
      201,
    )
  } catch (error) {
    console.error("Reservation Error:", error)
    return errorResponse(error?.message || "Failed to create reservation", 500)
  }
}

// const res = await createReservation()

// if (res.data.needsExternalPayment) {
//   const paymentId = res.data.payment.id

//   const external = await initializeExternalPayment(paymentId)

//   window.location.href = external.checkoutUrl
// }
//EXTERNAL Paymnet
// export const initializeExternalPaymentService = async (paymentId) => {
//   const payment = await prisma.payment.findUnique({
//     where: { id: paymentId },
//   })

//   if (!payment) {
//     return errorResponse("Payment not found", 404)
//   }

//   const amount = payment.metadata?.externalAmount

//   if (!amount || amount <= 0) {
//     return errorResponse("No external payment needed", 400)
//   }

//   // Call Chapa / Telebirr
//   const gatewayResponse = await initializeChapaPayment({
//     amount,
//     tx_ref: payment.reference,
//     callback_url: `${process.env.BASE_URL}/api/payments/webhook`,
//   })

//   return successResponse("Redirect user to payment gateway", {
//     checkoutUrl: gatewayResponse.checkout_url,
//   })
// }

// export const paymentWebhook = async (req) => {
//   const { tx_ref, status } = req.body

//   const payment = await prisma.payment.findUnique({
//     where: { reference: tx_ref },
//   })

//   if (!payment) return errorResponse("Payment not found", 404)

//   if (status === "success") {
//     await prisma.payment.update({
//       where: { id: payment.id },
//       data: { status: "COMPLETED" },
//     })

//     await prisma.eVReservation.update({
//       where: { id: payment.evReservationId },
//       data: {
//         paymentStatus: "COMPLETED",
//         isConnectorLocked: false,
//       },
//     })

//     return successResponse("Payment completed", null, 200)
//   }

//   return errorResponse("Payment failed", 400)
// }

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
        chargingPoint: true,
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
