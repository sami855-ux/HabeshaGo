import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma";

export const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "profile-service",
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/ready", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ready",
      service: "profile-service",
      database: "healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      status: "not_ready",
      service: "profile-service",
      database: "unhealthy",
      timestamp: new Date().toISOString(),
    });
  }
});
