/**
 * Client-side logger - Development only, production uses error reporting service
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log info message (development only)
 */
export function logInfo(message: string, ...args: unknown[]): void {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, ...args);
  }
}

/**
 * Log warning (development only)
 */
export function logWarn(message: string, ...args: unknown[]): void {
  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, ...args);
  }
}

/**
 * Log error (always logs, sends to error service in production)
 */
export function logError(message: string, error: unknown, ...args: unknown[]): void {
  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, error, ...args);
  } else {
    // In production, send to error reporting service (Sentry, etc.)
    // window.Sentry?.captureException(error, { extra: { message, ...args } });
  }
}
