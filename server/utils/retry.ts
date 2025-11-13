/**
 * Retry Utility - Exponential backoff with jitter
 *
 * Implements retry logic for transient failures with:
 * - Exponential backoff (2^n * baseDelay)
 * - Jitter to prevent thundering herd
 * - Configurable max retries
 * - Selective retry (only retry-able errors)
 */

import { logger } from "../logger";

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Base delay in milliseconds
   * @default 1000 (1 second)
   */
  baseDelay?: number;

  /**
   * Maximum delay in milliseconds
   * @default 10000 (10 seconds)
   */
  maxDelay?: number;

  /**
   * Add jitter to prevent thundering herd
   * @default true
   */
  jitter?: boolean;

  /**
   * Function to determine if error is retryable
   * @default () => true (retry all errors)
   */
  isRetryable?: (error: unknown) => boolean;

  /**
   * Callback for each retry attempt
   */
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  jitter: true,
  isRetryable: () => true,
  onRetry: () => {},
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitter: boolean
): number {
  // Exponential backoff: 2^attempt * baseDelay
  let delay = Math.min(baseDelay * 2 ** attempt, maxDelay);

  // Add jitter (random 0-50% of delay)
  if (jitter) {
    const jitterAmount = delay * 0.5 * Math.random();
    delay += jitterAmount;
  }

  return delay;
}

/**
 * Retry a function with exponential backoff
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetch('https://api.example.com'),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!opts.isRetryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        opts.baseDelay,
        opts.maxDelay,
        opts.jitter
      );

      logger.warn({
        msg: "Retrying after error",
        attempt: attempt + 1,
        maxRetries: opts.maxRetries,
        delayMs: Math.round(delay),
        error: error instanceof Error ? error.message : String(error),
      });

      // Call onRetry callback
      opts.onRetry(error, attempt + 1);

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Check if HTTP status code is retryable
 */
export function isRetryableHttpStatus(status: number): boolean {
  // Retry on:
  // - 408 Request Timeout
  // - 429 Too Many Requests
  // - 500+ Server Errors
  // - 503 Service Unavailable
  return status === 408 || status === 429 || status >= 500;
}

/**
 * Check if error is a network error (retryable)
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // Common network error messages
  const networkErrors = [
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "fetch failed",
    "network error",
  ];

  return networkErrors.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Fetch with retry logic
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry('https://api.example.com', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, init);

      // Throw on retryable HTTP errors
      if (!response.ok && isRetryableHttpStatus(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    {
      ...options,
      isRetryable: (error) => {
        // Retry network errors and retryable HTTP statuses
        if (isNetworkError(error)) return true;
        if (error instanceof Error && error.message.includes("HTTP")) {
          const status = parseInt(error.message.match(/\d+/)?.[0] || "0");
          return isRetryableHttpStatus(status);
        }
        return false;
      },
    }
  );
}
