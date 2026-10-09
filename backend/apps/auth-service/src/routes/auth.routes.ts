import { Router } from "express";
import {
  continueWithEmail,
  resendOtp,
  verifyOtp,
  verifyMfa,
  staffLogin,
  staffVerifyOtp,
  staffVerifyMfa,
  refresh,
  logout,
  setupMfa,
  enableMfa,
  disableMfa,
  getMe,
} from "../controllers/auth.controller";
import { authenticateUser } from "../middleware/auth.middleware";

export const authRouter = Router();


// Unified Email OTP initiation (single entry point for both register & login)
authRouter.post("/continue-with-email", continueWithEmail);
authRouter.post("/resend-otp", resendOtp);

// OTP Verification (Dual web & mobile support, checks if MFA is enabled)
authRouter.post("/verify-otp", verifyOtp);

// Staff Authentication (Email -> OTP -> MFA)
// Step 1: Staff OTP initiation (staff role check)
authRouter.post("/staff/login", staffLogin);
authRouter.post("/staff/resend-otp", staffLogin);
// Step 2: Staff OTP verification (auto-provisions MFA setup if not enabled, or requests TOTP)
authRouter.post("/staff/verify-otp", staffVerifyOtp);
authRouter.post("/staff/otp/verify", staffVerifyOtp);
// Step 3: Staff MFA verification (TOTP / Recovery code)
authRouter.post("/staff/mfa/verify", staffVerifyMfa);

// Multi-Factor Authentication Challenge Verification (Passenger / General)
authRouter.post("/mfa/verify", verifyMfa);
authRouter.post("/totp/verify", verifyMfa);

// Token Refresh (Cookie for Web, JSON body for Mobile, Token Rotation + Reuse Detection)
authRouter.post("/refresh", refresh);

// Protected routes (Require Gateway Internal Token or Client Bearer Token)
authRouter.use(authenticateUser);

authRouter.get("/me", getMe);
authRouter.post("/logout", logout);

// MFA Configuration
authRouter.post("/mfa/setup", setupMfa);
authRouter.post("/mfa/enable", enableMfa);
authRouter.post("/mfa/disable", disableMfa);
