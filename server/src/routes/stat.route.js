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
  restrictTo("ADMIN"),
  getFinancialSummary,
)

router.get(
  "/providers-performance",
  authenticate,
  restrictTo("ADMIN"),
  getProvidersPerformance,
)

router.get(
  "/revenue-trends",
  authenticate,
  restrictTo("ADMIN"),
  getRevenueTrends,
)

router.get(
  "/commission-report",
  authenticate,
  restrictTo("ADMIN"),
  getCommissionReport,
)
router.get(
  "/commission-summary",
  authenticate,
  restrictTo("ADMIN"),
  getCommissionSummary,
)

router.get(
  "/wallet-summary",
  authenticate,
  restrictTo("ADMIN"),
  getWalletSummary,
)
router.get(
  "/wallet-earnings",
  authenticate,
  restrictTo("ADMIN"),
  getWalletEarnings,
)
router.get("/withdrawals", authenticate, restrictTo("ADMIN"), getWithdrawals)

router.get("/kpis", authenticate, restrictTo("ADMIN"), getKpis)

export default router
