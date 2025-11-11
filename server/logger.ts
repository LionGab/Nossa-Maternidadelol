import pino from "pino";

/**
 * Centralized logging system using Pino
 *
 * Features:
 * - Structured logging (JSON in production, pretty in development)
 * - Log levels: trace, debug, info, warn, error, fatal
 * - Automatic request ID correlation
 * - Performance optimized (async logging)
 */

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),

  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false,
        },
      }
    : undefined,

  // Base configuration
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },

  // Redact sensitive fields
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "password",
      "passwordHash",
      "token",
      "apiKey",
      "secret",
    ],
    censor: "[REDACTED]",
  },

  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime,

  // Serializers for common objects
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.ip,
      remotePort: req.socket?.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders?.(),
    }),
    err: pino.stdSerializers.err,
  },
});

/**
 * Express middleware for request logging
 */
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();

  // Generate request ID
  req.id = req.headers["x-request-id"] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create child logger with request context
  req.log = logger.child({
    requestId: req.id,
    userId: req.user?.id,
  });

  // Log request
  req.log.info({
    req,
    msg: `Incoming ${req.method} ${req.url}`,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    res.send = originalSend;
    const duration = Date.now() - start;

    req.log.info({
      res,
      duration,
      msg: `Completed ${req.method} ${req.url} ${res.statusCode} in ${duration}ms`,
    });

    return res.send(data);
  };

  next();
}

/**
 * Express error logging middleware
 */
export function errorLogger(err: any, req: any, res: any, next: any) {
  const log = req.log || logger;

  log.error({
    err,
    req,
    msg: `Error processing ${req.method} ${req.url}: ${err.message}`,
  });

  next(err);
}

/**
 * Utility function to log AI API calls
 */
export function logAICall(
  service: "gemini" | "perplexity",
  operation: string,
  metadata: Record<string, any>
) {
  logger.info({
    service,
    operation,
    ...metadata,
    msg: `AI API call: ${service}.${operation}`,
  });
}

/**
 * Utility function to log database operations
 */
export function logDbOperation(
  operation: string,
  table: string,
  duration: number,
  metadata?: Record<string, any>
) {
  logger.debug({
    operation,
    table,
    duration,
    ...metadata,
    msg: `DB: ${operation} on ${table} (${duration}ms)`,
  });
}

/**
 * Log application startup
 */
export function logStartup(port: number, env: string) {
  logger.info({
    port,
    env,
    nodeVersion: process.version,
    platform: process.platform,
    msg: `🚀 Nossa Maternidade server started on port ${port} (${env})`,
  });
}

/**
 * Log application shutdown
 */
export function logShutdown(reason: string) {
  logger.info({
    reason,
    msg: `🛑 Nossa Maternidade server shutting down: ${reason}`,
  });
}
