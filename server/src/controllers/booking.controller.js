import * as bookingService from "../services/booking.service.js"

export const createBooking = async (req, res) => {
  try {
    const result = await bookingService.createBookingService({
      userId: "cmknyr7sc00005zku6ti238bw",
      ...req.body,
    })
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Create booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while creating booking",
      data: null,
    })
  }
}

export const getUserBookings = async (req, res) => {
  try {
    const result = await bookingService.getUserBookingsService(
      "cmknyr7sc00005zku6ti238bw",
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Get user bookings controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching bookings",
      data: null,
    })
  }
}

export const getBookingById = async (req, res) => {
  try {
    const result = await bookingService.getBookingByIdService(
      req.user.id,
      parseInt(req.params.id),
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Get booking by ID controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching booking",
      data: null,
    })
  }
}

export const checkInBooking = async (req, res) => {
  try {
    const result = await bookingService.checkInBookingService(
      parseInt(req.params.id),
      req.user.id,
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Check-in booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while checking in ticket",
      data: null,
    })
  }
}

export const shareBooking = async (req, res) => {
  try {
    const { targetUserId } = req.body
    const result = await bookingService.shareBookingService(
      parseInt(req.params.id),
      req.user.id,
      targetUserId,
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Share booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while sharing ticket",
      data: null,
    })
  }
}

export const shareBookingResponse = async (req, res) => {
  try {
    const { id: bookingId } = req.params
    const userId = req.user.id
    // req.user.id

    const result = await bookingService.acceptSharedTicket(
      parseInt(bookingId),
      userId,
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Share booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while accepting ticket",
      data: null,
    })
  }
}

export const cancelBooking = async (req, res) => {
  try {
    const result = await bookingService.cancelBookingService(
      parseInt(req.params.id),
      req.user.id,
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Cancel booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while cancelling booking",
      data: null,
    })
  }
}

export const getBookingQRCode = async (req, res) => {
  try {
    const result = await bookingService.getBookingQRCodeService(
      req.user.id,
      parseInt(req.params.id),
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Get booking QR code controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching QR code",
      data: null,
    })
  }
}

export const getSharedBookings = async (req, res) => {
  try {
    const result = await bookingService.getSharedBookingsService(req.user.id)
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Get shared bookings controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching shared bookings",
      data: null,
    })
  }
}

export const validateBooking = async (req, res) => {
  try {
    const result = await bookingService.validateBookingService(
      parseInt(req.params.id),
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Validate booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while validating booking",
      data: null,
    })
  }
}

// ADMIN CONTROLLERS

export const adminGetAllBookings = async (req, res) => {
  try {
    const result = await bookingService.adminGetAllBookingsService()
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Admin get all bookings controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching all bookings",
      data: null,
    })
  }
}

export const adminRevokeBooking = async (req, res) => {
  try {
    const result = await bookingService.adminRevokeBookingService(
      parseInt(req.params.id),
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Admin revoke booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while revoking booking",
      data: null,
    })
  }
}

export const adminUpdateBooking = async (req, res) => {
  try {
    const result = await bookingService.adminUpdateBookingService(
      parseInt(req.params.id),
      req.body,
    )
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Admin update booking controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while updating booking",
      data: null,
    })
  }
}

export const adminBookingStats = async (req, res) => {
  try {
    const result = await bookingService.adminBookingStatsService()
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error("Admin booking stats controller error:", err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching booking statistics",
      data: null,
    })
  }
}
