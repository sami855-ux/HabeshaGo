import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";
import { logger } from "../observability/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    const errorBody: Record<string, unknown> = {
      code: err.code,
      message: err.message,
    };
    if (err.details && err.details.length > 0) {
      errorBody.details = err.details;
    }
    return res.status(err.statusCode).json({
      success: false,
      error: errorBody,
    });
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      field: i.path.join("."),
      issue: i.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Body or query failed validation",
        details,
      },
    });
  }

  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid JSON payload",
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const targets = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "Field";
      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: `${targets} already in use`,
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Record not found",
        },
      });
    }
  }

  logger.error({ err, path: req.path, method: req.method }, "Unhandled server error");

  const message =
    err instanceof Error && process.env.NODE_ENV !== "production"
      ? err.message
      : "Internal server error";

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
    },
  });
}
