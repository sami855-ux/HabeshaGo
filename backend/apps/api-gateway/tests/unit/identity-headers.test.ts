import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { identityHeaders, signInternalToken } from "../../src/middleware/identity-headers";
import { env } from "../../src/config/env";
import type { Request, Response } from "express";

describe("identityHeaders middleware", () => {
  it("strips client-provided identity headers", () => {
    const req = {
      headers: {
        "x-user-id": "spoofed-user-id",
        "x-user-roles": "admin",
        "x-session-id": "fake-session",
        "x-internal-token": "fake-internal-token",
        "x-forwarded-user": "hacker",
      },
      id: "req-12345",
    } as unknown as Request;

    const res = {} as Response;
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    identityHeaders(req, res, next);

    expect(nextCalled).toBe(true);
    expect(req.headers["x-user-id"]).toBeUndefined();
    expect(req.headers["x-user-roles"]).toBeUndefined();
    expect(req.headers["x-session-id"]).toBeUndefined();
    expect(req.headers["x-internal-token"]).toBeUndefined();
    expect(req.headers["x-forwarded-user"]).toBeUndefined();
    expect(req.headers["x-request-id"]).toBe("req-12345");
  });

  it("attaches signed internal token and headers when user is authenticated", () => {
    const user = { id: "user-abc", roles: ["admin", "driver"], sessionId: "sess-999" };
    const req = {
      headers: {
        "x-user-id": "spoofed-id",
      },
      user,
      id: "req-abc-xyz",
    } as unknown as Request;

    const res = {} as Response;
    let nextCalled = false;
    identityHeaders(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.headers["x-user-id"]).toBe("user-abc");
    expect(req.headers["x-user-roles"]).toBe("admin,driver");
    expect(req.headers["x-request-id"]).toBe("req-abc-xyz");

    const internalToken = req.headers["x-internal-token"] as string;
    expect(internalToken).toBeDefined();

    const decoded = jwt.verify(internalToken, env.INTERNAL_JWT_SECRET, {
      issuer: "api-gateway",
      audience: "internal-services",
    }) as any;

    expect(decoded.sub).toBe("user-abc");
    expect(decoded.roles).toEqual(["admin", "driver"]);
    expect(decoded.sid).toBe("sess-999");
    expect(decoded.rid).toBe("req-abc-xyz");
  });
});
