import type { Request, Response } from "express";

export function sendSuccess(
  res: Response,
  data: unknown,
  meta?: unknown,
  status = 200,
) {
  const body: Record<string, unknown> = {
    success: true,
    data,
  };
  if (meta !== undefined) {
    body.meta = meta;
  }
  return res.status(status).json(body);
}

export function getUserId(req: Request): string {
  return req.user?.id || (req.header("x-user-id") as string);
}

export function getCorrelationId(req: Request): string | undefined {
  const id = req.header("x-correlation-id") || req.header("x-request-id") || req.id;
  return id ? String(id) : undefined;
}
