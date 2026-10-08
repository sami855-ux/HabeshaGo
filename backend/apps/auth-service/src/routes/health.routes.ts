import { Router, type Request, type Response } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "auth-service",
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/ready", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ready",
    service: "auth-service",
    timestamp: new Date().toISOString(),
  });
});
