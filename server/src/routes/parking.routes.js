import express from "express";
import { authenticate, requireAdmin } from "../middlewares/authenticate.js";
import * as controller from "../controllers/parking.controller.js";

const router = express.Router();

// ================= LOT =================

router.post("/lots", authenticate, requireAdmin, controller.createParkingLot);
router.get("/lots", controller.getAllParkingLots);
router.get("/lots/nearby", controller.getNearbyParkingLots);

router.get("/lots/:id", controller.getParkingLotById);
router.patch(
  "/lots/:id",
  authenticate,
  requireAdmin,
  controller.updateParkingLot,
);
router.delete(
  "/lots/:id",
  authenticate,
  requireAdmin,
  controller.deleteParkingLot,
);

// ================= SLOT =================

router.post(
  "/lots/:lotId/slots",
  authenticate,
  requireAdmin,
  controller.createSlots,
);

router.get("/lots/:lotId/slots", controller.getSlotsByLot);
router.get("/lots/:lotId/slots/available", controller.getAvailableSlots);

router.patch(
  "/slots/:slotId/status",
  authenticate,
  requireAdmin,
  controller.updateSlotStatus,
);
router.delete(
  "/slots/:slotId",
  authenticate,
  requireAdmin,
  controller.deleteSlot,
);

// ================= RESERVATION =================

router.get(
  "/reservations",
  authenticate,
  requireAdmin,
  controller.getAllReservations,
);

router.post("/reservations", authenticate, controller.createReservation);

router.get("/reservations/me", authenticate, controller.getMyReservations);
router.get("/reservations/:id", authenticate, controller.getReservationById);

router.patch(
  "/reservations/:id/cancel",
  authenticate,
  controller.cancelReservation,
);
router.patch("/reservations/:id/no-show", authenticate, controller.markNoShow);

// ✅ CHECK-IN → creates session
router.post(
  "/reservations/:id/check-in",
  authenticate,
  controller.checkInReservation,
);

// ✅ CHECK-OUT → ends session
router.post(
  "/reservations/:id/check-out",
  authenticate,
  controller.checkOutReservation,
);

// ================= SESSION =================

router.get(
  "/sessions/all",
  authenticate,
  requireAdmin,
  controller.getAllSessionsAdmin,
);

router.get(
  "/sessions/stats",
  authenticate,
  requireAdmin,
  controller.getSessionStats,
);

router.get("/sessions/active", authenticate, controller.getActiveSessions);
router.get("/sessions/me", authenticate, controller.getMySessions);

router.get("/sessions/:id", authenticate, controller.getSessionById);

// ✅ ONLY END (no create)
router.post("/sessions/:id/end", authenticate, controller.endSession);

router.get("/sessions/:id/cost", authenticate, controller.getSessionCost);

router.post("/sessions/pay", authenticate, controller.payParkingSession);

// ================= ANALYTICS =================

router.get(
  "/lots/:id/stats",
  authenticate,
  requireAdmin,
  controller.getLotStats,
);

router.get(
  "/reports/daily",
  authenticate,
  requireAdmin,
  controller.getDailyReport,
);
router.get(
  "/reports/peak-hours",
  authenticate,
  requireAdmin,
  controller.getPeakHoursReport,
);

export default router;
