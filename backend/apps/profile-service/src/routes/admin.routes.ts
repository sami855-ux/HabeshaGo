import { Router } from "express";
import { authenticateUser, requireStaff } from "../middleware/auth.middleware";
import { adminController } from "../controllers";

export const adminRouter = Router();

adminRouter.use(authenticateUser);
adminRouter.use(requireStaff);

// Routes when mounted at prefix containing /profiles
adminRouter.get("/profiles", adminController.searchProfiles);
adminRouter.get("/profiles/:userId", adminController.getProfileById);

// Direct routes if mounted specifically at /admin/profiles
adminRouter.get("/", adminController.searchProfiles);
adminRouter.get("/:userId", adminController.getProfileById);
