import express from "express"
import {
  getAuditLogs,
  getAuditLogsByEntity,
  getParkingLotsForMap,
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

// Map view endpoint
router.get("/map-view", getParkingLotsForMap)

export default router
