import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { Errors } from "../shared/errors";
import type { ServiceRoute } from "../config/services";

interface AccessClaims {
  sub?: string;
  id?: string;
  roles?: string[];
  role?: string;
  sid?: string;
  sessionId?: string;
}

export function isPublic(route: ServiceRoute, req: Request): boolean {
  if (route.auth === "public") return true;
  return (route.publicRules ?? []).some(
    (rule) => rule.method === req.method && rule.path.test(req.baseUrl + req.path),
  );
}

export function authenticate(route: ServiceRoute) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (isPublic(route, req)) return next();

    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) return next(Errors.unauthorized());

    try {
      const claims = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET, {
        algorithms: ["HS256", "HS512"],
      }) as AccessClaims;

      const userId = claims.sub || claims.id || "";
      const roles = Array.isArray(claims.roles)
        ? claims.roles
        : claims.role
          ? [claims.role]
          : [];
      const sessionId = claims.sid || claims.sessionId;

      req.user = { id: userId, roles, sessionId };
      next();
    } catch {
      next(Errors.unauthorized("Invalid or expired token"));
    }
  };
}
