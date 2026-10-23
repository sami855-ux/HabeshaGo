import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./observability/logger";
import { prisma } from "./prisma";
import { createRedisStreamBroker } from "@habeshago/redis-stream";
import { startOutboxRelay } from "./services/outbox-relay.service";
import { startAuthEventListener } from "./workers/event-listener.worker";

const app = createApp();

const broker = createRedisStreamBroker({
  redisUrl: env.REDIS_URL,
  upstashRestUrl: env.UPSTASH_REDIS_REST_URL,
  upstashRestToken: env.UPSTASH_REDIS_REST_TOKEN,
});

// Start background workers
const stopOutboxRelay = startOutboxRelay(prisma, broker);
const stopEventListener = startAuthEventListener(broker);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, service: "profile-service" }, "profile service listening with Redis Streams enabled");
});

async function shutdown(signal: string) {
  logger.info({ signal }, "received shutdown signal, gracefully closing profile-service");

  // 1. Stop background loops
  stopOutboxRelay();
  stopEventListener();

  // 2. Disconnect broker
  await broker.disconnect().catch((err: any) => {
    logger.error({ err }, "Error closing Redis Stream broker");
  });

  // 3. Close database connection
  await prisma.$disconnect().catch((err: any) => {
    logger.error({ err }, "Error disconnecting Prisma");
  });

  // 4. Close HTTP server
  server.close(() => {
    logger.info("profile-service server closed successfully");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
