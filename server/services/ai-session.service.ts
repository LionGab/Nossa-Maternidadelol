/**
 * AI Session Service - Business logic for AI chat sessions
 */

import { storage } from "../storage";
import type { AgentType, AiSession } from "@shared/schema";

export class AISessionService {
  /**
   * Get or create an AI session, ensuring ownership
   */
  async getOrCreateSession(
    sessionId: string | undefined,
    userId: string,
    agentType: AgentType
  ): Promise<AiSession> {
    if (sessionId) {
      const existing = await storage.getAiSession(sessionId);
      if (existing) {
        if (existing.userId !== userId) {
          throw new Error("Sessão não pertence ao usuário");
        }
        return existing;
      }
    }

    return await storage.createAiSession({
      id: sessionId,
      userId,
      agentType,
    });
  }

  /**
   * Validate session ownership
   */
  async validateOwnership(
    sessionId: string,
    userId: string
  ): Promise<AiSession> {
    const session = await storage.getAiSession(sessionId);
    
    if (!session) {
      throw new Error("Sessão não encontrada");
    }
    
    if (session.userId !== userId) {
      throw new Error("Sessão não pertence ao usuário");
    }
    
    return session;
  }
}

export const aiSessionService = new AISessionService();
