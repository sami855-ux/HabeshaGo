import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./observability/logger";
import { metricsMiddleware, metricsHandler } from "./observability/metrics";
import { liveness, readiness } from "./observability/health";
import { requestId } from "./middleware/request-id";
import { securityHeaders, corsPolicy, compress } from "./middleware/security";
import { payloadLimit } from "./middleware/payload-limit";
import { ipRateLimit } from "./middleware/rate-limit";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";
import { registerRoutes } from "./proxy/register-routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as any).id,
      customProps: (req) => ({ requestId: (req as any).id }),
      autoLogging: { ignore: (req) => req.url === "/health" || req.url === "/ready" },
    }),
  );
  app.use(metricsMiddleware);

  app.get("/health", liveness);
  app.get("/ready", readiness);
  app.get("/metrics", metricsHandler);

  app.use(securityHeaders);
  app.use(corsPolicy);
  app.use(compress);
  app.use(payloadLimit);
  app.use(ipRateLimit);

  registerRoutes(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
