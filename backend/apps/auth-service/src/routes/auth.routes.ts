import { Router } from "express";
import {
  continueWithEmail,
  resendOtp,
  verifyOtp,
  verifyMfa,
  refresh,
  logout,
  setupMfa,
  enableMfa,
  disableMfa,
  getMe,
} from "../controllers/auth.controller";
import { authenticateUser } from "../middleware/auth.middleware";

export const authRouter = Router();

// Public routes (No bearer token required)

// Unified Email OTP initiation (single entry point for both register & login)
authRouter.post("/continue-with-email", continueWithEmail);
authRouter.post("/resend-otp", resendOtp);

// OTP Verification (Dual web & mobile support, checks if MFA is enabled)
authRouter.post("/verify-otp", verifyOtp);

// Multi-Factor Authentication Challenge Verification
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
