/**
 * Content Routes - Posts, Viral Posts, Favorites, Daily Featured
 */

import type { Express } from "express";
import { validateQuery } from "../validation";
import { paginationSchema, paginateArray } from "../pagination";
import { logger } from "../logger";
import { contentService } from "../services/content.service";
import { CONTENT } from "../constants";
import type { AuthenticatedRequest } from "../types";
import { requireAuth } from "../auth";
import { validateBody, validateParams, createFavoriteSchema, postIdParamSchema } from "../validation";
import { storage } from "../storage";
import { generalApiLimiter } from "../rate-limit";

export function registerContentRoutes(app: Express): void {
  // Daily Featured (public route)
  app.get("/api/daily-featured", generalApiLimiter, async (req, res, next) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const featured = await contentService.getDailyFeatured(today);
      res.json(featured);
    } catch (error) {
      next(error);
    }
  });

  // Posts (public routes)
  app.get("/api/posts/featured", generalApiLimiter, async (req, res, next) => {
    try {
      const posts = await contentService.getFeaturedPosts();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts", validateQuery(paginationSchema), generalApiLimiter, async (req, res, next) => {
    try {
      const category = req.query.category as string | undefined;
      const validated = paginationSchema.parse(req.query);
      const { page, limit } = validated;

      const posts = await storage.getPosts(category);
      const paginated = paginateArray(posts, page, limit);

      res.json(paginated);
    } catch (error) {
      next(error);
    }
  });

  // Viral Posts (public route)
  app.get("/api/viral-posts", validateQuery(paginationSchema), generalApiLimiter, async (req, res, next) => {
    try {
      const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
      const category = req.query.category as string | undefined;
      const validated = paginationSchema.parse(req.query);
      const { page, limit } = validated;

      const viralPosts = await storage.getViralPosts(featured, category);
      const paginated = paginateArray(viralPosts, page, limit);

      res.json(paginated);
    } catch (error) {
      next(error);
    }
  });

  // Favorites (protected routes)
  app.get("/api/favorites", requireAuth, generalApiLimiter, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const favorites = await storage.getFavorites(userId);
      const postIds = favorites.map((f) => f.postId);
      res.json(postIds);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/favorites", requireAuth, validateBody(createFavoriteSchema), async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { postId } = req.body;
      const favorite = await storage.createFavorite({
        userId,
        postId,
      });
      res.json(favorite);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/favorites/:postId", requireAuth, validateParams(postIdParamSchema), async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { postId } = req.params;
      await storage.deleteFavorite(userId, postId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
}
