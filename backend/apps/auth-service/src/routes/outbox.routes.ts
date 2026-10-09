import { Router } from "express";
import {
  getOutboxEvents,
  retryEvent,
} from "../controllers/outbox.controller";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware";

export const adminOutboxRouter = Router();

adminOutboxRouter.use(authenticateUser);
adminOutboxRouter.use(requireAdmin);

// Under /api/v1/admin/outbox-events
adminOutboxRouter.get("/", getOutboxEvents);
adminOutboxRouter.post("/:eventId/retry", retryEvent);
