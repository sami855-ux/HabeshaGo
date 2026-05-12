import * as bookingService from "../services/booking.service.js"

// Helper function to handle controller responses
const handleControllerResponse = async (res, serviceCall, errorContext) => {
  try {
    const result = await serviceCall()
    return res.status(result.statusCode).json(result)
  } catch (err) {
    console.error(`${errorContext}:`, err)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: `Internal server error ${errorContext.toLowerCase()}`,
      data: null,
    })
  }
}

export const createBooking = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.createBookingService({
        userId: req.user.id,
        ...req.body,
      }),
    "Create booking controller error",
  )

export const getUserBookings = (req, res) =>
  handleControllerResponse(
    res,
    () => bookingService.getUserBookingsService(req.user.id),
    "Get user bookings controller error",
  )

export const getBookingById = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.getBookingByIdService(
        req.user.id,
        parseInt(req.params.id),
      ),
    "Get booking by ID controller error",
  )

export const checkInBooking = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.checkInBookingService(
        parseInt(req.params.id),
        req.user.id,
      ),
    "Check-in booking controller error",
  )

export const shareBooking = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.shareBookingService(
        parseInt(req.params.id),
        req.user.id,
        req.body.targetUserId,
        req.body.ticketIds,
      ),
    "Share booking controller error",
  )

export const shareBookingResponse = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.acceptSharedTicket(parseInt(req.params.id), req.user.id),
    "Share booking response controller error",
  )

export const cancelBooking = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.cancelBookingService(parseInt(req.params.id), req.user.id),
    "Cancel booking controller error",
  )

export const getBookingQRCode = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.getBookingQRCodeService(
        req.user.id,
        parseInt(req.params.id),
      ),
    "Get booking QR code controller error",
  )

export const getSharedBookings = (req, res) =>
  handleControllerResponse(
    res,
    () => bookingService.getSharedBookingsService(req.user.id),
    "Get shared bookings controller error",
  )

export const validateBooking = (req, res) =>
  handleControllerResponse(
    res,
    () => bookingService.validateBookingService(parseInt(req.params.id)),
    "Validate booking controller error",
  )

// ADMIN CONTROLLERS

export const adminGetAllBookings = (req, res) =>
  handleControllerResponse(
    res,
    () => bookingService.adminGetAllBookingsService(),
    "Admin get all bookings controller error",
  )

export const adminRevokeBooking = (req, res) =>
  handleControllerResponse(
    res,
    () => bookingService.adminRevokeBookingService(parseInt(req.params.id)),
    "Admin revoke booking controller error",
  )

export const adminUpdateBooking = (req, res) =>
  handleControllerResponse(
    res,
    () =>
      bookingService.adminUpdateBookingService(
        parseInt(req.params.id),
        req.body,
      ),
    "Admin update booking controller error",
  )

export const adminBookingStats = (req, res) =>
  handleControllerResponse(
    res,
    () => bookingService.adminBookingStatsService(),
    "Admin booking stats controller error",
  )

export const paymentCallbackController = async (req, res) => {
  try {
    const data = { ...req.body, ...req.query }
    const result = await bookingService.paymentCallbackService(data)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Payment callback controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while processing payment callback",
      data: null,
    })
  }
}
