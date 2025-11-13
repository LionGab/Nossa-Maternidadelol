/**
 * Community Routes - RefúgioNath (posts, comments, reactions, reports)
 */

import type { Express } from "express";
import { requireAuth } from "../auth";
import {
  validateBody,
  validateQuery,
  validateParams,
  createCommunityPostSchema,
  createCommentSchema,
  createReactionSchema,
  createReportSchema,
} from "../validation";
import { logger } from "../logger";
import type { AuthenticatedRequest } from "../types";
import { paginationSchema, paginateArray } from "../pagination";
import { generateAvatar } from "../avatar";
import { storage } from "../storage";
import { generalApiLimiter } from "../rate-limit";

export function registerCommunityRoutes(app: Express): void {
  // Community (RefúgioNath) - public routes
  app.get("/api/community/question", generalApiLimiter, async (req, res, next) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const question = await storage.getDailyQuestion(today);
      res.json(question || null);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/community/posts", validateQuery(paginationSchema), generalApiLimiter, async (req, res, next) => {
    try {
      const type = req.query.type as string | undefined;
      const tag = req.query.tag as string | undefined;
      const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
      const validated = paginationSchema.parse(req.query);
      const { page, limit } = validated;

      // Storage.getCommunityPosts has its own limit param - we'll override with pagination
      const posts = await storage.getCommunityPosts(type, undefined, tag, featured);
      const paginated = paginateArray(posts, page, limit);

      res.json(paginated);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/community/posts", requireAuth, validateBody(createCommunityPostSchema), async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      // Fetch user profile to get authorName
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(400).json({ error: "Perfil do usuário não encontrado" });
      }

      // Generate deterministic avatar based on userId
      const avatarUrl = generateAvatar(userId, "lorelei");

      const post = await storage.createCommunityPost({
        userId,
        authorName: profile.name,
        avatarUrl,
        type: req.body.type,
        content: req.body.content,
        tag: req.body.tag || null,
      });
      res.json(post);
    } catch (error) {
      next(error);
    }
  });

  // Comments (public route - GET, protected - POST)
  app.get("/api/community/posts/:postId/comments", generalApiLimiter, async (req, res, next) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getComments(postId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/community/posts/:postId/comments",
    requireAuth,
    validateBody(createCommentSchema),
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { postId } = req.params;

        // Fetch user profile to get authorName
        const profile = await storage.getProfileByUserId(userId);
        if (!profile) {
          return res.status(400).json({ error: "Perfil do usuário não encontrado" });
        }

        // Generate deterministic avatar based on userId
        const avatarUrl = generateAvatar(userId, "lorelei");

        const comment = await storage.createComment({
          postId,
          userId,
          authorName: profile.name,
          avatarUrl,
          content: req.body.content,
        });
        res.json(comment);
      } catch (error) {
        next(error);
      }
    }
  );

  // Reactions
  app.post(
    "/api/community/posts/:postId/reactions",
    requireAuth,
    validateBody(createReactionSchema),
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { postId } = req.params;
        const reaction = await storage.createReaction({
          postId,
          userId,
          type: req.body.type, // "heart", "hands", "sparkles"
        });
        res.json(reaction);
      } catch (error) {
        next(error);
      }
    }
  );

  app.delete("/api/community/posts/:postId/reactions/:type", requireAuth, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { postId, type } = req.params;
      await storage.deleteReaction(postId, userId, type);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Reports
  app.post(
    "/api/community/posts/:postId/reports",
    requireAuth,
    validateBody(createReportSchema),
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { postId } = req.params;
        const report = await storage.createReport({
          postId,
          userId,
          reason: req.body.reason,
        });
        res.json(report);
      } catch (error) {
        next(error);
      }
    }
  );
}
