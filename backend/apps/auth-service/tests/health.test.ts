import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("auth-service health routes", () => {
  const app = createApp();

  it("responds 200 on /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("auth-service");
  });

  it("responds 200 on /ready", async () => {
    const res = await request(app).get("/ready");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
  });
});
