import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { authenticate, isPublic } from "../../src/middleware/authenticate";
import { env } from "../../src/config/env";
import type { ServiceRoute } from "../../src/config/services";
import type { Request, Response } from "express";
import { HttpError } from "../../src/shared/errors";

describe("authenticate middleware", () => {
  const authRoute: ServiceRoute = {
    name: "auth",
    prefix: "/api/v1/auth",
    target: "http://localhost:4001",
    stripPrefix: false,
    auth: "user",
    publicRules: [
      { method: "POST", path: /^\/api\/v1\/auth\/(login|register|refresh)$/ },
      { method: "GET", path: /^\/api\/v1\/auth\/google(\/callback)?$/ },
    ],
    timeoutMs: 8000,
    retries: 0,
  };

  it("identifies public endpoints correctly via isPublic", () => {
    const loginReq = {
      method: "POST",
      baseUrl: "/api/v1/auth",
      path: "/login",
    } as Request;

    expect(isPublic(authRoute, loginReq)).toBe(true);

    const privateReq = {
      method: "GET",
      baseUrl: "/api/v1/auth",
      path: "/me",
    } as Request;

    expect(isPublic(authRoute, privateReq)).toBe(false);
  });

  it("passes public requests without token", () => {
    const middleware = authenticate(authRoute);
    const req = {
      method: "POST",
      baseUrl: "/api/v1/auth",
      path: "/login",
      header: () => undefined,
    } as unknown as Request;

    let nextErr: unknown = null;
    middleware(req, {} as Response, (err) => {
      nextErr = err;
    });

    expect(nextErr).toBeUndefined();
    expect(req.user).toBeUndefined();
  });

  it("rejects protected route when Authorization header is missing", () => {
    const middleware = authenticate(authRoute);
    const req = {
      method: "GET",
      baseUrl: "/api/v1/auth",
      path: "/me",
      header: () => undefined,
    } as unknown as Request;

    let nextErr: any = null;
    middleware(req, {} as Response, (err) => {
      nextErr = err;
    });

    expect(nextErr).toBeInstanceOf(HttpError);
    expect(nextErr.status).toBe(401);
    expect(nextErr.code).toBe("UNAUTHORIZED");
  });

  it("populates req.user when valid Bearer token is provided", () => {
    const middleware = authenticate(authRoute);
    const validToken = jwt.sign(
      { sub: "user-123", roles: ["rider"], sid: "session-1" },
      env.JWT_ACCESS_SECRET,
      { algorithm: "HS256" },
    );

    const req = {
      method: "GET",
      baseUrl: "/api/v1/auth",
      path: "/me",
      header: (name: string) => (name.toLowerCase() === "authorization" ? `Bearer ${validToken}` : undefined),
    } as unknown as Request;

    let nextErr: unknown = null;
    middleware(req, {} as Response, (err) => {
      nextErr = err;
    });

    expect(nextErr).toBeUndefined();
    expect(req.user).toEqual({
      id: "user-123",
      roles: ["rider"],
      sessionId: "session-1",
    });
  });
});
