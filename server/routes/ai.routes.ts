/**
 * AI Routes - NathIA, MãeValente, and unified agent system
 */

import type { Express } from "express";
import { requireAuth, validateSessionOwnership } from "../auth";
import {
  validateBody,
  validateParams,
  nathiaChatSchema,
  maeValenteSearchSchema,
  saveQaSchema,
  sessionIdParamSchema,
} from "../validation";
import { logger } from "../logger";
import type { AuthenticatedRequest } from "../types";
import { aiChatLimiter, aiSearchLimiter, generalApiLimiter } from "../rate-limit";
import { chatWithAgent } from "../agents/base-agent";
import { buildContextForAgent } from "../agents/context-builders";
import type { AgentType } from "@shared/schema";
import { storage } from "../storage";
import { aiSessionService } from "../services/ai-session.service";
import { searchWithPerplexity } from "../perplexity";
import crypto from "crypto";
import { AI } from "../constants";

export function registerAIRoutes(app: Express): void {
  // Unified Agent Routes (protected routes)
  app.get(
    "/api/agents/:agentType/messages/:sessionId",
    requireAuth,
    validateSessionOwnership,
    validateParams(sessionIdParamSchema),
    generalApiLimiter,
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { agentType, sessionId } = req.params as { agentType: AgentType; sessionId: string };

        // Get or create session
        const session = await aiSessionService.getOrCreateSession(
          sessionId,
          userId,
          agentType as AgentType
        );

        const messages = await storage.getAiMessages(sessionId);
        res.json(messages);
      } catch (error) {
        if (error instanceof Error && error.message.includes("não pertence")) {
          return res.status(403).json({ error: error.message });
        }
        next(error);
      }
    }
  );

  app.post(
    "/api/agents/:agentType/chat",
    requireAuth,
    validateSessionOwnership,
    aiChatLimiter,
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { agentType } = req.params as { agentType: AgentType };
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
          return res.status(400).json({ error: "sessionId e message são obrigatórios" });
        }

        // Get or create session
        const session = await aiSessionService.getOrCreateSession(
          sessionId,
          userId,
          agentType as AgentType
        );

        // Save user message
        await storage.createAiMessage({
          sessionId: session.id,
          role: "user",
          content: message,
        });

        // Get recent messages for context
        const allMessages = await storage.getAiMessages(sessionId);
        const recentMessages = allMessages.slice(-AI.RECENT_MESSAGES_COUNT);

        // Build context for agent
        const context = await buildContextForAgent(agentType, userId);

        // Get AI response
        const aiResponse = await chatWithAgent(
          agentType,
          recentMessages.map((m) => ({ role: m.role, content: m.content })),
          context
        );

        // Save AI response
        await storage.createAiMessage({
          sessionId,
          role: "assistant",
          content: aiResponse,
        });

        res.json({ success: true });
      } catch (error) {
        if (error instanceof Error && error.message.includes("não pertence")) {
          return res.status(403).json({ error: error.message });
        }
        next(error);
      }
    }
  );

  // NathIA Chat (protected routes) - Maintain compatibility, redirects to general agent
  app.get(
    "/api/nathia/messages/:sessionId",
    requireAuth,
    validateSessionOwnership,
    generalApiLimiter,
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { sessionId } = req.params;

        // Get or create session (general agent for compatibility)
        const session = await aiSessionService.getOrCreateSession(
          sessionId,
          userId,
          "general"
        );

        const messages = await storage.getAiMessages(sessionId);
        res.json(messages);
      } catch (error) {
        if (error instanceof Error && error.message.includes("não pertence")) {
          return res.status(403).json({ error: error.message });
        }
        next(error);
      }
    }
  );

  app.post(
    "/api/nathia/chat",
    requireAuth,
    validateSessionOwnership,
    aiChatLimiter,
    validateBody(nathiaChatSchema),
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { sessionId, message } = req.body;

        // Get or create session (general agent for compatibility)
        const session = await aiSessionService.getOrCreateSession(
          sessionId,
          userId,
          "general"
        );

        // Save user message
        await storage.createAiMessage({
          sessionId: session.id,
          role: "user",
          content: message,
        });

        // Get recent messages for context
        const allMessages = await storage.getAiMessages(sessionId);
        const recentMessages = allMessages.slice(-AI.RECENT_MESSAGES_COUNT);

        // Build context for general agent
        const context = await buildContextForAgent("general", userId);

        // Get AI response using unified agent system
        const aiResponse = await chatWithAgent(
          "general",
          recentMessages.map((m) => ({ role: m.role, content: m.content })),
          context
        );

        // Save AI response
        await storage.createAiMessage({
          sessionId,
          role: "assistant",
          content: aiResponse,
        });

        res.json({ success: true });
      } catch (error) {
        if (error instanceof Error && error.message.includes("não pertence")) {
          return res.status(403).json({ error: error.message });
        }
        next(error);
      }
    }
  );

  // MãeValente Search (protected routes)
  app.get("/api/mae-valente/saved", requireAuth, generalApiLimiter, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const saved = await storage.getSavedQa(userId);
      res.json(saved);
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/mae-valente/search",
    aiSearchLimiter,
    validateBody(maeValenteSearchSchema),
    async (req, res, next) => {
      try {
        const { question } = req.body;

        // Create hash for caching
        const hash = crypto.createHash("md5").update(question.toLowerCase()).digest("hex");

        // Check cache first
        const cached = await storage.getQaCache(hash);
        if (cached) {
          return res.json({
            question,
            answer: cached.answer,
            sources: cached.sources,
          });
        }

        // Search with Perplexity
        const result = await searchWithPerplexity(question);

        // Cache the result (TTL: 7 days)
        const ttlExpiresAt = new Date();
        ttlExpiresAt.setDate(ttlExpiresAt.getDate() + 7);

        await storage.createQaCache({
          hash,
          question,
          answer: result.answer,
          sources: result.sources,
          ttlExpiresAt,
        });

        res.json({
          question,
          answer: result.answer,
          sources: result.sources,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post("/api/mae-valente/save", requireAuth, validateBody(saveQaSchema), async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { question, answer, sources } = req.body;

      const saved = await storage.createSavedQa({
        userId,
        question,
        answer,
        sources,
      });

      res.json(saved);
    } catch (error) {
      next(error);
    }
  });
}
