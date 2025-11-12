/**
 * Prometheus metrics collection
 * 
 * Provides basic metrics for monitoring:
 * - HTTP request duration
 * - HTTP request count by status
 * - Active connections
 * - Error rate
 * 
 * Falls back gracefully if Prometheus client is not available
 */

import { logger } from "./logger";

let metricsEnabled = false;
let promClient: any = null;

// Initialize Prometheus client if available
async function initializeMetrics() {
  if (process.env.ENABLE_METRICS === "true") {
    try {
      // @ts-ignore - prom-client is optional dependency
      const prom = await import("prom-client");
      promClient = prom;
      
      // Create default metrics (CPU, memory, etc.)
      prom.register.clear();
      prom.collectDefaultMetrics();
      
      // Custom metrics
      const httpRequestDuration = new prom.Histogram({
        name: "http_request_duration_seconds",
        help: "Duration of HTTP requests in seconds",
        labelNames: ["method", "route", "status"],
        buckets: [0.1, 0.5, 1, 2, 5, 10],
      });
      
      const httpRequestTotal = new prom.Counter({
        name: "http_requests_total",
        help: "Total number of HTTP requests",
        labelNames: ["method", "route", "status"],
      });
      
      const httpErrorsTotal = new prom.Counter({
        name: "http_errors_total",
        help: "Total number of HTTP errors",
        labelNames: ["method", "route", "status"],
      });
      
      metricsEnabled = true;
      logger.info({ msg: "Prometheus metrics initialized" });
      
      return { httpRequestDuration, httpRequestTotal, httpErrorsTotal };
    } catch (error) {
      logger.warn({ err: error, msg: "Failed to initialize Prometheus metrics" });
      return null;
    }
  }
  return null;
}

// Get metrics instance
let metricsInstance: any = null;

initializeMetrics().then((instance) => {
  metricsInstance = instance;
});

// Middleware to track HTTP metrics
export function metricsMiddleware(req: any, res: any, next: any) {
  if (!metricsEnabled || !metricsInstance) {
    return next();
  }
  
  const startTime = Date.now();
  const { method, path } = req;
  
  // Override res.end to capture status
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = (Date.now() - startTime) / 1000;
    const status = res.statusCode;
    const route = path.split("?")[0]; // Remove query params
    
    // Record metrics
    metricsInstance.httpRequestDuration.observe(
      { method, route, status: status.toString() },
      duration
    );
    
    metricsInstance.httpRequestTotal.inc({
      method,
      route,
      status: status.toString(),
    });
    
    if (status >= 400) {
      metricsInstance.httpErrorsTotal.inc({
        method,
        route,
        status: status.toString(),
      });
    }
    
    originalEnd.apply(res, args);
  };
  
  next();
}

// Get metrics endpoint handler
export async function getMetricsHandler(_req: any, res: any) {
  if (!metricsEnabled || !promClient) {
    return res.status(503).json({ error: "Metrics not available" });
  }
  
  try {
    res.set("Content-Type", promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error({ err: error, msg: "Failed to get metrics" });
    res.status(500).json({ error: "Failed to get metrics" });
  }
}

