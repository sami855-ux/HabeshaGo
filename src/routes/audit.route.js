import express from "express"
import {
  getAuditLogs,
  getAuditLogsByEntity,
} from "../controllers/auditLog.controller.js"
import { authenticate, requireAdmin } from "../middlewares/authenticate.js"

const router = express.Router()

router.get("/audit-logs", authenticate, requireAdmin, getAuditLogs)
router.get(
  "/audit-logs/:entityType/:entityId",
  authenticate,
  requireAdmin,
  getAuditLogsByEntity,
)

export default router
