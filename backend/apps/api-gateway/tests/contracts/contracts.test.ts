import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import net from "node:net";
import { services } from "../../src/config/services";
import { env } from "../../src/config/env";
import { signInternalToken } from "../../src/middleware/identity-headers";
import { errorResponseSchema, requireGateway } from "@habeshago/api-contracts";
import { Errors } from "../../src/shared/errors";
import { server } from "../../src/server";
import jwt from "jsonwebtoken";
import express from "express";
import request from "supertest";

describe("Gateway Contract Tests", () => {
  let gatewayPort: number;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        gatewayPort = (server.address() as net.AddressInfo).port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe("Service Table Contracts", () => {
    it("defines valid service route contracts for all 10 services", () => {
      expect(services.length).toBe(10);

      const expectedServices = [
        "auth",
        "profile",
        "mobility",
        "ticket",
        "payment",
        "parking",
        "ev",
        "employee",
        "notification",
        "reporting",
      ];

      const names = services.map((s) => s.name);
      expect(names).toEqual(expectedServices);

      for (const svc of services) {
        expect(svc.prefix).toMatch(/^\/api\/v1\//);
        expect(svc.target).toMatch(/^https?:\/\//);
        expect(svc.timeoutMs).toBeGreaterThan(0);
        expect(typeof svc.retries).toBe("number");
        expect(svc.retries).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Internal Token Contract", () => {
    it("mints internal token that validates with downstream requirements (issuer, audience, secret)", () => {
      const user = { id: "user-test-uuid", roles: ["admin", "employee"], sessionId: "session-xyz" };
      const reqId = "req-correlation-123";

      const token = signInternalToken(user, reqId);
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, env.INTERNAL_JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "api-gateway",
        audience: "internal-services",
      }) as { sub: string; roles: string[]; sid?: string; rid?: string };

      expect(decoded.sub).toBe(user.id);
      expect(decoded.roles).toEqual(user.roles);
      expect(decoded.sid).toBe(user.sessionId);
      expect(decoded.rid).toBe(reqId);
    });

    it("validates with requireGateway middleware from @habeshago/api-contracts", async () => {
      const app = express();
      app.use(requireGateway(env.INTERNAL_JWT_SECRET));
      app.get("/internal-test", (req, res) => {
        res.json({ user: (req as any).user });
      });

      const user = { id: "downstream-user", roles: ["rider"] };
      const token = signInternalToken(user, "test-req");

      // Without token -> 401
      const resNoToken = await request(app).get("/internal-test");
      expect(resNoToken.status).toBe(401);

      // With invalid token -> 401
      const resInvalidToken = await request(app)
        .get("/internal-test")
        .set("x-internal-token", "invalid-token");
      expect(resInvalidToken.status).toBe(401);

      // With valid token -> 200
      const resValid = await request(app)
        .get("/internal-test")
        .set("x-internal-token", token);
      expect(resValid.status).toBe(200);
      expect(resValid.body.user).toEqual({ id: "downstream-user", roles: ["rider"] });
    });
  });

  describe("Error Envelope Contract", () => {
    it("ensures every gateway HttpError conforms to @habeshago/api-contracts errorResponseSchema", () => {
      const allErrors = [
        Errors.unauthorized("Authentication required"),
        Errors.forbidden("Insufficient permissions"),
        Errors.notFound("Route not found"),
        Errors.tooLarge(),
        Errors.tooMany(),
        Errors.unavailable("test-service"),
        Errors.timeout("test-service"),
        Errors.badGateway("test-service"),
      ];

      for (const err of allErrors) {
        const payload = {
          error: {
            code: err.code,
            message: err.message,
            requestId: "req-test-uuid",
            details: err.details,
          },
        };

        const result = errorResponseSchema.safeParse(payload);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("WebSocket Upgrade Contract", () => {
    it("rejects WebSocket upgrade without token with 401", async () => {
      const socket = net.connect(gatewayPort, "127.0.0.1", () => {
        socket.write(
          "GET /api/v1/mobility/ws HTTP/1.1\r\n" +
            "Host: 127.0.0.1\r\n" +
            "Upgrade: websocket\r\n" +
            "Connection: Upgrade\r\n" +
            "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n" +
            "Sec-WebSocket-Version: 13\r\n\r\n",
        );
      });

      const response = await new Promise<string>((resolve) => {
        let data = "";
        socket.on("data", (chunk) => {
          data += chunk.toString();
        });
        socket.on("close", () => resolve(data));
        socket.on("end", () => resolve(data));
      });

      expect(response).toContain("HTTP/1.1 401 Unauthorized");
    });

    it("rejects WebSocket upgrade with invalid token with 401", async () => {
      const socket = net.connect(gatewayPort, "127.0.0.1", () => {
        socket.write(
          "GET /api/v1/mobility/ws?access_token=bad-token HTTP/1.1\r\n" +
            "Host: 127.0.0.1\r\n" +
            "Upgrade: websocket\r\n" +
            "Connection: Upgrade\r\n" +
            "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n" +
            "Sec-WebSocket-Version: 13\r\n\r\n",
        );
      });

      const response = await new Promise<string>((resolve) => {
        let data = "";
        socket.on("data", (chunk) => {
          data += chunk.toString();
        });
        socket.on("close", () => resolve(data));
        socket.on("end", () => resolve(data));
      });

      expect(response).toContain("HTTP/1.1 401 Unauthorized");
    });
  });
});
