import type { NextFunction, Request, Response } from "express";
import type { ServiceRoute } from "../config/services";
import { Errors } from "../shared/errors";

export function authorize(route: ServiceRoute) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!route.roles?.length || !req.user) return next();
    const allowed = req.user.roles.some((r) => route.roles!.includes(r));
    if (!allowed) return next(Errors.forbidden());
    next();
  };
}
