import { Router } from "express";
import {
  refresh,
  logout,
  logoutAll,
  getMe,
} from "../controllers/session.controller";
import { authenticateUser } from "../middleware/auth.middleware";

export const sessionRouter = Router();

sessionRouter.post("/refresh", refresh);
sessionRouter.post("/logout", logout);

// Authenticated endpoints
sessionRouter.post("/logout-all", authenticateUser, logoutAll);
sessionRouter.get("/me", authenticateUser, getMe);
