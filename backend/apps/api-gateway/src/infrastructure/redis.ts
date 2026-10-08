import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../observability/logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  retryStrategy: (times) => Math.min(times * 200, 3000),
});

redis.on("error", (err) => logger.error({ err }, "redis error"));
redis.on("connect", () => logger.info("redis connected"));

export default redis;
