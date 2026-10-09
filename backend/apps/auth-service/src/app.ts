import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./observability/logger";
import {
  healthRouter,
  authRouter,
  usersRouter,
  adminStaffInvitesRouter,
  adminAuditLogsRouter,
  adminOutboxRouter,
} from "./routes";

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

  // Admin user management routes (under /api/v1/admin/users and aliased to /api/admin/users)
  app.use("/api/v1/admin/users", usersRouter);
  app.use("/api/admin/users", usersRouter);

  // Admin staff invites routes
  app.use("/api/v1/admin/staff-invites", adminStaffInvitesRouter);
  app.use("/api/admin/staff-invites", adminStaffInvitesRouter);

  // Admin audit logs routes
  app.use("/api/v1/admin/audit-logs", adminAuditLogsRouter);
  app.use("/api/admin/audit-logs", adminAuditLogsRouter);

  // Admin outbox events routes
  app.use("/api/v1/admin/outbox-events", adminOutboxRouter);
  app.use("/api/admin/outbox-events", adminOutboxRouter);

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
