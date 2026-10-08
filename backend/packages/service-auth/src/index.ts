import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export function requireGateway(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("x-internal-token");
    if (!token) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Missing internal token" },
      });
    }

    try {
      const claims = jwt.verify(token, secret, {
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
      next();
    } catch {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid or expired internal token" },
      });
    }
  };
}
