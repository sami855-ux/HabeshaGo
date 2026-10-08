import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import type { AuthUser } from "../shared/types";

export const STRIPPED_HEADERS = [
  "x-user-id",
  "x-user-roles",
  "x-session-id",
  "x-internal-token",
  "x-forwarded-user",
];

export function signInternalToken(user: AuthUser, requestId: string) {
  return jwt.sign(
    { sub: user.id, roles: user.roles, sid: user.sessionId, rid: requestId },
    env.INTERNAL_JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: env.INTERNAL_TOKEN_TTL_SECONDS,
      issuer: "api-gateway",
      audience: "internal-services",
    },
  );
}

export function identityHeaders(req: Request, _res: Response, next: NextFunction) {
  for (const name of STRIPPED_HEADERS) delete req.headers[name];

  if (req.user) {
    req.headers["x-internal-token"] = signInternalToken(req.user, req.id);
    req.headers["x-user-id"] = req.user.id;
    req.headers["x-user-roles"] = req.user.roles.join(",");
  }

  req.headers["x-request-id"] = req.id;
  next();
}
