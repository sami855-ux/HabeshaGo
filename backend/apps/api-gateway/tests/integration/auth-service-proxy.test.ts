import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { Server } from "http";

vi.mock("../../../auth-service/src/prisma", () => ({
  prisma: {
    otpCode: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "otp_1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: "usr_mock",
        email: "user@example.com",
        status: "ACTIVE",
        roleGrants: [{ role: "PASSENGER", revokedAt: null }],
      }),
    },
  },
}));

import { createApp as createGatewayApp } from "../../src/app";
import { createApp as createAuthApp } from "../../../auth-service/src/app";

describe("API Gateway -> Auth Service End-to-End Proxy", () => {
  let authServer: Server;
  const gateway = createGatewayApp();

  beforeAll(async () => {
    const authApp = createAuthApp();
    await new Promise<void>((resolve) => {
      authServer = authApp.listen(4001, () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => authServer.close(() => resolve()));
  });

  it("proxies public route POST /api/v1/auth/continue-with-email directly to auth-service", async () => {
    const res = await request(gateway)
      .post("/api/v1/auth/continue-with-email")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("OTP sent to email");
  });

  it("proxies protected route GET /api/v1/auth/me after validating token and minting internal trust token", async () => {
    // Generate valid client JWT signed with gateway's JWT_ACCESS_SECRET
    const clientToken = jwt.sign(
      { sub: "usr_12345", roles: ["PASSENGER"] },
      process.env.JWT_ACCESS_SECRET!,
      { algorithm: "HS256", expiresIn: "15m" }
    );

    const res = await request(gateway)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: "usr_12345",
      roles: ["PASSENGER"],
    });
  });

  it("rejects unauthenticated requests to protected /api/v1/auth/me before reaching auth-service", async () => {
    const res = await request(gateway).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
