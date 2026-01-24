import express from "express"
import {
  register,
  verifyOTP,
  refreshToken,
  logout,
  logoutAll,
  verify2FA,
  enable2FA,
  confirm2FA,
  disable2FA,
  getSessions,
  revokeSession,
  resendOTP,
  getMe,
  googleCallback,
  appleCallback,
  verifyOTPApp,
  refreshTokenApp,
} from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/authenticate.js"
import passport from "passport"

const router = express.Router()

// Registration & verification
router.post("/register", register)
router.post("/verify-otp", verifyOTP)
router.post("/resend-otp", resendOTP)

//App
router.post("/app/verify-otp", verifyOTPApp)
router.post("/app/refresh", refreshTokenApp)

router.post("/refresh", refreshToken)
router.post("/logout", authenticate, logout)
router.post("/logout-all", authenticate, logoutAll)

// Get authenticated user data
router.get("/me", authenticate, getMe)

// Two-Factor Authentication (2FA)

// Step 1: Start 2FA setup
// - Generates a TOTP secret
// - Stores it temporarily on the user
// - Returns a QR code for authenticator apps
router.post("/2fa/enable", enable2FA)

// Step 2: Verify 2FA during login
// - Used after password authentication
// - Verifies the 6-digit OTP
// - Issues access & refresh tokens on success
router.post("/2fa/verify", verify2FA)

// Step 3: Confirm & activate 2FA
// - Verifies OTP after QR scan
// - Permanently enables 2FA for the account
router.post("/2fa/confirm", confirm2FA)

// Step 4: Disable 2FA securely
// - Requires a valid 2FA code
// - Disables 2FA and removes stored secret
router.post("/2fa/disable", disable2FA)

// Social login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
)

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  googleCallback,
)

router.get("/apple", passport.authenticate("apple"))

router.post(
  "/apple/callback",
  passport.authenticate("apple", { failureRedirect: "/login" }),
  appleCallback,
)

// Sessions
router.get("/sessions", getSessions)
router.delete("/sessions/:sessionId", revokeSession)

export default router
