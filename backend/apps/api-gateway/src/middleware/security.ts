import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "../config/env";

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
});

export const corsPolicy = cors({
  origin(origin, cb) {
    if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id", "Idempotency-Key"],
  exposedHeaders: ["X-Request-Id", "Retry-After"],
  maxAge: 600,
});

export const compress = compression({
  filter: (req, res) => {
    if (req.headers.accept === "text/event-stream") return false;
    return compression.filter(req, res);
  },
});
