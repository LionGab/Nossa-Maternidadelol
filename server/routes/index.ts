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

/**
 * Register all routes without creating HTTP server (for Vercel/serverless)
 */
export function registerRoutesSync(app: Express): void {
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
