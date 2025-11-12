/**
 * Registrador central de rotas
 * Organização modular por domínio funcional
 */

import type { Express } from "express";
import { registerContentRoutes } from "./content-routes";
import { registerAIRoutes } from "./ai-routes";
import { registerHabitsRoutes } from "./habits-routes";
import { registerCommunityRoutes } from "./community-routes";
import { registerProfileRoutes } from "./profile-routes";

/**
 * Registra todas as rotas da aplicação
 * Ordem de importância:
 * 1. Content (público, cache agressivo)
 * 2. AI (rate limited, cache inteligente)
 * 3. Habits (user-specific, gamification)
 * 4. Community (social, moderação)
 * 5. Profile (user management)
 */
export function registerRoutesModular(app: Express): void {
  // Health check básico
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Registrar rotas por domínio
  registerContentRoutes(app);
  registerAIRoutes(app);
  registerHabitsRoutes(app);
  registerCommunityRoutes(app);
  registerProfileRoutes(app);
}
