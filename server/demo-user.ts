import type { Request, Response, NextFunction } from "express";
import type { IStorage } from "./storage";

/**
 * Middleware to create and auto-login a demo user if no user is logged in
 * This allows the site to function without a login page while maintaining auth protection
 */
export function autoDemoLogin(storage: IStorage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip if user is already logged in
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    try {
      // Check if demo user exists
      let demoUser = await storage.getUserByEmail("demo@nossamaternidade.com");

      // Create demo user if it doesn't exist
      if (!demoUser) {
        demoUser = await storage.createUser({
          email: "demo@nossamaternidade.com",
          password: "demo123", // Will be hashed by storage
          emailVerified: true,
        });

        // Create profile for demo user
        await storage.createProfile({
          userId: demoUser.id,
          name: "Usuária Demo",
          gestationWeeks: 20,
        });
      }

      // Auto-login demo user
      req.login(demoUser, (err) => {
        if (err) {
          console.error("Auto-login demo user failed:", err);
          return next();
        }
        next();
      });
    } catch (error) {
      console.error("Error creating demo user:", error);
      next();
    }
  };
}
