import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import express from "express";
import request from "supertest";
import { createApp } from "../../src/app";
import { env } from "../../src/config/env";
import { createServiceProxy } from "../../src/proxy/create-proxy";
import { redis } from "../../src/infrastructure/redis";

describe("Gateway Integration Tests", () => {
  let upstreamServer: http.Server;
  let upstreamPort: number;
  let upstreamUrl: string;

  beforeAll(async () => {
    // Start mock upstream server
    const upstreamApp = express();
    upstreamApp.use(express.json());

    upstreamApp.get("/api/v1/auth/login", (_req, res) => {
      res.json({ message: "login-page" });
    });

    upstreamApp.post("/api/v1/auth/login", (req, res) => {
      res.json({ token: "fake-jwt-token" });
    });

    upstreamApp.get("/api/v1/profiles/me", (req, res) => {
      res.json({
        userId: req.header("x-user-id"),
        internalToken: req.header("x-internal-token"),
        roles: req.header("x-user-roles"),
      });
    });

    upstreamApp.get("/api/v1/test/slow", (_req, res) => {
      setTimeout(() => {
        if (!res.headersSent) res.json({ ok: true });
      }, 300);
    });

    upstreamApp.get("/api/v1/test/client-error", (_req, res) => {
      res.status(400).json({ error: { code: "BAD_REQUEST", message: "Client error" } });
    });

    upstreamApp.get("/api/v1/test/server-error", (_req, res) => {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Server crash" } });
    });

    await new Promise<void>((resolve) => {
      upstreamServer = upstreamApp.listen(0, () => {
        const addr = upstreamServer.address() as any;
        upstreamPort = addr.port;
        upstreamUrl = `http://127.0.0.1:${upstreamPort}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (upstreamServer) {
      await new Promise<void>((resolve) => upstreamServer.close(() => resolve()));
    }
    await redis.quit().catch(() => undefined);
  });

  it("serves /health endpoint", async () => {
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns 404 for unmatched routes with standard error format", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/unknown-route");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.requestId).toBeDefined();
  });

  it("enforces payload limit", async () => {
    const app = createApp();
    const largeBody = "x".repeat(env.MAX_BODY_BYTES + 10);
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .set("Content-Length", String(largeBody.length))
      .send(largeBody);

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("proxies request to upstream service and handles upstream response", async () => {
    const testApp = express();
    testApp.use((req, _res, next) => {
      (req as any).id = "test-req-id";
      next();
    });

    const route = {
      name: "test-auth",
      prefix: "/api/v1/auth",
      target: upstreamUrl,
      stripPrefix: false,
      auth: "public" as const,
      timeoutMs: 5000,
      retries: 0,
    };

    const { guard, proxy } = createServiceProxy(route);
    testApp.use("/api/v1/auth", guard, proxy);

    const res = await request(testApp).post("/api/v1/auth/login");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "fake-jwt-token" });
  });

  it("maps connection refused to 503 SERVICE_UNAVAILABLE", async () => {
    const testApp = express();
    testApp.use((req, _res, next) => {
      (req as any).id = "test-req-503";
      next();
    });

    // Target a dead port
    const route = {
      name: "dead-service",
      prefix: "/api/v1/dead",
      target: "http://127.0.0.1:59999",
      stripPrefix: false,
      auth: "public" as const,
      timeoutMs: 1000,
      retries: 0,
    };

    const { guard, proxy } = createServiceProxy(route);
    testApp.use("/api/v1/dead", guard, proxy);

    const res = await request(testApp).get("/api/v1/dead/test");
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("maps upstream timeout to 504 UPSTREAM_TIMEOUT", async () => {
    const testApp = express();
    testApp.use((req, _res, next) => {
      (req as any).id = "test-req-504";
      next();
    });

    const route = {
      name: "timeout-service",
      prefix: "/api/v1/test",
      target: upstreamUrl,
      stripPrefix: false,
      auth: "public" as const,
      timeoutMs: 100, // Shorter than upstream 300ms delay
      retries: 0,
    };

    const { guard, proxy } = createServiceProxy(route);
    testApp.use("/api/v1/test", guard, proxy);

    const res = await request(testApp).get("/api/v1/test/slow");
    expect(res.status).toBe(504);
    expect(res.body.error.code).toBe("UPSTREAM_TIMEOUT");
  });

  it("does not trip circuit breaker on 4xx responses", async () => {
    const route = {
      name: "client-err-service",
      prefix: "/api/v1/test",
      target: upstreamUrl,
      stripPrefix: false,
      auth: "public" as const,
      timeoutMs: 1000,
      retries: 0,
    };

    const { guard, proxy, breaker } = createServiceProxy(route);
    const testApp = express();
    testApp.use("/api/v1/test", guard, proxy);

    const res = await request(testApp).get("/api/v1/test/client-error");
    expect(res.status).toBe(400);
    expect(breaker.getState()).toBe("closed");
  });

  it("records failure on 5xx responses", async () => {
    const route = {
      name: "server-err-service",
      prefix: "/api/v1/test",
      target: upstreamUrl,
      stripPrefix: false,
      auth: "public" as const,
      timeoutMs: 1000,
      retries: 0,
    };

    const { guard, proxy, breaker } = createServiceProxy(route);
    const testApp = express();
    testApp.use("/api/v1/test", guard, proxy);

    const res = await request(testApp).get("/api/v1/test/server-error");
    expect(res.status).toBe(500);
    // Breaker should have registered a failure
    expect(breaker.canRequest()).toBe(true); // first failure out of 5 threshold
  });
});
