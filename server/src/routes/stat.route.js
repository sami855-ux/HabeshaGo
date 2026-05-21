import express from "express"
import { authenticate, restrictTo } from "../middlewares/authenticate.js"
import {
  getCommissionReport,
  getCommissionSummary,
  getFinancialSummary,
  getKpis,
  getProvidersPerformance,
  getRevenueTrends,
  getWalletEarnings,
  getWalletSummary,
  getWithdrawals,
} from "../controllers/stat.controller.js"

const router = express.Router()

router.get(
  "/financial-summary",
  authenticate,

  getFinancialSummary,
)

router.get(
  "/providers-performance",
  authenticate,

  getProvidersPerformance,
)

router.get(
  "/revenue-trends",
  authenticate,

  getRevenueTrends,
)

router.get(
  "/commission-report",
  authenticate,

  getCommissionReport,
)
router.get(
  "/commission-summary",
  authenticate,

  getCommissionSummary,
)

router.get(
  "/wallet-summary",
  authenticate,

  getWalletSummary,
)
router.get(
  "/wallet-earnings",
  authenticate,

  getWalletEarnings,
)
router.get("/withdrawals", authenticate, getWithdrawals)

router.get("/kpis", getKpis)

export default router
