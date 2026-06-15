export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryIf?: (err: unknown) => boolean;
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelay = options.baseDelayMs ?? 500;
  const maxDelay = options.maxDelayMs ?? 5000;
  const retryIf = options.retryIf ?? (() => true);

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !retryIf(err)) throw err;
      const delay = Math.min(maxDelay, baseDelay * 2 ** (attempt - 1));
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  name?: string;
}

type CircuitState = "closed" | "open" | "half-open";

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private lastFailure = 0;

  constructor(private readonly options: CircuitBreakerOptions = {}) {}

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    const threshold = this.options.failureThreshold ?? 5;
    const resetMs = this.options.resetTimeoutMs ?? 30_000;

    if (this.state === "open") {
      if (Date.now() - this.lastFailure >= resetMs) {
        this.state = "half-open";
      } else {
        throw new Error(`Circuit open for ${this.options.name ?? "service"}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(threshold);
      throw err;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(threshold: number): void {
    this.failures += 1;
    this.lastFailure = Date.now();
    if (this.failures >= threshold) {
      this.state = "open";
    }
  }
}

export const rpcCircuit = new CircuitBreaker({ name: "mantle-rpc", failureThreshold: 5 });
export const cliCircuit = new CircuitBreaker({ name: "byreal-cli", failureThreshold: 3 });
