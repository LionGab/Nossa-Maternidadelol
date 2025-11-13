/**
 * Habits Routes - Habit management and gamification
 */

import type { Express } from "express";
import { requireAuth } from "../auth";
import { validateBody, validateParams, createHabitSchema, habitIdParamSchema } from "../validation";
import { logger } from "../logger";
import type { AuthenticatedRequest } from "../types";
import { habitsService } from "../services/habits.service";
import { gamificationService } from "../services/gamification.service";
import { storage } from "../storage";
import { GAMIFICATION } from "../constants";
import { validateResourceOwnership } from "../middleware/ownership.middleware";
import { generalApiLimiter } from "../rate-limit";
import { z } from "zod";
import { validateQuery } from "../validation";
import type { UserStats } from "@shared/schema";
import { cache, CacheKeys, CacheTTL } from "../cache";

const dateRangeQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido"),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "startDate deve ser anterior ou igual a endDate",
});

export function registerHabitsRoutes(app: Express): void {
  // Get habits with stats
  app.get("/api/habits", requireAuth, generalApiLimiter, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const habits = await habitsService.getHabitsWithStats(userId);
      res.json(habits);
    } catch (error) {
      next(error);
    }
  });

  // Week stats (legacy endpoint for backwards compatibility)
  app.get("/api/habits/week-stats", requireAuth, generalApiLimiter, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const stats = await habitsService.getWeekStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Create habit
  app.post("/api/habits", requireAuth, validateBody(createHabitSchema), async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { title, emoji, color } = req.body;

      const habit = await habitsService.createHabit(userId, { title, emoji, color });

      // Check for habit count achievements
      const habits = await storage.getHabits(userId);
      await gamificationService.checkHabitCountAchievements(userId, habits.length);

      res.json(habit);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Limite")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  });

  // Delete habit
  app.delete(
    "/api/habits/:habitId",
    requireAuth,
    validateParams(habitIdParamSchema),
    validateResourceOwnership(storage.getHabit.bind(storage), "habitId"),
    async (req, res, next) => {
      try {
        const { habitId } = req.params;
        await storage.deleteHabit(habitId);
        res.json({ success: true });
      } catch (error) {
        next(error);
      }
    }
  );

  // Complete habit
  app.post(
    "/api/habits/:habitId/complete",
    requireAuth,
    validateParams(habitIdParamSchema),
    validateResourceOwnership(storage.getHabit.bind(storage), "habitId"),
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { habitId } = req.params;
        const today = new Date().toISOString().split("T")[0];

        // Check if already completed
        const existing = await storage.getHabitCompletion(habitId, today);
        if (existing) {
          return res.json({ alreadyCompleted: true });
        }

        // Create completion
        await storage.createHabitCompletion({
          habitId,
          userId,
          date: today,
        });

        // Invalidate caches
        await habitsService.invalidateHabitCaches(userId, today);

        // Update user stats (XP per completion)
        const stats = await storage.createOrUpdateUserStats(userId, GAMIFICATION.XP_PER_COMPLETION);

        // Update streak
        await storage.updateStreak(userId, today);

        // Check achievements
        const updatedStats = await storage.getUserStats(userId);
        if (updatedStats) {
          await gamificationService.checkAndUnlockAchievements(userId, updatedStats);
        }

        res.json({ success: true, stats });
      } catch (error) {
        next(error);
      }
    }
  );

  // Uncomplete habit
  app.delete(
    "/api/habits/:habitId/complete",
    requireAuth,
    validateParams(habitIdParamSchema),
    validateResourceOwnership(storage.getHabit.bind(storage), "habitId"),
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { habitId } = req.params;
        const today = new Date().toISOString().split("T")[0];

        await storage.deleteHabitCompletion(habitId, today);

        // Subtract XP and decrement total completions
        await storage.createOrUpdateUserStats(userId, -GAMIFICATION.XP_PER_COMPLETION, false);

        // Recalculate streak
        const stats = await storage.getUserStats(userId);
        if (stats) {
          let newStreak = 0;
          let checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

          while (newStreak < GAMIFICATION.MAX_STREAK_DAYS) {
            const dateStr = checkDate.toISOString().split("T")[0];
            const dayCompletions = await storage.getHabitCompletions(userId, dateStr, dateStr);
            if (dayCompletions.length === 0) break;
            newStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }

          // Update streak using storage method
          await storage.updateStreakValue(userId, newStreak);
        }

        // Invalidate caches
        await habitsService.invalidateHabitCaches(userId, today);

        res.json({ success: true });
      } catch (error) {
        next(error);
      }
    }
  );

  // User Stats (protected)
  app.get("/api/stats", requireAuth, generalApiLimiter, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check cache first
      const cacheKey = CacheKeys.userStats(userId);
      let stats: UserStats | null = await cache.get<UserStats>(cacheKey);

      if (!stats) {
        stats = await storage.getUserStats(userId);
        if (stats) {
          await cache.set(cacheKey, stats, CacheTTL.USER_STATS);
        }
      }
      
      if (!stats) {
        // Return default stats
        return res.json({
          xp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
        });
      }
      
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Achievements (protected)
  app.get("/api/achievements", requireAuth, generalApiLimiter, async (req, res, next) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const allAchievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(userId);
      const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

      const achievementsWithStatus = allAchievements.map((achievement) => ({
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlockedAt: userAchievements.find((ua) => ua.achievementId === achievement.id)?.unlockedAt,
      }));

      res.json(achievementsWithStatus);
    } catch (error) {
      next(error);
    }
  });

  // Habit History (for calendar view - protected)
  app.get(
    "/api/habits/history",
    requireAuth,
    validateQuery(dateRangeQuerySchema),
    generalApiLimiter,
    async (req, res, next) => {
      try {
        const userId = (req as AuthenticatedRequest).user.id;
        const { startDate, endDate } = req.query as { startDate: string; endDate: string };

        const completions = await storage.getHabitCompletions(userId, startDate, endDate);
        res.json(completions);
      } catch (error) {
        next(error);
      }
    }
  );
}
