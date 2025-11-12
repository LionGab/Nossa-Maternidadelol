import type { Request } from "express";
import type { User } from "@shared/schema";

/**
 * Request with authenticated user
 * Use this type for routes that use requireAuth middleware
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}

