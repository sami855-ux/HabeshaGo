import express from "express"
import {
  deleteUser,
  getAllUsers,
  updateMyProfile,
  sendOtp,
  verifyOtp,
  getUsersByPhone,
  verifyOtpPhone,
  getTransportStats,
  getformattedUsers,
  getRevenueOverviewController,
  getDailyRevenueController,
  getProviderRevenueController,
} from "../controllers/user.controller.js"
import { authenticate, requireAdmin } from "../middlewares/authenticate.js"
import { upload } from "../config/multer.js"

const router = express.Router()

// Get all users for the administrator
router.get("/", authenticate, requireAdmin, getAllUsers)

// Update user profile
router.patch(
  "/me/profile",
  authenticate,
  upload.single("avatar"),
  updateMyProfile,
)

// Get formatted users for the drivers page
router.get("/formatted-users", authenticate, getformattedUsers)

// GET /api/users/by-phone?phone=+2519
router.get("/by-phone", authenticate, getUsersByPhone)

// Send OTP for email or phone verification
router.post("/me/send-otp", authenticate, sendOtp)

// Verify OTP for email
router.post("/me/verify-otp", authenticate, verifyOtp)

// Verify Phone OTP
router.post("/me/phone/verify", authenticate, verifyOtpPhone)

// Delete user (soft delete) - Admin only
router.delete("/:id", authenticate, requireAdmin, deleteUser)

// Stats
router.get("/transport-stats", authenticate, getTransportStats)

// Revenue overview (admin)
router.get(
  "/admin/finance/revenue-overview",
  authenticate,
  requireAdmin,
  getRevenueOverviewController,
)
router.get(
  "/admin/finance/revenue-overview/daily",
  authenticate,
  requireAdmin,
  getDailyRevenueController,
)
router.get(
  "/admin/finance/revenue-overview/providers",
  authenticate,
  requireAdmin,
  getProviderRevenueController,
)

// Aliases
router.get(
  "/revenue-overview",
  authenticate,
  requireAdmin,
  getRevenueOverviewController,
)
router.get(
  "/revenue-overview/daily",
  authenticate,
  requireAdmin,
  getDailyRevenueController,
)
router.get(
  "/revenue-overview/providers",
  authenticate,
  requireAdmin,
  getProviderRevenueController,
)

export default router
