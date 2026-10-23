import { Router } from "express";
import { healthRouter } from "./health.routes";
import { profileRouter } from "./profile.routes";
import { adminRouter } from "./admin.routes";
import { internalRouter } from "./internal.routes";

export const apiRouter = Router();

apiRouter.use(profileRouter);
apiRouter.use("/admin", adminRouter);

export {
  healthRouter,
  profileRouter,
  adminRouter,
  internalRouter,
};
