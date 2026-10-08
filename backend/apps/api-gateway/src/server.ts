import http from "node:http";
import { randomUUID } from "node:crypto";
import type { Duplex } from "node:stream";
import jwt from "jsonwebtoken";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./observability/logger";
import { redis } from "./infrastructure/redis";
import { wsRoutes } from "./proxy/register-routes";
import { STRIPPED_HEADERS, signInternalToken } from "./middleware/identity-headers";

const app = createApp();
export const server = http.createServer(app);

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;
server.requestTimeout = 30_000;

function rejectUpgrade(socket: Duplex, status: string) {
  socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", "http://gateway");
  const match = wsRoutes.find((r) => url.pathname.startsWith(r.route.prefix));
  if (!match) return rejectUpgrade(socket, "404 Not Found");

  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : url.searchParams.get("access_token");
  if (!token) return rejectUpgrade(socket, "401 Unauthorized");

  try {
    const claims = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    }) as { sub: string; roles?: string[]; sid?: string };

    const user = { id: claims.sub, roles: claims.roles ?? [], sessionId: claims.sid };

    for (const name of STRIPPED_HEADERS) delete req.headers[name];
    req.headers["x-internal-token"] = signInternalToken(user, randomUUID());
    req.headers["x-user-id"] = user.id;
    req.headers["x-user-roles"] = user.roles.join(",");

    url.searchParams.delete("access_token");
    req.url = url.pathname + url.search;

    match.proxy.upgrade?.(req, socket as any, head);
  } catch {
    rejectUpgrade(socket, "401 Unauthorized");
  }
});

if (process.env.NODE_ENV !== "test") {
  server.listen(env.PORT, () => logger.info({ port: env.PORT }, "api gateway listening"));
}

let shuttingDown = false;

export async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutting down");

  const force = setTimeout(() => {
    logger.error("forced shutdown");
    process.exit(1);
  }, 15_000);
  force.unref();

  server.close(async () => {
    await redis.quit().catch(() => undefined);
    clearTimeout(force);
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.error({ err }, "unhandled rejection");
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaught exception");
  process.exit(1);
});
