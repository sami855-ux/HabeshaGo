import type { NextFunction, Request, Response } from "express";
import { Errors } from "../shared/errors";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(Errors.notFound());
}
