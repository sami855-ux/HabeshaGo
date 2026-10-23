import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

export interface AuthenticatedUser {
  id: string;
  roles: string[];
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      id?: string;
    }
  }
}

export function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  // 1. Check for API Gateway forwarded identity headers
  const userIdHeader = req.header("x-user-id");
  if (userIdHeader) {
    const rolesHeader = req.header("x-user-roles") || "";
    const roles = rolesHeader
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    req.user = {
      id: userIdHeader,
      roles,
    };
    req.id = req.header("x-request-id") || req.id;
    return next();
  }

  // 2. Check for API Gateway internal token
  const internalToken = req.header("x-internal-token");
  if (internalToken) {
    try {
      const claims = jwt.verify(internalToken, env.INTERNAL_JWT_SECRET, {
        algorithms: ["HS256"],
      }) as { sub: string; roles: string[]; sid?: string; rid?: string };

      req.user = {
        id: claims.sub,
        roles: claims.roles || [],
        sessionId: claims.sid,
      };
      req.id = claims.rid || req.header("x-request-id") || req.id;
      return next();
    } catch {
      return next(new UnauthorizedError("Invalid or expired internal gateway token"));
    }
  }

  // 3. Check for Bearer token (direct access / tests)
  const authHeader = req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const claims = jwt.verify(token, env.INTERNAL_JWT_SECRET, {
        algorithms: ["HS256"],
      }) as { sub: string; roles?: string[]; sid?: string };

      req.user = {
        id: claims.sub,
        roles: claims.roles || [],
        sessionId: claims.sid,
      };
      return next();
    } catch {
      return next(new UnauthorizedError("Invalid or expired access token"));
    }
  }

  return next(new UnauthorizedError("Missing or invalid access token"));
}

export function requireStaff(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return next(new UnauthorizedError("Missing or invalid access token"));
  }

  const roles = (req.user.roles || []).map((r) => r.toUpperCase());
  const isStaff = roles.includes("ADMIN") || roles.includes("EMPLOYEE");

  if (!isStaff) {
    return next(new ForbiddenError("Role not allowed"));
  }

  return next();
}

export function requireInternalToken(req: Request, _res: Response, next: NextFunction) {
  const token =
    req.header("x-internal-token") ||
    req.header("x-service-token") ||
    (req.header("authorization")?.startsWith("Bearer ")
      ? req.header("authorization")?.slice(7)
      : undefined);

  if (!token) {
    return next(new UnauthorizedError("Missing or invalid internal service token"));
  }

  if (token === env.INTERNAL_SERVICE_TOKEN) {
    return next();
  }

  try {
    jwt.verify(token, env.INTERNAL_JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return next();
  } catch {
    return next(new UnauthorizedError("Missing or invalid internal service token"));
  }
}
