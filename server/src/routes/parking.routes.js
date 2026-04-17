import express from "express"
import { authenticate, requireAdmin } from "../middlewares/authenticate.js"
import {
  createParkingLot,
  getAllParkingLots,
  getNearbyParkingLots,
  getParkingLotById,
  updateParkingLot,
  deleteParkingLot,

  createSlots,
  getSlotsByLot,
  getAvailableSlots,
  updateSlotStatus,
  deleteSlot,

  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  markNoShow,

  createSession,
  getActiveSessions,
  getMySessions,
  getSessionById,
  endSession,
  getSessionCost,
  getLotStats,
  getDailyReport,
  getPeakHoursReport,

} from "../controllers/parking.controller.js"

const router = express.Router()

// ================= PARKING LOT =================

router.post("/lots", authenticate, requireAdmin, createParkingLot)
router.get("/lots", getAllParkingLots)

router.get("/lots/nearby", getNearbyParkingLots)

router.get("/lots/:id", getParkingLotById)
router.patch("/lots/:id", authenticate, requireAdmin, updateParkingLot)
router.delete("/lots/:id", authenticate, requireAdmin, deleteParkingLot)

// ================= SLOT =================

router.post("/lots/:lotId/slots", authenticate, requireAdmin, createSlots)
router.get("/lots/:lotId/slots", getSlotsByLot)
router.get("/lots/:lotId/slots/available", getAvailableSlots)

router.patch("/slots/:slotId/status", authenticate, requireAdmin, updateSlotStatus)
router.delete("/slots/:slotId", authenticate, requireAdmin, deleteSlot)

// ================= RESERVATION =================

router.post("/reservations", authenticate, createReservation)
router.get("/reservations/me", authenticate, getMyReservations)
router.get("/reservations/:id", authenticate, getReservationById)

router.patch("/reservations/:id/cancel", authenticate, cancelReservation)

router.post("/reservations/:id/check-in", authenticate, checkInReservation)
router.post("/reservations/:id/check-out", authenticate, checkOutReservation)
router.patch("/reservations/:id/no-show", authenticate, markNoShow)

// ================= SESSION =================

router.post("/sessions", authenticate, createSession)
router.get("/sessions/active", authenticate, getActiveSessions)
router.get("/sessions/me", authenticate, getMySessions)
router.get("/sessions/:id", authenticate, getSessionById)

router.post("/sessions/:id/end", authenticate, endSession)
router.get("/sessions/:id/cost", authenticate, getSessionCost)

// ================= ANALYTICS =================

router.get("/lots/:id/stats", authenticate, requireAdmin, getLotStats)
router.get("/reports/daily", authenticate, requireAdmin, getDailyReport)
router.get("/reports/peak-hours", authenticate, requireAdmin, getPeakHoursReport)

export default router