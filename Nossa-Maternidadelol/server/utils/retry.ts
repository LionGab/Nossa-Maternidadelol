/**
 * Retry logic com exponential backoff para operações críticas
 * Usa p-retry para tentativas automáticas com backoff exponencial
 */
import pRetry, { AbortError } from 'p-retry';

export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  minTimeout: 1000, // 1s
  maxTimeout: 10000, // 10s
  factor: 2, // Exponential: 1s, 2s, 4s
};

/**
 * Executa função com retry e exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return pRetry(
    async () => {
      try {
        return await fn();
      } catch (error: any) {
        // Não retry em erros 4xx (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          throw new AbortError(error);
        }
        // Retry em erros 5xx e network errors
        throw error;
      }
    },
    {
      retries: opts.retries,
      minTimeout: opts.minTimeout,
      maxTimeout: opts.maxTimeout,
      factor: opts.factor,
      onFailedAttempt: (error) => {
        console.warn(
          `Tentativa ${error.attemptNumber}/${opts.retries} falhou:`,
          error.message
        );
      },
    }
  );
}

/**
 * Retry específico para chamadas de API externas (Gemini, Perplexity)
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>
): Promise<T> {
  return withRetry(fn, {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 8000,
    factor: 2,
  });
}

/**
 * Retry específico para uploads (timeouts mais longos)
 */
export async function retryUpload<T>(
  fn: () => Promise<T>
): Promise<T> {
  return withRetry(fn, {
    retries: 3,
    minTimeout: 2000,
    maxTimeout: 15000,
    factor: 2,
  });
}

