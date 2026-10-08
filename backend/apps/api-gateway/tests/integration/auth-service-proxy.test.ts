import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { Server } from "http";
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

  it("proxies public route POST /api/v1/auth/login directly to auth-service", async () => {
    const res = await request(gateway)
      .post("/api/v1/auth/login")
      .send({ email: "user@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Login endpoint scaffolded",
      todo: "Implement authentication and token issuance",
    });
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
