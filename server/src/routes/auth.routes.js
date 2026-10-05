import express from "express"
import {
  register,
  verifyOTP,
  refreshToken,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
  resendOTP,
  getMe,
  googleCallback,
  verifyOTPApp,
  refreshTokenApp,
  verifyOtpPhone,
  verifyAppOtpPhone,
  appleAuth,
  googleMobileAuth,
  exchangeOAuthCode,
  staffLogin,
  staffVerifyMFA,
  staffResendMFA,
  staffChangePassword,
  staffSetupTOTP,
  staffViewQRPage,
  staffEnableTOTP,
  adminSetStaffPassword,
} from "../controllers/auth.controller.js"
import {
  authenticate,
  requireAdmin,
  restrictTo,
} from "../middlewares/authenticate.js"
import { STAFF_ROLES } from "../utils/constants.js"
import passport from "passport"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Strict rate limit for brute-force sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later." },
})

// Registration & verification (rate-limited)
router.post("/register", authLimiter, register)
router.post("/register/phone/verify", authLimiter, verifyOtpPhone)
router.post("/app/register/phone/verify", authLimiter, verifyAppOtpPhone)
router.post("/verify-otp", authLimiter, verifyOTP)
router.post("/resend-otp", authLimiter, resendOTP)

// App
router.post("/app/verify-otp", authLimiter, verifyOTPApp)
router.post("/app/refresh", refreshTokenApp)

router.post("/refresh", refreshToken)
router.post("/logout", authenticate, logout)
router.post("/logout-all", authenticate, logoutAll)

// Get authenticated user data
router.get("/me", authenticate, getMe)

router.post("/mobile/google", googleMobileAuth)

// Social login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
)

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleCallback,
)

// Contniue with Apple
router.post("/apple", appleAuth)

router.get("/exchange", exchangeOAuthCode)

// Sessions
router.get("/sessions", authenticate, getSessions)
router.delete("/sessions/:sessionId", authenticate, revokeSession)

// ==========================================
// STAFF AUTHENTICATION & MULTI-FACTOR AUTH
// (DRIVER, ADMIN, EV_CHARGER_MANAGER, PARKING_MANAGER)
// ==========================================

// Step 1: Staff login with email & password -> sends MFA code & returns mfaToken
router.post("/staff/login", authLimiter, staffLogin)

// Step 2: Verify MFA code (Email OTP or Authenticator App TOTP) -> issues tokens
router.post("/staff/mfa/verify", authLimiter, staffVerifyMFA)

// Resend MFA code if expired or unreceived
router.post("/staff/mfa/resend", authLimiter, staffResendMFA)

// Staff password self-management
router.post(
  "/staff/change-password",
  authenticate,
  restrictTo(...STAFF_ROLES),
  staffChangePassword,
)

// Staff TOTP Authenticator App setup & activation
router.get(
  "/staff/totp/setup",
  authenticate,
  restrictTo(...STAFF_ROLES),
  staffSetupTOTP,
)
router.get(
  "/staff/totp/view",
  authenticate,
  restrictTo(...STAFF_ROLES),
  staffViewQRPage,
)
router.post(
  "/staff/totp/enable",
  authenticate,
  restrictTo(...STAFF_ROLES),
  staffEnableTOTP,
)

// Admin set/reset password for staff members
router.post(
  "/staff/admin/set-password",
  authenticate,
  requireAdmin,
  adminSetStaffPassword,
)

export default router
