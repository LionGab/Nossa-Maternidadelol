/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by stopping calls to failing services
 * and allowing them time to recover.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is down, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 */

import { logger } from "../logger";

export enum CircuitState {
  CLOSED = "CLOSED",     // Normal operation
  OPEN = "OPEN",         // Circuit is open, fail fast
  HALF_OPEN = "HALF_OPEN", // Testing recovery
}

export interface CircuitBreakerOptions {
  /**
   * Number of failures before opening circuit
   * @default 5
   */
  failureThreshold?: number;

  /**
   * Time window to count failures (ms)
   * @default 60000 (1 minute)
   */
  failureWindow?: number;

  /**
   * Time to wait before attempting recovery (ms)
   * @default 30000 (30 seconds)
   */
  resetTimeout?: number;

  /**
   * Number of successful calls to close circuit from HALF_OPEN
   * @default 2
   */
  successThreshold?: number;

  /**
   * Custom function to determine if error should count as failure
   * @default () => true
   */
  isFailure?: (error: unknown) => boolean;

  /**
   * Callback when circuit state changes
   */
  onStateChange?: (oldState: CircuitState, newState: CircuitState) => void;
}

interface FailureRecord {
  timestamp: number;
  error: unknown;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: FailureRecord[] = [];
  private successCount = 0;
  private lastOpenTime = 0;
  private readonly name: string;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      failureWindow: options.failureWindow ?? 60000,
      resetTimeout: options.resetTimeout ?? 30000,
      successThreshold: options.successThreshold ?? 2,
      isFailure: options.isFailure ?? (() => true),
      onStateChange: options.onStateChange ?? (() => {}),
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastOpenTime >= this.options.resetTimeout) {
        this.setState(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.name}`,
          this.state
        );
      }
    }

    try {
      const result = await fn();

      // Record success
      this.onSuccess();

      return result;
    } catch (error) {
      // Record failure
      this.onFailure(error);

      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      // Close circuit if enough successes
      if (this.successCount >= this.options.successThreshold) {
        this.setState(CircuitState.CLOSED);
        this.reset();
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(error: unknown): void {
    // Only count as failure if error matches criteria
    if (!this.options.isFailure(error)) {
      return;
    }

    const now = Date.now();

    // Add failure to records
    this.failures.push({ timestamp: now, error });

    // Remove old failures outside the window
    this.failures = this.failures.filter(
      (f) => now - f.timestamp < this.options.failureWindow
    );

    logger.warn({
      msg: "Circuit breaker recorded failure",
      circuit: this.name,
      state: this.state,
      failureCount: this.failures.length,
      threshold: this.options.failureThreshold,
      error: error instanceof Error ? error.message : String(error),
    });

    // Open circuit if threshold exceeded
    if (
      this.state === CircuitState.CLOSED &&
      this.failures.length >= this.options.failureThreshold
    ) {
      this.setState(CircuitState.OPEN);
      this.lastOpenTime = now;
    }

    // Re-open circuit if HALF_OPEN test fails
    if (this.state === CircuitState.HALF_OPEN) {
      this.setState(CircuitState.OPEN);
      this.lastOpenTime = now;
      this.successCount = 0;
    }
  }

  /**
   * Change circuit state
   */
  private setState(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    logger.info({
      msg: "Circuit breaker state changed",
      circuit: this.name,
      oldState,
      newState,
      failureCount: this.failures.length,
    });

    this.options.onStateChange(oldState, newState);
  }

  /**
   * Reset circuit breaker to initial state
   */
  private reset(): void {
    this.failures = [];
    this.successCount = 0;
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker stats
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failures.length,
      failureThreshold: this.options.failureThreshold,
      successCount: this.successCount,
      lastOpenTime: this.lastOpenTime,
    };
  }

  /**
   * Manually reset circuit breaker (admin use)
   */
  forceReset(): void {
    this.setState(CircuitState.CLOSED);
    this.reset();
  }
}

/**
 * Circuit Breaker Error - thrown when circuit is OPEN
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly state: CircuitState
  ) {
    super(message);
    this.name = "CircuitBreakerError";
  }
}

/**
 * Global circuit breaker registry
 */
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create circuit breaker for a service
 */
export function getCircuitBreaker(
  name: string,
  options?: CircuitBreakerOptions
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, options));
  }
  return circuitBreakers.get(name)!;
}

/**
 * Get stats for all circuit breakers
 */
export function getAllCircuitBreakerStats() {
  const stats: Record<string, ReturnType<CircuitBreaker["getStats"]>> = {};
  circuitBreakers.forEach((breaker, name) => {
    stats[name] = breaker.getStats();
  });
  return stats;
}
