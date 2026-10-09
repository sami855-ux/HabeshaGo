import { Router } from "express";
import { healthRouter } from "./health.routes";
import { emailRouter } from "./email.routes";
import { staffRouter } from "./staff.routes";
import { googleRouter } from "./google.routes";
import { sessionRouter } from "./session.routes";
import { mfaRouter } from "./mfa.routes";

export const authRouter = Router();

// Mount modular sub-routers
authRouter.use(emailRouter);
authRouter.use(staffRouter);
authRouter.use(googleRouter);
authRouter.use(sessionRouter);
authRouter.use(mfaRouter);

export {
  healthRouter,
  emailRouter,
  staffRouter,
  googleRouter,
  sessionRouter,
  mfaRouter,
};
