import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  // 1. Check for API Gateway internal token
  const internalToken = req.header("x-internal-token");
  if (internalToken) {
    try {
      const claims = jwt.verify(internalToken, env.INTERNAL_JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "api-gateway",
        audience: "internal-services",
      }) as { sub: string; roles: string[]; sid?: string; rid?: string };

      (req as any).user = {
        id: claims.sub,
        roles: claims.roles,
        sessionId: claims.sid,
      };
      (req as any).id = claims.rid || req.header("x-request-id");
      return next();
    } catch {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid or expired internal gateway token" },
        message: "Invalid or expired internal gateway token",
      });
    }
  }

  // 2. Check for direct client Bearer token
  const authHeader = req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const claims = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        algorithms: ["HS256"],
      }) as { sub: string; roles: string[]; sid?: string };

      (req as any).user = {
        id: claims.sub,
        roles: claims.roles,
        sessionId: claims.sid,
      };
      return next();
    } catch {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid or expired access token" },
        message: "Invalid or expired access token",
      });
    }
  }

  return res.status(401).json({
    success: false,
    error: { code: "UNAUTHORIZED", message: "Authentication required" },
    message: "Authentication required",
  });
}
