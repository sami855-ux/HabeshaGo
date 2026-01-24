import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import { generateQRCode } from "../utils/qrcode.js"

/**
 * Create a new booking
 */
export const createBookingService = async ({
  userId,
  busId,
  seatNumbers,
  date,
  boardingStop,
  alightingStop,
  payNow,
  discount,
  promoCode,
  seatType,
}) => {
  try {
    // Check seat availability
    const existingBookings = await prisma.booking.findMany({
      where: { busId, date },
    })
    const bookedSeats = existingBookings.flatMap((b) => b.seatNumbers)
    const conflictSeats = seatNumbers.filter((s) => bookedSeats.includes(s))
    if (conflictSeats.length > 0) {
      return errorResponse(
        `Seats already booked: ${conflictSeats.join(", ")}`,
        400,
      )
    }

    // Create booking with QR code
    const booking = await prisma.booking.create({
      data: {
        userId,
        busId,
        seatNumbers,
        date,
        boardingStop,
        alightingStop,
        payNow,
        discount,
        promoCode,
        seatType,
        qrCode: await generateQRCode(),
      },
    })

    return successResponse("Booking created successfully", booking)
  } catch (err) {
    console.error("Create booking service error:", err)
    return errorResponse("Failed to create booking", 500)
  }
}

/**
 * Get all bookings for a user
 */
export const getUserBookingsService = async (userId) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { bus: true, payment: true, sharedTo: true },
      orderBy: { date: "desc" },
    })
    return successResponse("Bookings retrieved", bookings)
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
