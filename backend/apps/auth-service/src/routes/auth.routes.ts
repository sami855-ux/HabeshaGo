import { Router, type Request, type Response } from "express";
import { requireGateway } from "@habeshago/service-auth";
import { env } from "../config/env";

export const authRouter = Router();

// Public routes (forwarded by API Gateway without client bearer token required)
authRouter.post("/register", async (req: Request, res: Response) => {
  res.status(200).json({
    message: "Registration endpoint scaffolded",
    todo: "Implement User registration logic with hashed password",
  });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  res.status(200).json({
    message: "Login endpoint scaffolded",
    todo: "Implement authentication and token issuance",
  });
});

authRouter.post("/refresh", async (req: Request, res: Response) => {
  res.status(200).json({
    message: "Refresh token endpoint scaffolded",
    todo: "Implement refresh token rotation",
  });
});

// Protected routes (require x-internal-token minted by API Gateway)
authRouter.use(requireGateway(env.INTERNAL_JWT_SECRET));

authRouter.get("/me", (req: Request, res: Response) => {
  res.status(200).json({
    user: (req as any).user,
    requestId: (req as any).id,
  });
});

authRouter.post("/logout", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Logged out successfully",
  });
});
