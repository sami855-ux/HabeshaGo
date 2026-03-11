import express from "express"
import {
  createBooking,
  getUserBookings,
  getBookingById,
  checkInBooking,
  shareBooking,
  cancelBooking,
  getBookingQRCode,
  getSharedBookings,
  validateBooking,
  // Admin controllers
  adminGetAllBookings,
  adminRevokeBooking,
  adminUpdateBooking,
  adminBookingStats,
  shareBookingResponse,
} from "../controllers/booking.controller.js"
import { authenticate } from "../middlewares/authenticate.js"
import { authorizeAdmin } from "../middlewares/authorizeAdmin.js"
import { getAllSharedTickets } from "../services/booking.service.js"

const router = express.Router()

// USER ROUTES

// Create a new booking (purchase ticket)
router.post("/", createBooking)

//Get shared booking
router.get("/shared-tickets", authenticate, getAllSharedTickets)

// List all bookings for logged-in user
router.get("/", getUserBookings)

// Get a single booking by ID (owned or shared)
router.get("/:id", authenticate, getBookingById)

// Check-in a ticket (validate QR code / usage)
router.patch("/:id/check-in", authenticate, checkInBooking)

// Share a booking with another user => request from the sender
router.patch("/:id/share/request", authenticate, shareBooking)

// Share a booking with another user => respond from the reciver
router.patch("/:id/share/response", authenticate, shareBookingResponse)

// Cancel a booking
router.patch("/:id/cancel", authenticate, cancelBooking)

// Get QR code for a booking
router.get("/:id/qrcode", authenticate, getBookingQRCode)

// List tickets shared to the logged-in user
router.get("/shared", authenticate, getSharedBookings)

// Validate a ticket (for bus entry)
router.get("/:id/validate", authenticate, validateBooking)

// ADMIN ROUTES

// List all bookings (admin)
router.get("/admin/all", authenticate, authorizeAdmin, adminGetAllBookings)

// Revoke a booking (fraud / issue)
router.patch(
  "/admin/:id/revoke",
  authenticate,
  authorizeAdmin,
  adminRevokeBooking,
)

// Update booking details
router.patch(
  "/admin/:id/update",
  authenticate,
  authorizeAdmin,
  adminUpdateBooking,
)

// Booking statistics (seats sold, shared tickets, revenue)
router.get("/admin/stats", authenticate, authorizeAdmin, adminBookingStats)

export default router
