import type { Request, Response } from "express";
import { redis } from "../infrastructure/redis";

export function liveness(_req: Request, res: Response) {
  res.status(200).json({ status: "ok" });
}

export async function readiness(_req: Request, res: Response) {
  try {
    await redis.ping();
    res.status(200).json({ status: "ready", checks: { redis: "up" } });
  } catch {
    res.status(503).json({ status: "not_ready", checks: { redis: "down" } });
  }
}
