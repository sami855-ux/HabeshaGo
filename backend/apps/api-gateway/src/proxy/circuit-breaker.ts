import { breakerState } from "../observability/metrics";

export type CircuitBreakerState = "closed" | "open" | "half_open";

export class CircuitBreaker {
  private state: CircuitBreakerState = "closed";
  private failures = 0;
  private openedAt = 0;
  private probing = false;

  constructor(
    private name: string,
    private failureThreshold = 5,
    private cooldownMs = 15000,
  ) {}

  canRequest(): boolean {
    if (this.state === "closed") return true;

    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.cooldownMs) return false;
      this.state = "half_open";
      this.probing = false;
    }

    if (this.probing) return false;
    this.probing = true;
    return true;
  }

  success() {
    this.failures = 0;
    this.probing = false;
    this.state = "closed";
    breakerState.set({ service: this.name }, 0);
  }

  failure() {
    this.probing = false;
    this.failures += 1;
    if (this.state === "half_open" || this.failures >= this.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
      breakerState.set({ service: this.name }, 1);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}
