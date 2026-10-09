import { Router } from "express";
import { healthRouter } from "./health.routes";
import { emailRouter } from "./email.routes";
import { staffRouter } from "./staff.routes";
import { googleRouter } from "./google.routes";
import { sessionRouter } from "./session.routes";
import { mfaRouter } from "./mfa.routes";
import { usersRouter } from "./users.routes";
import {
  publicStaffInvitesRouter,
  adminStaffInvitesRouter,
} from "./staff-invites.routes";
import { adminOutboxRouter } from "./outbox.routes";
import { adminAuditLogsRouter } from "./audit-logs.routes";

export const authRouter = Router();

// Mount modular sub-routers
authRouter.use(emailRouter);
authRouter.use(staffRouter);
authRouter.use(googleRouter);
authRouter.use(sessionRouter);
authRouter.use(mfaRouter);
authRouter.use(publicStaffInvitesRouter); // POST /staff-invites/accept

export {
  healthRouter,
  emailRouter,
  staffRouter,
  googleRouter,
  sessionRouter,
  mfaRouter,
  usersRouter,
  publicStaffInvitesRouter,
  adminStaffInvitesRouter,
  adminOutboxRouter,
  adminAuditLogsRouter,
};
