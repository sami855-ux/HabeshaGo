import { describe, it, expect, vi, beforeEach } from "vitest";
import { CircuitBreaker } from "../../src/proxy/circuit-breaker";

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("starts in closed state and allows requests", () => {
    const breaker = new CircuitBreaker("test-service", 3, 1000);
    expect(breaker.getState()).toBe("closed");
    expect(breaker.canRequest()).toBe(true);
  });

  it("transitions from closed to open after failure threshold", () => {
    const breaker = new CircuitBreaker("test-service", 3, 1000);

    breaker.failure();
    expect(breaker.getState()).toBe("closed");
    expect(breaker.canRequest()).toBe(true);

    breaker.failure();
    expect(breaker.getState()).toBe("closed");
    expect(breaker.canRequest()).toBe(true);

    breaker.failure();
    expect(breaker.getState()).toBe("open");
    expect(breaker.canRequest()).toBe(false);
  });

  it("transitions from open to half_open after cooldown, and closed on success", () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker("test-service", 2, 1000);

    breaker.failure();
    breaker.failure();
    expect(breaker.getState()).toBe("open");
    expect(breaker.canRequest()).toBe(false);

    // Advance time past cooldown
    vi.advanceTimersByTime(1001);

    // Now should allow probe in half_open
    expect(breaker.canRequest()).toBe(true);
    expect(breaker.getState()).toBe("half_open");

    // While probing, second concurrent request should be rejected
    expect(breaker.canRequest()).toBe(false);

    // Success resets to closed
    breaker.success();
    expect(breaker.getState()).toBe("closed");
    expect(breaker.canRequest()).toBe(true);
  });

  it("transitions back to open if half_open probe fails", () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker("test-service", 2, 1000);

    breaker.failure();
    breaker.failure();
    expect(breaker.getState()).toBe("open");

    vi.advanceTimersByTime(1001);
    expect(breaker.canRequest()).toBe(true);
    expect(breaker.getState()).toBe("half_open");

    breaker.failure();
    expect(breaker.getState()).toBe("open");
    expect(breaker.canRequest()).toBe(false);
  });
});
