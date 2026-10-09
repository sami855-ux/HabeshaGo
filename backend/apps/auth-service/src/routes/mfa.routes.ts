import { Router } from "express";
import {
  mfaVerify,
  mfaRecovery,
  mfaEnrollSetup,
  mfaEnrollVerify,
  mfaStatus,
  setupMfa,
  mfaVerifySetup,
  mfaStepUp,
  disableMfa,
  mfaRegenerateRecoveryCodes,
  adminResetMfa,
} from "../controllers/mfa.controller";
import { authenticateUser } from "../middleware/auth.middleware";

export const mfaRouter = Router();

// MFA Challenge & Enrollment endpoints (Credential: mfaToken challenge or enrollment)
mfaRouter.post("/mfa/verify", mfaVerify);
mfaRouter.post("/mfa/recovery", mfaRecovery);
mfaRouter.post("/mfa/enroll/setup", mfaEnrollSetup);
mfaRouter.post("/mfa/enroll/verify", mfaEnrollVerify);

// MFA Management (Credential: access token)
mfaRouter.get("/mfa/status", authenticateUser, mfaStatus);
mfaRouter.post("/mfa/setup", authenticateUser, setupMfa);
mfaRouter.post("/mfa/verify-setup", authenticateUser, mfaVerifySetup);
mfaRouter.post("/mfa/step-up", authenticateUser, mfaStepUp);
mfaRouter.post("/mfa/disable", authenticateUser, disableMfa);
mfaRouter.post("/mfa/recovery-codes/regenerate", authenticateUser, mfaRegenerateRecoveryCodes);

// Admin MFA Reset (Credential: admin access token)
mfaRouter.post("/admin/users/:userId/mfa/reset", authenticateUser, adminResetMfa);
