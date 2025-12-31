import express from "express"
import {
  register,
  verifyOTP,
  refreshToken,
  logout,
  logoutAll,
  socialLogin,
  verify2FA,
  enable2FA,
  confirm2FA,
  disable2FA,
  getSessions,
  revokeSession,
  resendOTP,
  getMe,
} from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// Registration & verification
router.post("/register", register) // passed
router.post("/verify-otp", verifyOTP) // passed
router.post("/resend-otp", resendOTP) // passed

router.post("/refresh", refreshToken)
router.post("/logout", authenticate, logout)
router.post("/logout-all", authenticate, logoutAll)

// Get authenticated user data
router.get("/me", authenticate, getMe)

// 2FA
router.post("/2fa/verify", verify2FA)
router.post("/2fa/enable", enable2FA)
router.post("/2fa/confirm", confirm2FA)
router.post("/2fa/disable", disable2FA)

// Social login
router.post("/social/:provider", socialLogin)

// Sessions
router.get("/sessions", getSessions)
router.delete("/sessions/:sessionId", revokeSession)

export default router
