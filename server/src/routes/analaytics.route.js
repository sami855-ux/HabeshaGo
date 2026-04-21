import express from "express"
import { authenticate } from "../middlewares/authenticate.js"
import {
  getDashboardAnalytics,
  getDashboardSummary,
  getManagerChargingPoints,
  getManagerPayments,
  getManagerReservations,
  getManagerSessions,
  getManagerStations,
  getPaymentStats,
  getRecentSessions,
  getReservationFunnel,
  getStationPerformance,
  getTrends,
} from "../controllers/analytics.controller.js"

const router = express.Router()

// GET /api/stations/performance
router.get("/ev/stations/performance", authenticate, getStationPerformance)

// GET /api/analytics/stations
router.get("/ev/stations", authenticate, getManagerStations)

// GET /api/analytics/charging-points
router.get("/ev/charging-points", authenticate, getManagerChargingPoints)

router.get("/ev/sessions/recent", authenticate, getRecentSessions)

router.get("/ev/sessions", authenticate, getManagerSessions)

router.get("/ev/payments", authenticate, getManagerPayments)

router.get("/ev/reservations", authenticate, getManagerReservations)

// GET /api/dashboard/summary
router.get("/ev/dashboard/summary", authenticate, getDashboardSummary)

router.get("/ev/dashboard", authenticate, getDashboardAnalytics)

router.get("/ev/payments/stats", authenticate, getPaymentStats)

router.get("/ev/reservations/funnel", authenticate, getReservationFunnel)

// GET /api/analytics/trends
router.get("/ev/trends", authenticate, getTrends)

export default router
