import { Router } from "express";
import {
  continueWithEmail,
  resendOtp,
  verifyOtp,
} from "../controllers/email.controller";

export const emailRouter = Router();

emailRouter.post("/continue-with-email", continueWithEmail);
emailRouter.post("/resend-otp", resendOtp);
emailRouter.post("/verify-otp", verifyOtp);
