import { vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.PORT = "8080";
process.env.LOG_LEVEL = "silent";
process.env.CORS_ORIGINS = "http://localhost:3000";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_ACCESS_SECRET = "01234567890123456789012345678901";
process.env.INTERNAL_JWT_SECRET = "98765432109876543210987654321098";
process.env.INTERNAL_TOKEN_TTL_SECONDS = "60";
process.env.MAX_BODY_BYTES = "1048576";
process.env.RATE_LIMIT_IP_PER_MINUTE = "300";
process.env.RATE_LIMIT_USER_PER_MINUTE = "120";
process.env.AUTH_SERVICE_URL = "http://localhost:4001";
process.env.PROFILE_SERVICE_URL = "http://localhost:4002";
process.env.MOBILITY_SERVICE_URL = "http://localhost:4003";
process.env.TICKET_SERVICE_URL = "http://localhost:4004";
process.env.PAYMENT_SERVICE_URL = "http://localhost:4005";
process.env.PARKING_SERVICE_URL = "http://localhost:4006";
process.env.EV_SERVICE_URL = "http://localhost:4007";
process.env.EMPLOYEE_SERVICE_URL = "http://localhost:4008";
process.env.NOTIFICATION_SERVICE_URL = "http://localhost:4009";
process.env.REPORTING_SERVICE_URL = "http://localhost:4010";

// Mock ioredis in tests so tests run reliably without requiring a live Redis server
vi.mock("ioredis", () => {
  const store = new Map<string, string>();
  return {
    default: class MockRedis {
      on(_event: string, _fn: any) {
        return this;
      }
      async ping() {
        return "PONG";
      }
      async get(key: string) {
        return store.get(key) ?? null;
      }
      async set(key: string, value: string) {
        store.set(key, value);
        return "OK";
      }
      async quit() {
        return "OK";
      }
      async call(...args: any[]) {
        const cmd = String(args[0]).toUpperCase();
        if (cmd === "SCRIPT" && String(args[1]).toUpperCase() === "LOAD") {
          return "mock-sha-hash";
        }
        // Return [totalHits, timeToResetMs] for rate-limit-redis eval script
        return [1, 60000];
      }
    },
  };
});
