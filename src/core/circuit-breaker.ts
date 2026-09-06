/**
 * Bounded in-memory circuit breaker.
 * No global mutable singleton export of internal maps beyond the class instance
 * owned by the registry. State is per-key, capacity-capped.
 */

export type CircuitState = "closed" | "open" | "half_open";

export interface CircuitBreakerOptions {
  readonly failureThreshold: number;
  readonly openMs: number;
  readonly halfOpenMaxCalls: number;
  readonly maxKeys: number;
}

interface KeyState {
  failures: number;
  state: CircuitState;
  openedAt: number;
  halfOpenCalls: number;
}

const DEFAULTS: CircuitBreakerOptions = {
  failureThreshold: 5,
  openMs: 30_000,
  halfOpenMaxCalls: 1,
  maxKeys: 256,
};

export class CircuitBreaker {
  private readonly opts: CircuitBreakerOptions;
  private readonly keys = new Map<string, KeyState>();

  constructor(opts?: Partial<CircuitBreakerOptions>) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  canExecute(key: string, now = Date.now()): boolean {
    const s = this.keys.get(key);
    if (!s) return true;
    if (s.state === "closed") return true;
    if (s.state === "open") {
      if (now - s.openedAt >= this.opts.openMs) {
        s.state = "half_open";
        s.halfOpenCalls = 0;
        return true;
      }
      return false;
    }
    // half_open
    return s.halfOpenCalls < this.opts.halfOpenMaxCalls;
  }

  recordSuccess(key: string): void {
    const s = this.keys.get(key);
    if (!s) return;
    if (s.state === "half_open" || s.state === "closed") {
      this.keys.set(key, {
        failures: 0,
        state: "closed",
        openedAt: 0,
        halfOpenCalls: 0,
      });
    }
  }

  recordFailure(key: string, now = Date.now()): void {
    let s = this.keys.get(key);
    if (!s) {
      if (this.keys.size >= this.opts.maxKeys) {
        // Evict oldest open or first key to stay bounded
        const first = this.keys.keys().next().value;
        if (first !== undefined) this.keys.delete(first);
      }
      s = { failures: 0, state: "closed", openedAt: 0, halfOpenCalls: 0 };
      this.keys.set(key, s);
    }
    if (s.state === "half_open") {
      s.state = "open";
      s.openedAt = now;
      s.failures = this.opts.failureThreshold;
      return;
    }
    s.failures += 1;
    if (s.failures >= this.opts.failureThreshold) {
      s.state = "open";
      s.openedAt = now;
    }
  }

  noteHalfOpenCall(key: string): void {
    const s = this.keys.get(key);
    if (s && s.state === "half_open") s.halfOpenCalls += 1;
  }

  getState(key: string): CircuitState | "absent" {
    return this.keys.get(key)?.state ?? "absent";
  }

  /** Bounded snapshot for observability. */
  snapshot(limit = 32): Array<{ key: string; state: CircuitState; failures: number }> {
    const out: Array<{ key: string; state: CircuitState; failures: number }> = [];
    for (const [key, s] of this.keys) {
      if (out.length >= limit) break;
      out.push({ key, state: s.state, failures: s.failures });
    }
    return out;
  }
}
