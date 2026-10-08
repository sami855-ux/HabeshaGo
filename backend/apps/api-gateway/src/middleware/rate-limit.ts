import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import type { Request } from "express";
import { redis } from "../infrastructure/redis";
import { env } from "../config/env";
import { rateLimited } from "../observability/metrics";
import { Errors } from "../shared/errors";

function store(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as Promise<any>,
  });
}

export const ipRateLimit = rateLimit({
  windowMs: 60_000,
  limit: env.RATE_LIMIT_IP_PER_MINUTE,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: store("rl:ip:"),
  passOnStoreError: true,
  handler: (_req, _res, next) => {
    rateLimited.inc({ scope: "ip" });
    next(Errors.tooMany());
  },
});

export const userRateLimit = rateLimit({
  windowMs: 60_000,
  limit: env.RATE_LIMIT_USER_PER_MINUTE,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: store("rl:user:"),
  passOnStoreError: true,
  keyGenerator: (req: Request) => req.user?.id ?? req.ip ?? "anonymous",
  skip: (req: Request) => !req.user,
  handler: (_req, _res, next) => {
    rateLimited.inc({ scope: "user" });
    next(Errors.tooMany());
  },
});

export const strictAuthRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: store("rl:auth:"),
  passOnStoreError: true,
  handler: (_req, _res, next) => {
    rateLimited.inc({ scope: "auth" });
    next(Errors.tooMany());
  },
});
