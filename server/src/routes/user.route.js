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
import { authenticate } from "../middlewares/authenticate.js"
import { upload } from "../config/multer.js"

const router = express.Router()

// Define user-related routes here

// Get all users for the administrator
router.get("/", getAllUsers)

//update user
router.patch(
  "/me/profile",
  authenticate,
  upload.single("avatar"),
  updateMyProfile,
)

//Get formatted user for the drivers page
router.get("/formatted-users", getformattedUsers)

// GET /api/users/by-phone?phone=+2519
router.get("/by-phone", getUsersByPhone)

//Send OTP for email or phone verification
router.post("/me/send-otp", authenticate, sendOtp)

//Verify OTP for email
router.post("/me/verify-otp", authenticate, verifyOtp)

// Verify Phone otp
router.post("/me/phone/verify", authenticate, verifyOtpPhone)

//Delete user (soft delete)
router.delete("/:id", deleteUser)

//Stats
router.get("/transport-stats", authenticate, getTransportStats)

//ADMIN
router.get("/admin/finance/revenue-overview", getRevenueOverviewController)

// GET /api/admin/finance/revenue-overview/daily?days=30
router.get("/revenue-overview/daily", getDailyRevenueController)

// GET /api/admin/finance/revenue-overview/providers
router.get("/revenue-overview/providers", getProviderRevenueController)

export default router
