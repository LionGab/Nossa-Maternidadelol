/**
 * Ownership Validation Middleware
 * Ensures users can only access their own resources
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import type { AuthenticatedRequest } from "../types";
import { logger } from "../logger";

/**
 * Validate that a resource belongs to the authenticated user
 */
export function validateResourceOwnership<T extends { userId: string }>(
  getResource: (id: string) => Promise<T | null>,
  resourceIdParam: string = "id"
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const resourceId = 
        req.params[resourceIdParam] || 
        req.params.habitId || 
        req.params.sessionId ||
        req.params.postId;
      
      if (!resourceId) {
        return res.status(400).json({ error: "ID do recurso não fornecido" });
      }
      
      const resource = await getResource(resourceId);
      
      if (!resource) {
        return res.status(404).json({ error: "Recurso não encontrado" });
      }
      
      if (resource.userId !== req.user.id) {
        logger.warn({
          msg: "Unauthorized resource access attempt",
          userId: req.user.id,
          resourceUserId: resource.userId,
          resourceId,
          path: req.path,
        });
        return res.status(403).json({ error: "Não autorizado: recurso não pertence ao usuário" });
      }
      
      // Attach resource to request for use in route handler
      (req as any).resource = resource;
      next();
    } catch (error) {
      logger.error({ err: error, msg: "Error validating resource ownership" });
      res.status(500).json({ error: "Erro ao validar autorização" });
    }
  };
}
