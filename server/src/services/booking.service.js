import { validateBooking } from "../controllers/booking.controller.js"
import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import { generateQRCode } from "../utils/qrcode.js"
import { addPointsToUser } from "./wallet.service.js"

export const POINTS_CONVERSION_RATE = 0.5
const ADMIN_WALLET_ID = 2
const COMMISSION_RATE = 0.1
const DEFAULT_DRIVER_ID = "cmocj1iy50003d6k3v1mfq0y8"
const MAX_TICKETS_PER_USER = 5

/**
 * Create a new booking
 */
export const createBookingService = async ({
  userId,
  busId,
  scheduleStartTime,
  date,
  boardingStop,
  alightingStop,
  totalAmount,
  seats = 1,
  discount = 0,
  promoCode,
  pointsUsed = 0,
  isPointUsed = false,
  paymentMethod = "WALLET",
  currency = "ETB",
}) => {
  try {
    // 0️⃣ Pre-generate QR code
    const qrPayload = JSON.stringify({ userId, temp: true })
    const qrCode = await generateQRCode(qrPayload)

    // 1️⃣ Fetch bus & schedule in a short transaction
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        route: { include: { midPoints: { orderBy: { id: "asc" } } } },
        schedules: true,
        vehicle: true,
      },
    })
    if (!bus) return errorResponse("Bus not found", 404)
    if (!bus.route) return errorResponse("Bus route not found", 404)

    const schedule = bus.schedules.find(
      (s) => s.startTime === scheduleStartTime && s.isActive,
    )
    if (!schedule) return errorResponse("Schedule not found", 404)

    const midPoints = bus.route.midPoints.map((mp) => mp.name)
    if (!boardingStop) boardingStop = midPoints[0] || null
    if (!alightingStop) alightingStop = midPoints[midPoints.length - 1] || null
    if (!boardingStop || !alightingStop)
      return errorResponse("Route does not have valid midPoints", 400)

    const bookingDate = new Date(date)
    if (isNaN(bookingDate.getTime()))
      return errorResponse("Invalid date provided", 400)

    const bookingDateStart = new Date(bookingDate)
    bookingDateStart.setHours(0, 0, 0, 0)
    const bookingDateEnd = new Date(bookingDate)
    bookingDateEnd.setHours(23, 59, 59, 999)

    // 2️⃣ Check user booking limits & bus capacity
    const existingTickets = await prisma.ticket.count({
      where: {
        userId,
        cancelledAt: null, // exclude cancelled tickets
        sharedToId: null, // exclude shared tickets
        validUntil: { gte: new Date() }, // only valid tickets
        booking: {
          is: {
            scheduleId: schedule.id,
            date: { gte: bookingDateStart, lt: bookingDateEnd },
          },
        },
      },
    })

    if (existingTickets > MAX_TICKETS_PER_USER)
      return errorResponse(
        `Booking limit exceeded: max ${MAX_TICKETS_PER_USER} seats per schedule`,
        400,
      )

    const bookedTickets = await prisma.ticket.count({
      where: {
        booking: {
          scheduleId: schedule.id,
          date: { gte: bookingDateStart, lt: bookingDateEnd },
        },
      },
    })
    const availableSeats = bus.capacity - bookedTickets
    if (seats > availableSeats)
      return errorResponse(
        `Not enough seats: requested ${seats}, only ${availableSeats} left`,
        400,
      )

    // 3️⃣ Calculate points and final amount
    const pointsValue = isPointUsed ? pointsUsed * POINTS_CONVERSION_RATE : 0
    const finalAmount =
      Number(totalAmount) - (Number(discount) + Number(pointsValue))
    if (finalAmount < 0)
      return errorResponse(
        `Invalid payment: discount + points exceed total`,
        400,
      )

    // 4️⃣ Wallet payment & Payment record (atomic)
    const payment = await prisma.$transaction(async (tx) => {
      let walletId = null
      if (paymentMethod === "WALLET") {
        const wallet = await tx.wallet.findUnique({ where: { userId } })
        if (!wallet) throw new Error("Wallet not found")
        if (!wallet.isActive) throw new Error("Wallet inactive")
        if (isPointUsed && pointsUsed > wallet.points)
          throw new Error("Insufficient points")
        if (wallet.balance < finalAmount)
          throw new Error("Insufficient balance")

        await tx.wallet.update({
          where: { userId },
          data: {
            balance: { decrement: finalAmount },
            ...(isPointUsed && { points: { decrement: pointsUsed } }),
          },
        })
        walletId = wallet.id

        if (isPointUsed && pointsUsed > 0) {
          await tx.pointTransaction.create({
            data: {
              walletId: wallet.id,
              amount: -pointsUsed,
              type: "SPEND",
              reason: "Used points for ticket discount",
              reference: `BOOKING_${Date.now()}`,
              metadata: {
                pointsUsed,
              },
            },
          })
        }
      }

      return tx.payment.create({
        data: {
          userId,
          amount: finalAmount,
          method: paymentMethod,
          flow:
            paymentMethod === "WALLET" ? "WALLET_PAYMENT" : "DIRECT_PAYMENT",
          status: paymentMethod === "WALLET" ? "SUCCESS" : "PENDING",
          reference: `PAY-${Date.now()}`,
          walletId,
          currency,
          pointsUsed: isPointUsed ? pointsUsed : 0,
          pointsValue: isPointUsed ? pointsValue : 0,
        },
      })
    })

    // 5️⃣ Create booking + tickets (atomic)
    const booking = await prisma.$transaction(async (tx) => {
      const validUntil = new Date(date)
      validUntil.setHours(validUntil.getHours() + 4)

      const newBooking = await tx.booking.create({
        data: {
          userId,
          busId,
          scheduleId: schedule.id,
          date,
          discount,
          promoCode,
          totalAmount,
          amountPaid: finalAmount,
          currency,
          pointsUsed: isPointUsed ? pointsUsed : 0,
          pointsValue: isPointUsed ? pointsValue : 0,
          pointsConversionRate: isPointUsed ? POINTS_CONVERSION_RATE : 0,
          paymentId: payment.id,
        },
      })

      const ticketsData = Array.from({ length: seats }).map((index) => ({
        bookingId: newBooking.id,
        userId,
        seatNumber: index + 1,
        boardingStop,
        alightingStop,
        qrCode,
        validUntil,
      }))
      await tx.ticket.createMany({ data: ticketsData })

      return newBooking
    })

    const tickets = await prisma.ticket.findMany({
      where: { bookingId: booking.id },
    })

    // 6️⃣ Calculate commission & provider amount
    const commission = totalAmount * COMMISSION_RATE
    const providerAmount = totalAmount - commission

    // 7️⃣ Ledger & payouts (atomic)
    await prisma.$transaction(async (tx) => {
      // a) TransactionLedger
      await tx.transactionLedger.create({
        data: {
          userId,
          providerId: null,
          paymentId: payment.id,
          totalAmount: finalAmount,
          commission,
          providerAmount,
          serviceType: "BUS_TICKET",
          referenceId: String(booking.id),
          referenceType: "BOOKING",
          paymentMethod,
          currency,
          status: payment.status === "SUCCESS" ? "COMPLETED" : "PENDING",
          isSettled: payment.status === "SUCCESS",
          externalRef: `LEDGER-${Date.now()}`,
          description: "Government bus ticket — full revenue to admin",
          metadata: {
            busId,
            scheduleId: schedule.id,
            seats,
            boardingStop,
            alightingStop,
            ownershipType: "GOVERNMENT",
          },
        },
      })

      if (payment.status === "SUCCESS") {
        // c) Admin commission
        const updatedAdmin = await tx.wallet.update({
          where: { id: ADMIN_WALLET_ID },
          data: { balance: { increment: finalAmount } },
        })

        await tx.walletTransaction.create({
          data: {
            walletId: ADMIN_WALLET_ID,
            amount: finalAmount,
            type: "PAYMENT_IN",
            status: "SUCCESS",
            balanceAfter: updatedAdmin.balance,
            reference: `TX-BUS-${booking.id}`,
            serviceType: "BUS_TICKET",
            description: "Government bus ticket revenue",
          },
        })

        await addPointsToUser({
          tx,
          userId,
          amount: 100,
          type: "EARN",
          reason: "Bus ticket booking reward",
          reference: `BOOKING_${booking.id}`,
          metadata: {
            bookingId: booking.id,
            busId,
            seats,
          },
        })
      }
    })

    return successResponse("Booking created successfully", {
      booking,
      tickets,
      payment,
      availableSeats: availableSeats - seats,
    })
  } catch (err) {
    console.error("Booking error:", err)
    return errorResponse("Failed to process booking", 500)
  }
}

/**
 * Get all bookings for a user
 */
export const getUserBookingsService = async (userId) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        bus: {
          include: {
            vehicle: true,
            driver: {
              include: {
                user: true,
              },
            },
            route: true,
          },
        },
        payment: true,
        tickets: {
          include: {
            sharedTo: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    const evReservations = await prisma.eVReservation.findMany({
      where: { userId },
      include: {
        vehicle: true,
        chargingPoint: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedBookings = bookings.map((booking) => ({
      type: "BUS",
      id: booking.id,
      bookingCode: booking.bookingCode,
      date: booking.date,
      status: booking.status,
      totalAmount: booking.totalAmount,
      amountPaid: booking.amountPaid,
      currency: booking.currency,

      origin: booking.bus?.route?.origin || null,
      destination: booking.bus?.route?.destination || null,
      bookedAt: booking.createdAt,

      bus: booking.bus
        ? {
            id: booking.bus.id,
            busNumber: booking.bus.busNumber,
            capacity: booking.bus.capacity,
            status: booking.bus.status,
            isActive: booking.bus.isActive,

            currentStop: booking.bus.currentStop,
            nextDestination: booking.bus.nextDestination,
            departureTime: booking.bus.departureTime,
            estimatedArrival: booking.bus.estimatedArrival,
            delayMinutes: booking.bus.delayMinutes,

            vehicle: booking.bus.vehicle
              ? {
                  id: booking.bus.vehicle.id,
                  plateNumber: booking.bus.vehicle.plateNumber,
                  model: booking.bus.vehicle.model,
                  manufacturer: booking.bus.vehicle.manufacturer,
                  year: booking.bus.vehicle.year,
                  type: booking.bus.vehicle.type,
                  capacity: booking.bus.vehicle.capacity,
                  image: booking.bus.vehicle.vehicleImageUrl,
                  mileage: booking.bus.vehicle.mileage,
                  status: booking.bus.vehicle.status,
                }
              : null,

            driver: booking.bus.driver
              ? {
                  id: booking.bus.driver.id,
                  name: booking.bus.driver.user?.name,
                  phone: booking.bus.driver.user?.phone,
                  licenseNo: booking.bus.driver.licenseNo,
                  experience: booking.bus.driver.experience,
                  rating: booking.bus.driver.rating,
                  totalTrips: booking.bus.driver.totalTrips,
                  isOnDuty: booking.bus.driver.isOnDuty,
                  status: booking.bus.driver.status,
                }
              : null,
          }
        : null,

      payment: booking.payment,

      tickets: booking.tickets.map((ticket) => ({
        id: ticket.id,
        seatNumber: ticket.seatNumber,
        qrCode: ticket.qrCode,
        boardingStop: ticket.boardingStop,
        alightingStop: ticket.alightingStop,
        checkedIn: ticket.checkedIn,
        validUntil: ticket.validUntil,
        checkedInAt: ticket.checkedInAt,
        cancelledAt: ticket.cancelledAt,
        sharedAt: ticket.sharedAt,
        sharedTicketUsed: ticket.sharedTicketUsed,
        sharedTo: ticket.sharedTo
          ? {
              id: ticket.sharedTo.id,
              name: ticket.sharedTo.name,
              phone: ticket.sharedTo.phone,
              email: ticket.sharedTo.email,
              avaterUrl: ticket.sharedTo.avaterUrl,
            }
          : null,
      })),
    }))

    const formattedEVReservations = evReservations.map((res) => ({
      type: "EV",
      id: res.id,
      reservationCode: res.reservationCode,
      status: res.status,
      paymentStatus: res.paymentStatus,

      startTime: res.startTime,
      endTime: res.endTime,
      createdAt: res.createdAt,

      targetBatteryPercentage: res.targetBatteryPercentage,
      targetKwh: res.targetKwh,

      totalAmount: res.calculatedAmount,

      vehicle: res.vehicle
        ? {
            id: res.vehicle.id,
            plateNumber: res.vehicle.plateNumber,
            model: res.vehicle.model,
            manufacturer: res.vehicle.manufacturer,
            image: res.vehicle.vehicleImageUrl,
          }
        : null,

      chargingPoint: res.chargingPoint
        ? {
            id: res.chargingPoint.id,
            name: res.chargingPoint.name,
            status: res.chargingPoint.status,
          }
        : null,

      payments: res.payments,
    }))

    const allBookings = [...formattedBookings, ...formattedEVReservations].sort(
      (a, b) =>
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
    )

    return successResponse("Bookings retrieved", allBookings)
  } catch (err) {
    console.error("Get user bookings service error:", err)
    return errorResponse("Failed to fetch bookings", 500)
  }
}

/**
 * Get single booking (owned or shared)
 */
export const getBookingByIdService = async (userId, bookingId) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: userId,
      },
      include: {
        bus: true,
        payment: true,
        tickets: true,
      },
    })

    if (!booking) return errorResponse("Booking not found", 404)

    return successResponse("Booking retrieved", booking)
  } catch (err) {
    console.error("Get booking by ID service error:", err)
    return errorResponse("Failed to fetch booking", 500)
  }
}

/**
 * Check-in a ticket
 */
export const checkInBookingService = async (bookingId, userId) => {
  try {
    const { data: booking, success } = await getBookingByIdService(
      userId,
      bookingId,
    )
    if (!success) return errorResponse("Booking not found or inaccessible", 404)
    if (booking.checkedIn)
      return errorResponse("Ticket already checked in", 400)
    if (booking.validUntil && new Date() > new Date(booking.validUntil))
      return errorResponse("Ticket expired", 400)

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { checkedIn: true, checkedInAt: new Date() },
    })

    return successResponse("Ticket checked in successfully", updated)
  } catch (err) {
    console.error("Check-in booking service error:", err)
    return errorResponse("Failed to check in booking", 500)
  }
}

/**
 * Share a booking with another user
 */
export const shareBookingService = async (
  bookingId,
  ownerId,
  targetUserId,
  ticketIds,
) => {
  try {
    // 1️⃣ Fetch booking with tickets
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tickets: true },
    })

    if (!booking) return errorResponse("Booking not found", 404)

    // 2️⃣ Ownership check
    if (booking.userId !== ownerId) {
      return errorResponse("Only the owner can share tickets", 403)
    }

    // 3️⃣ Prevent self share
    if (ownerId === targetUserId) {
      return errorResponse("Cannot share tickets to yourself", 400)
    }

    // 4️⃣ Validate ticketIds
    if (!ticketIds || !ticketIds.length) {
      return errorResponse("No tickets selected", 400)
    }

    const now = new Date()

    // 5️⃣ Filter tickets that belong to booking
    const selectedTickets = booking.tickets.filter((t) =>
      ticketIds.includes(t.id),
    )

    if (selectedTickets.length !== ticketIds.length) {
      return errorResponse("Some tickets are invalid", 400)
    }

    // 6️⃣ Validate each ticket
    for (const ticket of selectedTickets) {
      if (ticket.cancelledAt) {
        return errorResponse(`Ticket ${ticket.id} is cancelled`, 400)
      }

      if (ticket.validUntil && ticket.validUntil < now) {
        return errorResponse(`Ticket ${ticket.id} is expired`, 400)
      }

      if (ticket.sharedToId) {
        return errorResponse(`Ticket ${ticket.id} already shared`, 400)
      }

      if (ticket.checkedIn) {
        return errorResponse(`Ticket ${ticket.id} already used`, 400)
      }
    }

    // 7️⃣ Verify users
    const [senderUser, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: ownerId },
        select: { id: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true },
      }),
    ])

    if (!targetUser) {
      return errorResponse("Target user not found", 404)
    }

    // 8️⃣ Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update all tickets at once
      await tx.ticket.updateMany({
        where: {
          id: { in: ticketIds },
        },
        data: {
          sharedToId: targetUserId,
          sharedAt: new Date(),
        },
      })

      // Create ONE share record (grouped share)
      const sharedRecord = await tx.bookingShare.create({
        data: {
          bookingId,
          ownerId,
          targetUserId,
          status: "PENDING",
        },
      })

      // Notification
      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: "Tickets Shared",
          message: `${selectedTickets.length} ticket(s) shared by ${senderUser?.name}`,
          type: "BOOKING_SHARE",
          metadata: {
            bookingId,
            ticketIds,
            ownerId,
          },
          actionUrl: `/user/bookings/shared/${sharedRecord.id}`,
        },
      })

      return sharedRecord
    })

    return successResponse("Tickets shared successfully", result)
  } catch (err) {
    console.error("Share booking service error:", err)
    return errorResponse("Failed to share tickets", 500)
  }
}
/**
 * Accept shared ticket
 */
export const acceptSharedTicket = async (bookingId, userId) => {
  try {
    // 1️⃣ Find the pending share
    const share = await prisma.bookingShare.findFirst({
      where: {
        bookingId,
        targetUserId: userId,
        status: "PENDING",
      },
      include: {
        booking: {
          include: {
            tickets: true,
          },
        },
      },
    })

    if (!share) {
      return errorResponse(
        "No pending shared ticket found for this booking",
        404,
      )
    }

    // 2️⃣ Fetch receiver info for notification
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    })

    // 3️⃣ Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Accept share
      const updatedShare = await tx.bookingShare.update({
        where: { id: share.id },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      })

      // Assign tickets to the new user (receiver)
      await tx.ticket.updateMany({
        where: {
          bookingId: share.bookingId,
          cancelledAt: null,
        },
        data: {
          sharedToId: userId,
          sharedAt: new Date(),
        },
      })

      // Notify owner
      await tx.notification.create({
        data: {
          userId: share.ownerId,
          title: "Ticket Accepted",
          message: `Your shared ticket has been accepted by ${targetUser?.name}.`,
          type: "BOOKING_SHARE_ACCEPTED",
          metadata: {
            bookingId: share.bookingId,
            shareId: share.id,
          },
          actionUrl: `/user/bookings/${share.bookingId}`,
        },
      })

      return updatedShare
    })

    return successResponse("Ticket accepted successfully", result)
  } catch (err) {
    console.error("Accept shared ticket error:", err)

    return errorResponse("Failed to accept ticket", 500)
  }
}
/**
 * Cancel a booking
 */
export const cancelBookingService = async (bookingId, userId) => {
  try {
    const { data: booking, success } = await getBookingByIdService(
      userId,
      bookingId,
    )
    if (!success) return errorResponse("Booking not found or inaccessible", 404)
    if (booking.cancelledAt)
      return errorResponse("Booking already cancelled", 400)

    const cancelled = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    })

    return successResponse("Booking cancelled successfully", cancelled)
  } catch (err) {
    console.error("Cancel booking service error:", err)
    return errorResponse("Failed to cancel booking", 500)
  }
}

/**
 * Get QR code for a booking
 */
export const getBookingQRCodeService = async (userId, bookingId) => {
  try {
    const { data: booking, success } = await getBookingByIdService(
      userId,
      bookingId,
    )
    if (!success) return errorResponse("Booking not found or inaccessible", 404)
    if (!booking.qrCode) return errorResponse("QR code not available", 404)

    return successResponse("QR code retrieved", { qrCode: booking.qrCode })
  } catch (err) {
    console.error("Get booking QR code service error:", err)
    return errorResponse("Failed to retrieve QR code", 500)
  }
}

/**
 * Get bookings shared to the user
 */
export const getSharedBookingsService = async (userId) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { sharedToId: userId },
      include: { bus: true, payment: true, user: true },
      orderBy: { sharedAt: "desc" },
    })
    return successResponse("Shared bookings retrieved", bookings)
  } catch (err) {
    console.error("Get shared bookings service error:", err)
    return errorResponse("Failed to fetch shared bookings", 500)
  }
}

/**
 * Validate a ticket (for bus entry)
 */
export const validateBookingService = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })
    if (!booking) return errorResponse("Booking not found", 404)
    if (booking.checkedIn) return errorResponse("Ticket already used", 400)
    if (booking.validUntil && new Date() > new Date(booking.validUntil))
      return errorResponse("Ticket expired", 400)

    return successResponse("Booking is valid", booking)
  } catch (err) {
    console.error("Validate booking service error:", err)
    return errorResponse("Failed to validate booking", 500)
  }
}

/**
 * ADMIN SERVICES
 */

// Get all bookings (admin)
export const adminGetAllBookingsService = async () => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { bus: true, payment: true, user: true, sharedTo: true },
      orderBy: { date: "desc" },
    })
    return successResponse("All bookings retrieved", bookings)
  } catch (err) {
    console.error("Admin get all bookings service error:", err)
    return errorResponse("Failed to fetch all bookings", 500)
  }
}

// Revoke a booking (admin)
export const adminRevokeBookingService = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })
    if (!booking) return errorResponse("Booking not found", 404)

    const revoked = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "REVOKED" },
    })

    return successResponse("Booking revoked", revoked)
  } catch (err) {
    console.error("Admin revoke booking service error:", err)
    return errorResponse("Failed to revoke booking", 500)
  }
}

// Update booking (admin)
export const adminUpdateBookingService = async (bookingId, updateData) => {
  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    })
    return successResponse("Booking updated", updated)
  } catch (err) {
    console.error("Admin update booking service error:", err)
    return errorResponse("Failed to update booking", 500)
  }
}

// Booking statistics (admin)
export const adminBookingStatsService = async () => {
  try {
    const totalBookings = await prisma.booking.count()
    const sharedTickets = await prisma.booking.count({
      where: { sharedToId: { not: null } },
    })
    const cancelledBookings = await prisma.booking.count({
      where: { status: "CANCELLED" },
    })
    const confirmedBookings = await prisma.booking.count({
      where: { status: "CONFIRMED" },
    })
    return successResponse("Booking statistics retrieved", {
      totalBookings,
      sharedTickets,
      cancelledBookings,
      confirmedBookings,
    })
  } catch (err) {
    console.error("Admin booking stats service error:", err)
    return errorResponse("Failed to fetch booking statistics", 500)
  }
}

export const getAllSharedTickets = async (req, res) => {
  try {
    const userId = req.user.id

    // 1️⃣ Tickets the user shared with others
    const sentShares = await prisma.bookingShare.findMany({
      where: {
        ownerId: userId,
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        booking: {
          include: {
            bus: { include: { route: true } },
            tickets: true,
          },
        },
        targetUser: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { sharedAt: "desc" },
    })

    // 2️⃣ Tickets shared with the user
    const receivedShares = await prisma.bookingShare.findMany({
      where: {
        targetUserId: userId,
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        booking: {
          include: {
            bus: { include: { route: true } },
            tickets: true,
          },
        },
        owner: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { sharedAt: "desc" },
    })

    //  Helper: format tickets
    const formatTickets = (share, isSent = true) => {
      const tickets = share.booking.tickets.filter((t) =>
        isSent ? t.sharedToId === share.targetUserId : t.sharedToId === userId,
      )

      return tickets.map((t) => ({
        shareId: share.id,
        ticketId: t.id,
        seatNumber: t.seatNumber,
        boardingStop: t.boardingStop,
        alightingStop: t.alightingStop,
        qrCode: t.qrCode,
        checkedIn: t.checkedIn,
        validUntil: t.validUntil,
        status: share.status,
        sharedAt: share.sharedAt,

        booking: {
          id: share.booking.id,
          bookingCode: share.booking.bookingCode,
          createdAt: share.booking.createdAt,
        },

        ...(isSent ? { receiver: share.targetUser } : { owner: share.owner }),

        bus: {
          id: share.booking.bus?.id,
          busNumber: share.booking.bus?.busNumber,
          origin: share.booking.bus?.route?.origin || null,
          destination: share.booking.bus?.route?.destination || null,
        },
      }))
    }

    // 🔥 Deduplication helper
    const uniqueByTicketId = (tickets) => {
      const map = new Map()

      tickets.forEach((t) => {
        if (!map.has(t.ticketId)) {
          map.set(t.ticketId, t)
        }
      })

      return Array.from(map.values())
    }

    // 3️⃣ Process tickets
    const sentTicketsRaw = sentShares.flatMap((share) =>
      formatTickets(share, true),
    )

    const receivedTicketsRaw = receivedShares.flatMap((share) =>
      formatTickets(share, false),
    )

    // 4️⃣ Remove duplicates
    const sentTickets = uniqueByTicketId(sentTicketsRaw)
    const receivedTickets = uniqueByTicketId(receivedTicketsRaw)

    return res.status(200).json(
      successResponse("Shared tickets fetched successfully", {
        sent: sentTickets,
        received: receivedTickets,
      }),
    )
  } catch (error) {
    console.error("Error fetching shared tickets:", error)
    return res.status(500).json(errorResponse("Failed to fetch shared tickets"))
  }
}

export const cancelSharedTicket = async (req, res) => {
  try {
    const userId = req.user.id
    const { shareId } = req.params
    const { ticketId } = req.body

    if (!ticketId) {
      return res.status(400).json(errorResponse("ticketId is required"))
    }

    // 1️⃣ Find share
    const share = await prisma.bookingShare.findUnique({
      where: { id: shareId },
      include: {
        booking: {
          include: {
            bus: { include: { route: true } },
            tickets: true,
          },
        },
        owner: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
      },
    })

    if (!share) {
      return res.status(404).json(errorResponse("Share not found"))
    }

    // 2️⃣ Authorization
    if (share.ownerId !== userId && share.targetUserId !== userId) {
      return res.status(403).json(errorResponse("Not authorized"))
    }

    // 3️⃣ Only pending shares
    if (share.status !== "PENDING") {
      return res
        .status(400)
        .json(errorResponse("This share cannot be cancelled"))
    }

    // 4️⃣ Find the ticket to cancel
    const ticket = share.booking.tickets.find((t) => t.id === Number(ticketId))

    if (!ticket) {
      return res.status(404).json(errorResponse("Ticket not found"))
    }

    if (ticket.sharedToId !== share.targetUserId) {
      return res
        .status(400)
        .json(errorResponse("Ticket not shared with this user"))
    }

    if (ticket.checkedIn || ticket.sharedTicketUsed) {
      return res
        .status(400)
        .json(errorResponse("Ticket already used or consumed"))
    }

    // 5️⃣ Transaction: reset ticket and update share
    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          sharedToId: null,
          sharedAt: null,
        },
      })

      // If all tickets are cancelled, update share status
      const remainingSharedTickets = share.booking.tickets.filter(
        (t) => t.sharedToId === share.targetUserId && t.id !== ticket.id,
      )

      console.log(remainingSharedTickets)

      if (remainingSharedTickets.length === 0) {
        await tx.bookingShare.update({
          where: { id: shareId },
          data: { status: "CANCELLED", respondedAt: new Date() },
        })
      }

      // Optional: notify the other user
      const notifyUserId =
        userId === share.ownerId ? share.targetUserId : share.ownerId

      await tx.notification.create({
        data: {
          userId: notifyUserId,
          title: "Shared Ticket Cancelled",
          message: `A shared ticket (${ticket.seatNumber}) has been cancelled.`,
          type: "BOOKING_SHARE_CANCELLED",
          metadata: { shareId, ticketId: ticket.id },
        },
      })
    })

    return res.status(200).json(
      successResponse("Shared ticket cancelled successfully", {
        ticketId: ticket.id,
        shareId,
      }),
    )
  } catch (error) {
    console.error("Cancel shared ticket error:", error)
    return res.status(500).json(errorResponse("Failed to cancel shared ticket"))
  }
}
