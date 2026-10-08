import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../observability/logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  retryStrategy: (times) => Math.min(times * 200, 3000),
});

let lastErrorLogTime = 0;
const ERROR_LOG_THROTTLE_MS = 10_000;

redis.on("error", (err) => {
  const now = Date.now();
  if (now - lastErrorLogTime > ERROR_LOG_THROTTLE_MS) {
    lastErrorLogTime = now;
    logger.error({ err }, "Redis connection failed. Rate limiting operates in fallback mode.");
  }
});

redis.on("connect", () => {
  lastErrorLogTime = 0;
  logger.info("Redis connected successfully");
});

export default redis;
