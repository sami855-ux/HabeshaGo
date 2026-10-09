import { Router } from "express";
import { getAuditLogs } from "../controllers/audit-logs.controller";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware";

export const adminAuditLogsRouter = Router();

adminAuditLogsRouter.use(authenticateUser);
adminAuditLogsRouter.use(requireAdmin);

// Under /api/v1/admin/audit-logs
adminAuditLogsRouter.get("/", getAuditLogs);
