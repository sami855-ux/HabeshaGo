import express from "express";
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
  appleCallback,
  verifyOTPApp,
  refreshTokenApp,
  verifyOtpPhone,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import passport from "passport";

const router = express.Router();

// Registration & verification
router.post("/register", register);
router.post("/register/phone/verify", verifyOtpPhone);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

//App
router.post("/app/verify-otp", verifyOTPApp);
router.post("/app/refresh", refreshTokenApp);

router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);

// Get authenticated user data
router.get("/me", authenticate, getMe);

// Social login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  googleCallback,
);

router.get("/apple", passport.authenticate("apple"));

router.post(
  "/apple/callback",
  passport.authenticate("apple", { failureRedirect: "/login" }),
  appleCallback,
);

// Sessions
router.get("/sessions", getSessions);
router.delete("/sessions/:sessionId", revokeSession);

export default router;
