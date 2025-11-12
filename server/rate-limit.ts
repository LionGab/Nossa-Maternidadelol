import rateLimit from "express-rate-limit";
import type { Request } from "express";
import type { User } from "@shared/schema";

// Extend Express Request to include user property
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

/**
 * Rate limiter for AI chat endpoints (NathIA)
 * Limits: 10 requests per minute per user
 */
export const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  message: {
    error: "Muitas mensagens enviadas. Aguarde um minuto e tente novamente.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for authenticated users in development
  skip: (req) => {
    return process.env.NODE_ENV === "development" && !!req.user;
  },
});

/**
 * Rate limiter for AI search endpoints (MãeValente)
 * Limits: 5 requests per minute per user (more expensive API)
 */
export const aiSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per window
  message: {
    error: "Muitas buscas realizadas. Aguarde um minuto e tente novamente.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development" && !!req.user;
  },
});

/**
 * Rate limiter for authentication endpoints
 * Limits: 5 attempts per 15 minutes per IP (prevent brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limiter for general API endpoints
 * Limits: 100 requests per 15 minutes per user/IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: "Muitas requisições. Tente novamente em alguns minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development";
  },
});
