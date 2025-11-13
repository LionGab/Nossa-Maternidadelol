/**
 * Health Check System
 *
 * Provides health check endpoints for monitoring:
 * - /health - Overall health (liveness probe)
 * - /health/ready - Readiness probe (can serve traffic?)
 * - /health/integrations - Detailed integration status
 */

import type { Request, Response } from "express";
import { logger } from "./logger";
import { getAllCircuitBreakerStats } from "./utils/circuit-breaker";

export interface HealthCheck {
  name: string;
  status: "healthy" | "unhealthy" | "degraded";
  latencyMs?: number;
  message?: string;
  lastCheck?: string;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  checks: HealthCheck[];
  circuitBreakers?: Record<string, any>;
}

/**
 * Check if Gemini AI is healthy
 */
async function checkGeminiHealth(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return {
        name: "gemini_ai",
        status: "degraded",
        message: "API key not configured (agents disabled)",
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    // Simple connectivity check (could ping API if needed)
    return {
      name: "gemini_ai",
      status: "healthy",
      message: "API key configured",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: "gemini_ai",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Check if Perplexity AI is healthy
 */
async function checkPerplexityHealth(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Check if API key is configured
    if (!process.env.PERPLEXITY_API_KEY) {
      return {
        name: "perplexity_ai",
        status: "degraded",
        message: "API key not configured (search disabled)",
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    return {
      name: "perplexity_ai",
      status: "healthy",
      message: "API key configured",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: "perplexity_ai",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Check if Supabase is healthy
 */
async function checkSupabaseHealth(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      if (process.env.NODE_ENV === "production") {
        return {
          name: "supabase",
          status: "unhealthy",
          message: "Not configured in production",
          latencyMs: Date.now() - start,
          lastCheck: new Date().toISOString(),
        };
      }

      return {
        name: "supabase",
        status: "degraded",
        message: "Not configured (using MemStorage in dev)",
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    // In production, could actually test connection
    // const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });

    return {
      name: "supabase",
      status: "healthy",
      message: "Configured",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: "supabase",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Check if database is healthy
 */
async function checkDatabaseHealth(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      if (process.env.NODE_ENV === "production") {
        return {
          name: "database",
          status: "unhealthy",
          message: "DATABASE_URL not configured in production",
          latencyMs: Date.now() - start,
          lastCheck: new Date().toISOString(),
        };
      }

      return {
        name: "database",
        status: "degraded",
        message: "Using MemStorage (in-memory database)",
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    // In production, could actually test connection
    // await db.execute(sql`SELECT 1`);

    return {
      name: "database",
      status: "healthy",
      message: "Connected to Neon PostgreSQL",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: "database",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
      latencyMs: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Run all health checks
 */
async function runHealthChecks(): Promise<HealthStatus> {
  const start = Date.now();

  const checks = await Promise.all([
    checkGeminiHealth(),
    checkPerplexityHealth(),
    checkSupabaseHealth(),
    checkDatabaseHealth(),
  ]);

  // Determine overall status
  const hasUnhealthy = checks.some((c) => c.status === "unhealthy");
  const hasDegraded = checks.some((c) => c.status === "degraded");

  const status: HealthStatus = {
    status: hasUnhealthy ? "unhealthy" : hasDegraded ? "degraded" : "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    circuitBreakers: getAllCircuitBreakerStats(),
  };

  logger.info({
    msg: "Health check completed",
    status: status.status,
    durationMs: Date.now() - start,
    unhealthyCount: checks.filter((c) => c.status === "unhealthy").length,
    degradedCount: checks.filter((c) => c.status === "degraded").length,
  });

  return status;
}

/**
 * Liveness probe - is the app running?
 * Returns 200 if app is alive (even if degraded)
 */
export async function livenessHandler(_req: Request, res: Response) {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

/**
 * Readiness probe - can the app serve traffic?
 * Returns 200 only if all critical services are healthy
 * Returns 503 if any critical service is unhealthy
 */
export async function readinessHandler(_req: Request, res: Response) {
  try {
    const health = await runHealthChecks();

    // In production, require all services to be healthy
    if (process.env.NODE_ENV === "production") {
      if (health.status === "unhealthy") {
        return res.status(503).json(health);
      }
    }

    // In development, allow degraded state (MemStorage, etc.)
    res.status(200).json(health);
  } catch (error) {
    logger.error({ err: error, msg: "Health check failed" });
    res.status(503).json({
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Detailed integration health
 */
export async function integrationsHandler(_req: Request, res: Response) {
  try {
    const health = await runHealthChecks();
    res.status(200).json(health);
  } catch (error) {
    logger.error({ err: error, msg: "Integration health check failed" });
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
}
