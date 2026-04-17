import express from "express"
import { authenticate, requireAdmin } from "../middlewares/authenticate"

const router = express.Router()

// PARKING LOT ROUTES

// Create a new parking lot (Admin only)
router.post("/lots", authenticate, requireAdmin, createParkingLot)

// Get nearby parking lots based on user location (GPS-based search)
router.get("/lots", getAllParkingLots)

// Get nearby parking lots based on user location (GPS-based search)
// /api/parking/lots/nearby?lat=&lng=&radius=
router.get("/lots/nearby", getNearbyParkingLots)

// Get detailed information of a single parking lot by ID
router.get("/lots/:id", getParkingLotById)
router.patch("/lots/:id", authenticate, requireAdmin, updateParkingLot)
router.delete("/lots/:id", authenticate, requireAdmin, deleteParkingLot)

// SLOT ROUTES

router.post("/lots/:lotId/slots", authenticate, requireAdmin, createSlots)
router.get("/lots/:lotId/slots", getSlotsByLot)
router.get("/lots/:lotId/slots/available", getAvailableSlots)
router.patch(
  "/slots/:slotId/status",
  authenticate,
  requireAdmin,
  updateSlotStatus,
)
router.delete("/slots/:slotId", authenticate, requireAdmin, deleteSlot)

// RESERVATION ROUTES

router.post("/reservations", authenticate, createReservation)
router.get("/reservations/me", authenticate, getMyReservations)
router.get("/reservations/:id", authenticate, getReservationById)
router.patch("/reservations/:id/cancel", authenticate, cancelReservation)

router.post("/reservations/:id/check-in", authenticate, checkInReservation)
router.post("/reservations/:id/check-out", authenticate, checkOutReservation)
router.patch("/reservations/:id/no-show", authenticate, markNoShow)

//SESSION ROUTES

router.post("/sessions", authenticate, createSession)
router.get("/sessions/active", authenticate, getActiveSessions)
router.get("/sessions/me", authenticate, getMySessions)
router.get("/sessions/:id", authenticate, getSessionById)
router.post("/sessions/:id/end", authenticate, endSession)
router.get("/sessions/:id/cost", authenticate, getSessionCost)

// ANALYTICS (ADMIN)
router.get("/lots/:id/stats", authenticate, requireAdmin, getLotStats)
router.get("/reports/daily", authenticate, requireAdmin, getDailyReport)
router.get(
  "/reports/peak-hours",
  authenticate,
  requireAdmin,
  getPeakHoursReport,
)

export default router
