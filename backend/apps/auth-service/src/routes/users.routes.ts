import { Router } from "express";
import {
  adminSearchUsers,
  adminGetUserDetail,
  adminSuspendUser,
  adminReactivateUser,
  adminDeleteUser,
  adminResetUserMfa,
} from "../controllers/users.controller";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware";

export const usersRouter = Router();

// Protect all admin user routes
usersRouter.use(authenticateUser);
usersRouter.use(requireAdmin);

// D1. Users and status endpoints (under /api/v1/admin/users)
usersRouter.get("/", adminSearchUsers);
usersRouter.get("/:userId", adminGetUserDetail);
usersRouter.post("/:userId/suspend", adminSuspendUser);
usersRouter.post("/:userId/reactivate", adminReactivateUser);
usersRouter.post("/:userId/delete", adminDeleteUser);
usersRouter.post("/:userId/mfa/reset", adminResetUserMfa);
