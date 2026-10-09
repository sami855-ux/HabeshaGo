import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./observability/logger";
import { healthRouter, authRouter } from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.header("x-request-id") || (req as any).id,
      customProps: (req) => ({ requestId: req.header("x-request-id") || (req as any).id }),
      autoLogging: { ignore: (req) => req.url === "/health" || req.url === "/ready" },
    }),
  );

  // Health and readiness probes
  app.use("/", healthRouter);

  // Auth routes (prefixed as /api/v1/auth and aliased to /api/auth)
  app.use("/api/v1/auth", authRouter);
  app.use("/api/auth", authRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `Route ${req.method} ${req.path} not found on auth-service`,
      },
    });
  });

  return app;
}
