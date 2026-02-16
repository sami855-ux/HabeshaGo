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
    return await prisma.$transaction(async (tx) => {
      // 0️⃣ Fetch bus with route midPoints
      const bus = await tx.bus.findUnique({
        where: { id: busId },
        include: {
          route: { include: { midPoints: { orderBy: { id: "asc" } } } },
        },
      })
      if (!bus) return errorResponse("Bus not found", 404)
      if (!bus.route) return errorResponse("Bus route not found", 404)

      // 0.1️⃣ Auto-fill boarding/alighting stops if missing
      const midPoints = bus.route.midPoints.map((mp) => mp.name)
      if (!boardingStop) boardingStop = midPoints[0] || null
      if (!alightingStop)
        alightingStop = midPoints[midPoints.length - 1] || null
      if (!boardingStop || !alightingStop)
        return errorResponse(
          "Route does not have valid midPoints for boarding or alighting",
          400,
        )

      // 0.5️⃣ Check max seats per user manually
      const userBookings = await tx.booking.findMany({
        where: { userId, busId, validUntil: { gte: new Date() } },
        select: { seatsBooked: true },
      })
      const seatsAlreadyBooked = userBookings.reduce(
        (total, b) => total + (b.seatsBooked || 0),
        0,
      )

      console.log(userBookings)
      const MAX_TICKETS_PER_USER = 5
      if (seatsAlreadyBooked + seats > MAX_TICKETS_PER_USER) {
        return errorResponse(
          `Booking limit exceeded: a user can only book ${MAX_TICKETS_PER_USER} seats per bus`,
          400,
        )
      }

      // 0.7️⃣ Check available seats for the bus
      const bookedSeats = await tx.booking.findMany({
        where: { busId, validUntil: { gte: new Date() } },
        select: { seatsBooked: true },
      })
      const reservedSeats = bookedSeats.reduce(
        (total, b) => total + (b.seatsBooked || 0),
        0,
      )
      const availableSeats = bus.capacity - reservedSeats
      if (seats > availableSeats) {
        return errorResponse(
          `Not enough available seats: requested ${seats}, only ${availableSeats} left`,
          400,
        )
      }

      // 1️⃣ Points value
      const pointsValue = isPointUsed ? pointsUsed * POINTS_CONVERSION_RATE : 0

      // 2️⃣ Final payable amount
      const finalAmount =
        Number(totalAmount) - Number(discount) - Number(pointsValue)
      if (finalAmount < 0)
        return errorResponse(
          `Invalid payment: discount (${discount}) + points value (${pointsValue}) exceed total amount (${totalAmount})`,
          400,
        )

      // 3️⃣ Wallet payment
      let walletId = null
      if (paymentMethod === "WALLET") {
        const wallet = await tx.wallet.findUnique({ where: { userId } })
        if (!wallet) return errorResponse("Wallet not found", 404)
        if (!wallet.isActive) return errorResponse("Wallet inactive", 403)
        if (isPointUsed && pointsUsed > wallet.points)
          return errorResponse(
            `Insufficient points: you tried to use ${pointsUsed} points but only have ${wallet.points}`,
            400,
          )
        if (wallet.balance < finalAmount)
          return errorResponse(
            `Insufficient wallet balance: your wallet has ${wallet.balance} but payment requires ${finalAmount}`,
            400,
          )
        await tx.wallet.update({
          where: { userId },
          data: {
            balance: { decrement: finalAmount },
            ...(isPointUsed && { points: { decrement: pointsUsed } }),
          },
        })
        walletId = wallet.id
      }

      // 4️⃣ Payment record
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

      // 5️⃣ Generate QR code
      const qrCode = await generateQRCode()

      // 6️⃣ Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          busId,
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
          validUntil: date,
        },
        include: { payment: true, bus: true },
      })

      // 7️⃣ Update bus seats
      await tx.bus.update({
        where: { id: busId },
        data: {
          reservedSeats: reservedSeats + seats,
          availableSeats: bus.capacity - (reservedSeats + seats),
        },
      })

      return successResponse("Booking created successfully", {
        booking,
        payment,
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
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })
    if (!booking) return errorResponse("Booking not found", 404)
    if (booking.userId !== ownerId)
      return errorResponse("Only owner can share", 403)
    if (booking.sharedToId) return errorResponse("Ticket already shared", 400)
    if (booking.validUntil && new Date() > new Date(booking.validUntil))
      return errorResponse("Cannot share expired ticket", 400)

    const shared = await prisma.booking.update({
      where: { id: bookingId },
      data: { sharedToId: targetUserId, sharedAt: new Date() },
    })

    return successResponse("Ticket shared successfully", shared)
  } catch (err) {
    console.error("Share booking service error:", err)
    return errorResponse("Failed to share booking", 500)
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
