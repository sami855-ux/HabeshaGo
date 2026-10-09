import { Router } from "express";
import {
  staffLogin,
  staffVerifyOtp,
} from "../controllers/staff.controller";

export const staffRouter = Router();

staffRouter.post("/staff/login", staffLogin);
staffRouter.post("/staff/resend-otp", staffLogin);
staffRouter.post("/staff/verify-otp", staffVerifyOtp);
