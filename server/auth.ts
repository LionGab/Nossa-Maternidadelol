import type { Request, Response, NextFunction } from "express";
import { supabase, getUserFromToken } from "./supabase";
import { storage } from "./storage";
import { logger } from "./logger";

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
) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ error: "Não autenticado. Faça login primeiro." });
    }

    // Verify token and get user
    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    // Get user from our database (to ensure they exist in our system)
    const dbUser = await storage.getUser(user.id);

    if (!dbUser) {
      // User exists in Supabase Auth but not in our database
      // This shouldn't happen, but handle gracefully
      logger.warn({ userId: user.id, msg: "User in Supabase Auth but not in database" });
      return res.status(401).json({ error: "Usuário não encontrado no sistema." });
    }

    // Attach user to request
    (req as any).user = {
      ...dbUser,
    };

    // Update last login
    await storage.updateUserLastLogin(user.id);

    next();
  } catch (error) {
    logger.error({ err: error, msg: "Auth middleware error" });
    return res.status(401).json({ error: "Erro ao verificar autenticação." });
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
          (req as any).user = {
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
 * Setup function for compatibility (no longer needed with Supabase Auth)
 * Kept for backwards compatibility but does nothing
 */
export function setupAuth(_app: any) {
  // No-op: Supabase Auth doesn't need setup like Passport.js
  logger.info({ msg: "Supabase Auth initialized (no setup required)" });
}
