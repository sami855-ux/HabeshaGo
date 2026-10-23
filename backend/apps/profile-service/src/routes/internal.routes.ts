import { Router } from "express";
import { requireInternalToken } from "../middleware/auth.middleware";
import { internalController, eventsController } from "../controllers";

export const internalRouter = Router();

internalRouter.use(requireInternalToken);

// Service-to-service profile lookups
internalRouter.get("/profiles/:userId", internalController.getProfileById);
internalRouter.post("/profiles/batch", internalController.getBatchProfiles);

// Additional service-to-service helpers
internalRouter.get("/preferences/:userId", internalController.getPreferencesById);
internalRouter.get("/emergency-contacts/:userId", internalController.getContactsById);

// Event delivery from auth outbox / message relay
internalRouter.post("/events", eventsController.ingestEvent);
