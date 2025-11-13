/**
 * Routes Index - Central registration point for all route modules
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerContentRoutes } from "./content.routes";
import { registerAIRoutes } from "./ai.routes";
import { registerHabitsRoutes } from "./habits.routes";
import { registerCommunityRoutes } from "./community.routes";
import { registerUploadRoutes } from "./upload.routes";
import { errorHandler } from "../middleware/error.middleware";
import { storage } from "../storage";
import { logger } from "../logger";

/**
 * Register all routes without creating HTTP server (for Vercel/serverless)
 */
export function registerRoutesSync(app: Express): void {
  // Health Check Endpoints (public, for monitoring)
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  app.get("/health/ready", async (_req, res) => {
    const checks = {
      storage: false,
      gemini: false,
      perplexity: false,
    };

    try {
      // Check storage (try to get tips - lightweight query)
      await storage.getTips();
      checks.storage = true;
    } catch (e) {
      logger.warn({ msg: "Health check: storage failed", err: e });
    }

    try {
      // Check AI APIs (just verify keys exist)
      checks.gemini = !!process.env.GEMINI_API_KEY;
      checks.perplexity = !!process.env.PERPLEXITY_API_KEY;
    } catch (e) {
      logger.warn({ msg: "Health check: AI APIs failed", err: e });
    }

    const isHealthy = checks.storage && checks.gemini && checks.perplexity;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health/integrations", (_req, res) => {
    res.json({
      database: !!process.env.DATABASE_URL,
      supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      sentry: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
    });
  });

  // Register all route modules
  registerContentRoutes(app);
  registerAIRoutes(app);
  registerHabitsRoutes(app);
  registerCommunityRoutes(app);
  registerUploadRoutes(app);

  // Error handler must be last
  app.use(errorHandler);
}

/**
 * Register routes and create HTTP server (for traditional Express server)
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Register all routes synchronously
  registerRoutesSync(app);

  // Create HTTP server for traditional Express
  const httpServer = createServer(app);

  return httpServer;
}
