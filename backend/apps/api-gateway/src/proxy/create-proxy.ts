import { createProxyMiddleware } from "http-proxy-middleware";
import type { Request, Response } from "express";
import type { ServerResponse } from "node:http";
import type { ServiceRoute } from "../config/services";
import { CircuitBreaker } from "./circuit-breaker";
import { Errors, HttpError } from "../shared/errors";
import { logger } from "../observability/logger";

function sendError(res: ServerResponse, err: HttpError, requestId: string) {
  if (res.headersSent) return;
  res.statusCode = err.status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: { code: err.code, message: err.message, requestId } }));
}

export function createServiceProxy(route: ServiceRoute) {
  const breaker = new CircuitBreaker(route.name);

  const guard = (req: Request, res: Response, next: (e?: unknown) => void) => {
    res.locals.serviceName = route.name;
    res.locals.routeLabel = route.prefix;
    if (!breaker.canRequest()) return next(Errors.unavailable(route.name));
    req.url = req.originalUrl;
    next();
  };

  const proxy = createProxyMiddleware<Request, Response>({
    target: route.target,
    changeOrigin: true,
    ws: route.websocket ?? false,
    xfwd: true,
    proxyTimeout: route.timeoutMs,
    pathRewrite: route.stripPrefix
      ? (path) => path.replace(new RegExp(`^${route.prefix}`), "") || "/"
      : undefined,
    on: {
      proxyRes(proxyRes) {
        if ((proxyRes.statusCode ?? 500) >= 500) breaker.failure();
        else breaker.success();
      },
      error(err, req, res) {
        breaker.failure();
        const requestId = (req as Request).id;
        logger.error({ err, requestId, service: route.name }, "proxy error");
        const code = (err as NodeJS.ErrnoException).code;
        const mapped =
          code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT"
            ? Errors.timeout(route.name)
            : code === "ECONNREFUSED" || code === "ENOTFOUND"
              ? Errors.unavailable(route.name)
              : Errors.badGateway(route.name);
        sendError(res as ServerResponse, mapped, requestId);
      },
    },
  });

  return { guard, proxy, breaker };
}
