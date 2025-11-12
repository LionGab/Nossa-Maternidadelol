import type { Request, Response, NextFunction } from "express";
import { supabase, getUserFromToken } from "./supabase";
import { storage } from "./storage";
import { logger } from "./logger";
import type { AuthenticatedRequest } from "./types";

/**
 * Extract JWT token from Authorization header or cookies
 */
function extractToken(req: Request): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try cookie (Supabase sets sb-<project-ref>-auth-token)
  const cookies = req.headers.cookie;
  if (cookies) {
    const match = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
    if (match) {
      try {
        // Cookie is URL encoded, decode it
        const decoded = decodeURIComponent(match[1]);
        // Try to parse as JSON (Supabase stores session as JSON in cookie)
        const session = JSON.parse(decoded);
        return session.access_token || null;
      } catch {
        // If not JSON, might be direct token
        return match[1];
      }
    }
  }

  return null;
}

/**
 * Middleware to check if user is authenticated using Supabase Auth
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: "Não autenticado. Faça login primeiro." });
      return;
    }

    // Verify token and get user
    const user = await getUserFromToken(token);

    if (!user) {
      res.status(401).json({ error: "Token inválido ou expirado." });
      return;
    }

    // Get user from our database (to ensure they exist in our system)
    // Use try-catch to handle database errors gracefully
    let dbUser;
    try {
      dbUser = await storage.getUser(user.id);
    } catch (dbError) {
      logger.error({ err: dbError, userId: user.id, msg: "Error fetching user from database" });
      // If database error, return 500 instead of 401
      res.status(500).json({ error: "Erro interno do servidor. Tente novamente mais tarde." });
      return;
    }

    if (!dbUser) {
      // User exists in Supabase Auth but not in our database
      // This shouldn't happen, but handle gracefully
      logger.warn({ userId: user.id, msg: "User in Supabase Auth but not in database" });
      res.status(401).json({ error: "Usuário não encontrado no sistema." });
      return;
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      ...dbUser,
    };

    // Update last login (don't block on error)
    try {
      await storage.updateUserLastLogin(user.id);
    } catch (error) {
      // Log but don't block request
      logger.warn({ err: error, userId: user.id, msg: "Failed to update last login" });
    }

    next();
  } catch (error: any) {
    // Check if it's a Supabase configuration error
    if (error.message?.includes("SUPABASE_URL") && process.env.NODE_ENV !== "production") {
      logger.error({ err: error, msg: "Supabase not configured - cannot authenticate" });
      res.status(500).json({ 
        error: "Autenticação não configurada. Configure Supabase ou use modo de desenvolvimento sem autenticação." 
      });
      return;
    }
    
    logger.error({ err: error, msg: "Auth middleware error" });
    res.status(401).json({ error: "Erro ao verificar autenticação." });
    return;
  }
}

/**
 * Optional authentication - doesn't block if not authenticated
 * Sets req.user if authenticated, otherwise continues without it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req);

    if (token) {
      const user = await getUserFromToken(token);
      if (user) {
        const dbUser = await storage.getUser(user.id);
        if (dbUser) {
          (req as AuthenticatedRequest).user = {
            ...dbUser,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't block on error, just continue without user
    logger.warn({ err: error, msg: "Optional auth error, continuing without user" });
    next();
  }
}

/**
 * Middleware to validate that userId in request matches authenticated user
 * Prevents identity spoofing by ensuring users can only access their own resources
 */
export function validateUserId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authenticatedUserId = (req as AuthenticatedRequest).user?.id;

  if (!authenticatedUserId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  // Check userId from body
  if (req.body?.userId && req.body.userId !== authenticatedUserId) {
    logger.warn({
      msg: "Identity spoofing attempt detected",
      authenticatedUserId,
      attemptedUserId: req.body.userId,
      path: req.path
    });
    res.status(403).json({ error: "Não autorizado: userId não corresponde ao usuário autenticado" });
    return;
  }

  // Check userId from params
  if (req.params?.userId && req.params.userId !== authenticatedUserId) {
    logger.warn({
      msg: "Identity spoofing attempt detected",
      authenticatedUserId,
      attemptedUserId: req.params.userId,
      path: req.path
    });
    res.status(403).json({ error: "Não autorizado: userId não corresponde ao usuário autenticado" });
    return;
  }

  // Check userId from query
  if (req.query?.userId && req.query.userId !== authenticatedUserId) {
    logger.warn({
      msg: "Identity spoofing attempt detected",
      authenticatedUserId,
      attemptedUserId: req.query.userId,
      path: req.path
    });
    res.status(403).json({ error: "Não autorizado: userId não corresponde ao usuário autenticado" });
    return;
  }

  next();
}

/**
 * Middleware to validate that sessionId belongs to authenticated user
 * Prevents users from accessing other users' AI sessions
 */
export async function validateSessionOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authenticatedUserId = (req as AuthenticatedRequest).user?.id;
    
    if (!authenticatedUserId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Get sessionId from params or body
    const sessionId = req.params?.sessionId || req.body?.sessionId;
    
    if (!sessionId) {
      // No sessionId to validate, continue
      return next();
    }

    // Import storage here to avoid circular dependency
    const { storage } = await import("./storage");
    
    // Check if session exists and belongs to user
    const session = await storage.getAiSession(sessionId);
    
    if (session && session.userId !== authenticatedUserId) {
      logger.warn({ 
        msg: "Unauthorized session access attempt",
        authenticatedUserId,
        sessionUserId: session.userId,
        sessionId,
        path: req.path 
      });
      return res.status(403).json({ error: "Não autorizado: sessão não pertence ao usuário autenticado" });
    }

    next();
  } catch (error) {
    logger.error({ err: error, msg: "Error validating session ownership" });
    return res.status(500).json({ error: "Erro ao validar autorização" });
  }
}

/**
 * Setup function for compatibility (no longer needed with Supabase Auth)
 * Kept for backwards compatibility but does nothing
 */
export function setupAuth(_app: any) {
  // No-op: Supabase Auth doesn't need setup like Passport.js
  logger.info({ msg: "Supabase Auth initialized (no setup required)" });
}
