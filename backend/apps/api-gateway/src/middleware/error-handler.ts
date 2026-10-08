import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../shared/errors";
import { logger } from "../observability/logger";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;

  if (err instanceof HttpError) {
    if (err.status >= 500) logger.error({ err, requestId: req.id }, err.message);
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, requestId: req.id, details: err.details },
    });
  }

  logger.error({ err, requestId: req.id }, "unhandled error");
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong", requestId: req.id },
  });
}
