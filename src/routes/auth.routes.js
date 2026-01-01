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
  googleCallback,
  verifyOTPApp,
  refreshTokenApp,
} from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/authenticate.js"
import passport from "passport"

const router = express.Router()

// Registration & verification
router.post("/register", register) // passed
router.post("/verify-otp", verifyOTP) // passed
router.post("/resend-otp", resendOTP) // passed

//App
router.post("/app/verify-otp", verifyOTPApp)
router.post("/app/refresh", refreshTokenApp)

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

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
)

// Sessions
router.get("/sessions", getSessions)
router.delete("/sessions/:sessionId", revokeSession)

export default router
