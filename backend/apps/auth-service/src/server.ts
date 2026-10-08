import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./observability/logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, service: "auth-service" }, "auth service listening");
});

function shutdown(signal: string) {
  logger.info({ signal }, "received shutdown signal, closing auth-service server");
  server.close(() => {
    logger.info("auth-service server closed successfully");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
