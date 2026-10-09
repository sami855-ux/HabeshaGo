import type { Response } from "express";
import { AuthError } from "../services/token.service";

/**
 * Standardized error responder adhering to contracts and frontend needs
 */
export function sendError(res: Response, err: unknown) {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      message: err.message,
    });
  }

  const message = err instanceof Error ? err.message : "Internal authentication error";
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
    },
    message,
  });
}
