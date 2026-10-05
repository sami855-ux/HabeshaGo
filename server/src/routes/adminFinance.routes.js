import express from "express"
import {
  getRevenueOverviewController,
  getDailyRevenueController,
  getProviderRevenueController,
} from "../controllers/user.controller.js"
import { authenticate, requireAdmin } from "../middlewares/authenticate.js"

const router = express.Router()

// GET /api/admin/finance/revenue-overview
router.get("/", authenticate, requireAdmin, getRevenueOverviewController)

// GET /api/admin/finance/revenue-overview/daily?days=30
router.get("/daily", authenticate, requireAdmin, getDailyRevenueController)

// GET /api/admin/finance/revenue-overview/providers
router.get("/providers", authenticate, requireAdmin, getProviderRevenueController)

export default router
