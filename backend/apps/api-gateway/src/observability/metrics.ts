import client from "prom-client";
import type { NextFunction, Request, Response } from "express";

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const httpDuration = new client.Histogram({
  name: "gateway_http_request_duration_seconds",
  help: "Request duration",
  labelNames: ["method", "route", "status", "service"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

export const breakerState = new client.Gauge({
  name: "gateway_circuit_breaker_open",
  help: "1 when the breaker for a service is open",
  labelNames: ["service"],
  registers: [registry],
});

export const rateLimited = new client.Counter({
  name: "gateway_rate_limited_total",
  help: "Requests rejected by rate limiting",
  labelNames: ["scope"],
  registers: [registry],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpDuration.startTimer();
  res.on("finish", () => {
    const service = (res.locals.serviceName as string) ?? "gateway";
    end({
      method: req.method,
      route: (res.locals.routeLabel as string) ?? "unmatched",
      status: String(res.statusCode),
      service,
    });
  });
  next();
}

export async function metricsHandler(_req: Request, res: Response) {
  res.set("Content-Type", registry.contentType);
  res.send(await registry.metrics());
}
