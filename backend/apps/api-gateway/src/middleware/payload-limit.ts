import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { Errors } from "../shared/errors";

export function payloadLimit(req: Request, _res: Response, next: NextFunction) {
  const length = Number(req.header("content-length") ?? 0);
  if (length > env.MAX_BODY_BYTES) return next(Errors.tooLarge());
  next();
}
