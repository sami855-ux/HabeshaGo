import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import { generateQRCode } from "../utils/qrcode.js"

export const POINTS_CONVERSION_RATE = 0.1

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
    // Pre-generate QR code outside transaction
    const qrPayload = JSON.stringify({ bookingCode: "TEMP", userId })
    const qrCode = await generateQRCode(qrPayload)

    return await prisma.$transaction(async (tx) => {
      // 1️⃣ Find bus with route & schedules
      const bus = await tx.bus.findUnique({
        where: { id: busId },
        include: {
          route: { include: { midPoints: { orderBy: { id: "asc" } } } },
          schedules: true,
        },
      })
      if (!bus) return errorResponse("Bus not found", 404)
      if (!bus.route) return errorResponse("Bus route not found", 404)

      // 2️⃣ Find schedule (startTime only, no date)
      const schedule = bus.schedules.find(
        (s) => s.startTime === scheduleStartTime && s.isActive,
      )
      if (!schedule) return errorResponse("Schedule not found", 404)

      // 3️⃣ Auto-fill boarding/alighting stops
      const midPoints = bus.route.midPoints.map((mp) => mp.name)
      if (!boardingStop) boardingStop = midPoints[0] || null
      if (!alightingStop)
        alightingStop = midPoints[midPoints.length - 1] || null
      if (!boardingStop || !alightingStop)
        return errorResponse("Route does not have valid midPoints", 400)

      // Ensure we get a Date object
      const bookingDate = new Date(date) // `date` comes from frontend ISO string

      // Ensure valid Date
      if (isNaN(bookingDate.getTime())) {
        return errorResponse("Invalid date provided", 400)
      }
      // Start of day
      const bookingDateStart = new Date(bookingDate)
      bookingDateStart.setHours(0, 0, 0, 0)

      // End of day
      const bookingDateEnd = new Date(bookingDate)
      bookingDateEnd.setHours(23, 59, 59, 999)

      // 4️⃣ Check max tickets per user for this schedule + date
      const userBookings = await tx.booking.findMany({
        where: {
          userId,
          scheduleId: schedule.id,
          date: {
            gte: bookingDateStart,
            lt: bookingDateEnd,
          },
        },
        select: { seatsBooked: true },
      })
      const seatsAlreadyBooked = userBookings.reduce(
        (total, b) => total + (b.seatsBooked || 0),
        0,
      )
      const MAX_TICKETS_PER_USER = 5
      if (seatsAlreadyBooked + seats > MAX_TICKETS_PER_USER) {
        return errorResponse(
          `Booking limit exceeded: max ${MAX_TICKETS_PER_USER} seats per schedule`,
          400,
        )
      }

      // Aggregate booked seats for that schedule and date
      const bookedSeatsAgg = await tx.booking.aggregate({
        _sum: { seatsBooked: true },
        where: {
          scheduleId: schedule.id,
          date: {
            gte: bookingDateStart,
            lt: bookingDateEnd,
          },
        },
      })
      const reservedSeats = bookedSeatsAgg._sum.seatsBooked || 0
      const availableSeats = bus.capacity - reservedSeats
      if (seats > availableSeats) {
        return errorResponse(
          `Not enough seats: requested ${seats}, only ${availableSeats} left`,
          400,
        )
      }

      // 6️⃣ Points & final amount
      const pointsValue = isPointUsed ? pointsUsed * POINTS_CONVERSION_RATE : 0
      const finalAmount =
        Number(totalAmount) - Number(discount) - Number(pointsValue)
      if (finalAmount < 0)
        return errorResponse(
          `Invalid payment: discount + points exceed total`,
          400,
        )

      // 7️⃣ Wallet payment
      let walletId = null
      if (paymentMethod === "WALLET") {
        const wallet = await tx.wallet.findUnique({ where: { userId } })
        if (!wallet) return errorResponse("Wallet not found", 404)
        if (!wallet.isActive) return errorResponse("Wallet inactive", 403)
        if (isPointUsed && pointsUsed > wallet.points)
          return errorResponse(`Insufficient points`, 400)
        if (wallet.balance < finalAmount)
          return errorResponse(`Insufficient balance`, 400)

        await tx.wallet.update({
          where: { userId },
          data: {
            balance: { decrement: finalAmount },
            ...(isPointUsed && { points: { decrement: pointsUsed } }),
          },
        })
        walletId = wallet.id
      }

      // 8️⃣ Payment record
      const payment = await tx.payment.create({
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

      // 9️⃣ Create booking
      const validUntil = new Date(date)
      validUntil.setHours(validUntil.getHours() + 4) // add 4 hours

      const booking = await tx.booking.create({
        data: {
          userId,
          busId,
          scheduleId: schedule.id,
          date,
          boardingStop,
          alightingStop,
          seatsBooked: seats,
          payNow: true,
          discount,
          promoCode,
          totalAmount,
          amountPaid: finalAmount,
          currency,
          pointsUsed: isPointUsed ? pointsUsed : 0,
          pointsValue: isPointUsed ? pointsValue : 0,
          pointsConversionRate: isPointUsed ? POINTS_CONVERSION_RATE : 0,
          paymentId: payment.id,
          qrCode,
          validUntil,
        },
        include: { payment: true, bus: true },
      })

      // ✅ No need to update schedule.reservedSeats anymore
      return successResponse("Booking created successfully", {
        booking,
        payment,
        availableSeats: availableSeats - seats,
      })
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
            route: true, // this brings origin & destination
          },
        },
        payment: true,
        sharedTo: true,
      },
      orderBy: { date: "desc" },
    })

    const formattedBookings = bookings.map((booking) => ({
      ...booking,
      origin: booking.bus?.route?.origin || null,
      destination: booking.bus?.route?.destination || null,
    }))

    return successResponse("Bookings retrieved", formattedBookings)
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
      where: { id: bookingId, OR: [{ userId }, { sharedToId: userId }] },
      include: { bus: true, payment: true, sharedTo: true },
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
export const shareBookingService = async (bookingId, ownerId, targetUserId) => {
  try {
    // 1 Fetch the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })
    if (!booking) return errorResponse("Booking not found", 404)

    // 2 Check ownership
    if (booking.userId !== ownerId)
      return errorResponse("Only the owner can share this ticket", 403)

    // 3 Check if booking has expired
    if (booking.validUntil && new Date() > new Date(booking.validUntil))
      return errorResponse("Cannot share expired ticket", 400)

    // 4 Prevent sharing to yourself
    if (ownerId === targetUserId)
      return errorResponse("Cannot share ticket to yourself", 400)

    const senderUser = await prisma.user.findUnique({
      where: { id: ownerId },
    })
    // 5 Check that the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })
    if (!targetUser) return errorResponse("Target user not found", 404)

    // 6 Check for duplicate share
    const existingShare = await prisma.bookingShare.findFirst({
      where: {
        bookingId,
        targetUserId,
      },
    })
    if (existingShare)
      return errorResponse("Ticket already shared to this user", 400)

    // 7 Create the share record
    const sharedRecord = await prisma.bookingShare.create({
      data: {
        bookingId,
        ownerId,
        targetUserId,
        status: "PENDING",
      },
    })

    const res = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        sharedAt: new Date(),
        sharedToId: targetUserId,
      },
    })

    // 8 Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "New Ticket Shared",
        message: `A ticket has been shared with you by user ${senderUser?.name}.`,
        type: "BOOKING_SHARE",
        metadata: { bookingId, ownerId },
        actionUrl: `/user/bookings/shared/${sharedRecord.id}`,
      },
    })

    return successResponse("Ticket shared successfully", sharedRecord)
  } catch (err) {
    console.error("Share booking service error:", err)
    return errorResponse("Failed to share booking", 500)
  }
}

/**
 * Accept shared ticket
 */
export const acceptSharedTicket = async (bookingId, userId) => {
  try {
    // 1. Find the pending share for this booking and the current user
    const share = await prisma.bookingShare.findFirst({
      where: {
        bookingId,
        targetUserId: userId,
        status: "PENDING",
      },
    })

    if (!share) {
      return errorResponse(
        "No pending shared ticket found for this booking",
        404,
      )
    }

    // 2. Fetch receiver info (optional, for notification message)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    // 3. Perform atomic transaction: update share status, update booking, create notification
    const [updatedShare] = await prisma.$transaction([
      prisma.bookingShare.update({
        where: { id: share.id },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      }),
      prisma.booking.update({
        where: { id: share.bookingId },
        data: {
          sharedToId: userId,
          sharedAt: new Date(),
        },
      }),
      prisma.notification.create({
        data: {
          userId: share.ownerId,
          title: "Ticket Accepted",
          message: `Your shared ticket has been accepted by user ${targetUser?.name}.`,
          type: "BOOKING_SHARE_ACCEPTED",
          metadata: { bookingId: share.bookingId, shareId: share.id },
          actionUrl: `/user/bookings/${share.bookingId}`,
        },
      }),
    ])

    // 4. Return success response
    return successResponse("Ticket accepted successfully", updatedShare)
  } catch (err) {
    console.error("Accept shared ticket error:", err)
    // 5. Return generic error response
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

    // 1. Get tickets the user shared with others
    const sentShares = await prisma.bookingShare.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        booking: true,
        targetUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        sharedAt: "desc",
      },
    })

    // 2. Get tickets shared with the user
    const receivedShares = await prisma.bookingShare.findMany({
      where: {
        targetUserId: userId,
      },
      include: {
        booking: true,
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        sharedAt: "desc",
      },
    })

    // 3. Return grouped result
    return res.status(200).json({
      success: true,
      data: {
        sent: sentShares,
        received: receivedShares,
      },
    })
  } catch (error) {
    console.error("Error fetching shared tickets:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shared tickets",
    })
  }
}
