import { Router } from "express";
import {
  createInvite,
  listInvites,
  cancelInvite,
  acceptInvite,
} from "../controllers/staff-invites.controller";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware";

// Public route for staff invite accept (mounted under /api/v1/auth)
export const publicStaffInvitesRouter = Router();
publicStaffInvitesRouter.post("/staff-invites/accept", acceptInvite);

// Admin router for staff invite management (mounted under /api/v1/admin/staff-invites)
export const adminStaffInvitesRouter = Router();
adminStaffInvitesRouter.use(authenticateUser);
adminStaffInvitesRouter.use(requireAdmin);

adminStaffInvitesRouter.post("/", createInvite);
adminStaffInvitesRouter.get("/", listInvites);
adminStaffInvitesRouter.delete("/:inviteId", cancelInvite);
