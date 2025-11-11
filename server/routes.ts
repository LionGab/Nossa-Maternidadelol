import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithNathIA } from "./gemini";
import { searchWithPerplexity } from "./perplexity";
import { requireAuth } from "./auth";
import type { UserStats } from "@shared/schema";
import crypto from "crypto";
import { aiChatLimiter, aiSearchLimiter } from "./rate-limit";
import {
  validateBody,
  validateQuery,
  validateParams,
  nathiaChatSchema,
  maeValenteSearchSchema,
  saveQaSchema,
  createHabitSchema,
  createCommunityPostSchema,
  createCommentSchema,
  createReactionSchema,
  createReportSchema,
  createFavoriteSchema,
  postIdParamSchema,
  habitIdParamSchema,
} from "./validation";
import { logger } from "./logger";
import { paginationSchema, paginateArray } from "./pagination";
import { generateAvatar } from "./avatar";

export async function registerRoutes(app: Express): Promise<Server> {
  // Daily Featured
  app.get("/api/daily-featured", async (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const featured = await storage.getDailyFeatured(today);
    
    if (featured) {
      let tip = undefined;
      let post = undefined;
      
      if (featured.tipId) {
        const tips = await storage.getTips();
        tip = tips.find((t) => t.id === featured.tipId);
      }
      
      if (featured.postId) {
        post = await storage.getPost(featured.postId);
      }
      
      res.json({ ...featured, tip, post });
    } else {
      res.json(null);
    }
  });

  // Posts
  app.get("/api/posts/featured", async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts.slice(0, 3));
  });

  app.get("/api/posts", validateQuery(paginationSchema), async (req, res) => {
    const category = req.query.category as string;
    const { page, limit } = req.query as any;

    const posts = await storage.getPosts(category);
    const paginated = paginateArray(posts, page, limit);

    res.json(paginated);
  });

  // Viral Posts
  app.get("/api/viral-posts", validateQuery(paginationSchema), async (req, res) => {
    const featured = req.query.featured === "true" ? true : undefined;
    const category = req.query.category as string;
    const { page, limit } = req.query as any;

    const viralPosts = await storage.getViralPosts(featured, category);
    const paginated = paginateArray(viralPosts, page, limit);

    res.json(paginated);
  });

  // Favorites (protected routes)
  app.get("/api/favorites", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const favorites = await storage.getFavorites(userId);
    const postIds = favorites.map((f) => f.postId);
    res.json(postIds);
  });

  app.post("/api/favorites", requireAuth, validateBody(createFavoriteSchema), async (req, res) => {
    const userId = req.user!.id;
    const { postId } = req.body;
    const favorite = await storage.createFavorite({
      userId,
      postId,
    });
    res.json(favorite);
  });

  app.delete("/api/favorites/:postId", requireAuth, validateParams(postIdParamSchema), async (req, res) => {
    const userId = req.user!.id;
    const { postId } = req.params;
    await storage.deleteFavorite(userId, postId);
    res.json({ success: true });
  });

  // NathIA Chat (protected routes)
  app.get("/api/nathia/messages/:sessionId", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    // Create session if it doesn't exist
    let session = await storage.getAiSession(sessionId);
    if (!session) {
      session = await storage.createAiSession({
        userId,
      });
    }

    const messages = await storage.getAiMessages(sessionId);
    res.json(messages);
  });

  app.post("/api/nathia/chat", requireAuth, aiChatLimiter, validateBody(nathiaChatSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { sessionId, message } = req.body;

      // Create session if it doesn't exist
      let session = await storage.getAiSession(sessionId);
      if (!session) {
        session = await storage.createAiSession({
          id: sessionId,
          userId,
        });
      }
      
      // Save user message
      await storage.createAiMessage({
        sessionId: session.id,
        role: "user",
        content: message,
      });
      
      // Get recent messages for context (last 6 messages)
      const allMessages = await storage.getAiMessages(sessionId);
      const recentMessages = allMessages.slice(-6);
      
      // Get AI response
      const aiResponse = await chatWithNathIA(
        recentMessages.map((m) => ({ role: m.role, content: m.content })),
        { userStage: "pregnant" } // Could be dynamic based on profile
      );
      
      // Save AI response
      await storage.createAiMessage({
        sessionId,
        role: "assistant",
        content: aiResponse,
      });
      
      res.json({ success: true });
    } catch (error) {
      logger.error({ err: error, msg: "NathIA chat error" });
      res.status(500).json({ error: "Failed to get response" });
    }
  });

  // MãeValente Search (protected routes)
  app.get("/api/mae-valente/saved", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const saved = await storage.getSavedQa(userId);
    res.json(saved);
  });

  app.post("/api/mae-valente/search", aiSearchLimiter, validateBody(maeValenteSearchSchema), async (req, res) => {
    try {
      const { question } = req.body;
      
      // Create hash for caching
      const hash = crypto.createHash("md5").update(question.toLowerCase()).digest("hex");
      
      // Check cache first
      const cached = await storage.getQaCache(hash);
      if (cached) {
        return res.json({
          question,
          answer: cached.answer,
          sources: cached.sources,
        });
      }
      
      // Search with Perplexity
      const result = await searchWithPerplexity(question);
      
      // Cache the result (TTL: 7 days)
      const ttlExpiresAt = new Date();
      ttlExpiresAt.setDate(ttlExpiresAt.getDate() + 7);
      
      await storage.createQaCache({
        hash,
        question,
        answer: result.answer,
        sources: result.sources,
        ttlExpiresAt,
      });
      
      res.json({
        question,
        answer: result.answer,
        sources: result.sources,
      });
    } catch (error) {
      logger.error({ err: error, msg: "MãeValente search error" });
      res.status(500).json({ error: "Failed to search" });
    }
  });

  app.post("/api/mae-valente/save", requireAuth, validateBody(saveQaSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { question, answer, sources } = req.body;

      const saved = await storage.createSavedQa({
        userId,
        question,
        answer,
        sources,
      });

      res.json(saved);
    } catch (error) {
      logger.error({ err: error, msg: "Save Q&A error" });
      res.status(500).json({ error: "Failed to save" });
    }
  });

  // Habits (Gamified - protected routes)
  app.get("/api/habits", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const habits = await storage.getHabits(userId);

    if (habits.length === 0) {
      return res.json([]);
    }

    const today = new Date().toISOString().split("T")[0];
    const habitIds = habits.map((h) => h.id);

    // Optimize: fetch all completions in one query (last 365 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    const startDateStr = startDate.toISOString().split("T")[0];

    const allCompletions = await storage.getHabitCompletionsByHabitIds(
      habitIds,
      startDateStr,
      today
    );

    // Group completions by habitId and date for O(1) lookup
    const completionMap = new Map<string, Set<string>>();
    for (const completion of allCompletions) {
      if (!completionMap.has(completion.habitId)) {
        completionMap.set(completion.habitId, new Set());
      }
      completionMap.get(completion.habitId)!.add(completion.date);
    }

    // Calculate completion status and streaks efficiently
    const habitsWithCompletion = habits.map((habit) => {
      const habitDates = completionMap.get(habit.id) || new Set();
      const completedToday = habitDates.has(today);

      // Calculate streak by checking consecutive days backwards from today
      let streak = 0;
      let checkDate = new Date(today);
      while (streak < 365) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (!habitDates.has(dateStr)) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      return {
        ...habit,
        completedToday,
        // Legacy support for old frontend
        entry: completedToday
          ? {
              done: true,
              completedAt: allCompletions.find(
                (c) => c.habitId === habit.id && c.date === today
              )?.completedAt,
            }
          : undefined,
        streak,
      };
    });

    res.json(habitsWithCompletion);
  });

  // Week stats (legacy endpoint for backwards compatibility)
  app.get("/api/habits/week-stats", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const habits = await storage.getHabits(userId);

    if (habits.length === 0) {
      return res.json({ completed: 0, total: 0 });
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6); // 7 days including today

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = today.toISOString().split("T")[0];
    const habitIds = habits.map(h => h.id);

    // Batch load all completions for the week (1 query instead of 7*N)
    const completions = await storage.getHabitCompletionsByHabitIds(
      habitIds,
      startDateStr,
      endDateStr
    );

    const total = habits.length * 7;
    const completed = completions.length;

    res.json({ completed, total });
  });

  app.post("/api/habits", requireAuth, validateBody(createHabitSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { title, emoji, color } = req.body;

      const existingHabits = await storage.getHabits(userId);
      const maxOrder = existingHabits.length > 0
        ? Math.max(...existingHabits.map((h) => h.order))
        : 0;

      const habit = await storage.createHabit({
        userId,
        title,
        emoji,
        color,
        order: maxOrder + 1,
      });

      // Check for achievements
      const habits = await storage.getHabits(userId);
      if (habits.length === 1) {
        await storage.unlockAchievement(userId, "first_habit");
      } else if (habits.length === 5) {
        await storage.unlockAchievement(userId, "habit_master");
      }

      res.json(habit);
    } catch (error) {
      logger.error({ err: error, msg: "Create habit error" });
      res.status(500).json({ error: "Failed to create habit" });
    }
  });

  app.delete("/api/habits/:habitId", requireAuth, validateParams(habitIdParamSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { habitId } = req.params;

      // Verify ownership
      const habit = await storage.getHabit(habitId);
      if (!habit || habit.userId !== userId) {
        return res.status(404).json({ error: "Hábito não encontrado" });
      }

      await storage.deleteHabit(habitId);
      res.json({ success: true });
    } catch (error) {
      logger.error({ err: error, msg: "Delete habit error" });
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  app.post("/api/habits/:habitId/complete", requireAuth, validateParams(habitIdParamSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { habitId } = req.params;
      const today = new Date().toISOString().split("T")[0];

      // Verify ownership
      const habit = await storage.getHabit(habitId);
      if (!habit || habit.userId !== userId) {
        return res.status(404).json({ error: "Hábito não encontrado" });
      }

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

      // Update user stats (+10 XP per completion)
      const stats = await storage.createOrUpdateUserStats(userId, 10);

      // Update streak
      await storage.updateStreak(userId, today);

      // Check achievements
      const updatedStats = await storage.getUserStats(userId);
      if (updatedStats) {
        // Check streak achievements
        if (updatedStats.currentStreak === 3) {
          await storage.unlockAchievement(userId, "streak_3");
        } else if (updatedStats.currentStreak === 7) {
          await storage.unlockAchievement(userId, "streak_7");
        } else if (updatedStats.currentStreak === 30) {
          await storage.unlockAchievement(userId, "streak_30");
        }

        // Check completion achievements
        if (updatedStats.totalCompletions === 10) {
          await storage.unlockAchievement(userId, "completions_10");
        } else if (updatedStats.totalCompletions === 50) {
          await storage.unlockAchievement(userId, "completions_50");
        } else if (updatedStats.totalCompletions === 100) {
          await storage.unlockAchievement(userId, "completions_100");
        }

        // Check level achievements
        if (updatedStats.level === 5) {
          await storage.unlockAchievement(userId, "level_5");
        } else if (updatedStats.level === 10) {
          await storage.unlockAchievement(userId, "level_10");
        }
      }

      res.json({ success: true, stats });
    } catch (error) {
      logger.error({ err: error, msg: "Complete habit error" });
      res.status(500).json({ error: "Failed to complete habit" });
    }
  });

  app.delete("/api/habits/:habitId/complete", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { habitId } = req.params;
      const today = new Date().toISOString().split("T")[0];

      await storage.deleteHabitCompletion(habitId, today);

      // Subtract XP and decrement total completions
      await storage.createOrUpdateUserStats(userId, -10, false);

      // Recalculate streak
      const stats = await storage.getUserStats(userId);
      if (stats) {
        let newStreak = 0;
        let checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

        while (newStreak < 365) {
          const dateStr = checkDate.toISOString().split("T")[0];
          const dayCompletions = await storage.getHabitCompletions(userId, dateStr, dateStr);
          if (dayCompletions.length === 0) break;
          newStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        // Update streak directly
        const updatedStats = { ...stats, currentStreak: newStreak, updatedAt: new Date() };
        // Access internal map to update
        const statsArray = Array.from((storage as any).userStats.values()) as UserStats[];
        const userStat = statsArray.find((s) => s.userId === userId);
        if (userStat) {
          Object.assign(userStat, updatedStats);
        }
      }

      res.json({ success: true });
    } catch (error) {
      logger.error({ err: error, msg: "Uncomplete habit error" });
      res.status(500).json({ error: "Failed to uncomplete habit" });
    }
  });

  // User Stats (protected)
  app.get("/api/stats", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const stats = await storage.getUserStats(userId);
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
  });

  // Achievements (protected)
  app.get("/api/achievements", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const allAchievements = await storage.getAchievements();
    const userAchievements = await storage.getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    const achievementsWithStatus = allAchievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find((ua) => ua.achievementId === achievement.id)?.unlockedAt,
    }));

    res.json(achievementsWithStatus);
  });

  // Habit History (for calendar view - protected)
  app.get("/api/habits/history", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate required" });
    }

    const completions = await storage.getHabitCompletions(
      userId,
      startDate as string,
      endDate as string
    );

    res.json(completions);
  });

  // Community (RefúgioNath)
  app.get("/api/community/question", async (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const question = await storage.getDailyQuestion(today);
    res.json(question || null);
  });

  app.get("/api/community/posts", validateQuery(paginationSchema), async (req, res) => {
    const type = req.query.type as string | undefined;
    const tag = req.query.tag as string | undefined;
    const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
    const { page, limit } = req.query as any;

    // Storage.getCommunityPosts has its own limit param - we'll override with pagination
    const posts = await storage.getCommunityPosts(type, undefined, tag, featured);
    const paginated = paginateArray(posts, page, limit);

    res.json(paginated);
  });

  app.post("/api/community/posts", requireAuth, validateBody(createCommunityPostSchema), async (req, res) => {
    try {
      const userId = req.user!.id;

      // Fetch user profile to get authorName
      const profile = await storage.getProfile(userId);
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
      logger.error({ err: error, msg: "Error creating community post" });
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar post" });
    }
  });

  // Comments
  app.get("/api/community/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;
    const comments = await storage.getComments(postId);
    res.json(comments);
  });

  app.post("/api/community/posts/:postId/comments", requireAuth, validateBody(createCommentSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;

      // Fetch user profile to get authorName
      const profile = await storage.getProfile(userId);
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
      logger.error({ err: error, msg: "Error creating comment" });
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar comentário" });
    }
  });

  // Reactions
  app.post("/api/community/posts/:postId/reactions", requireAuth, validateBody(createReactionSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;
      const reaction = await storage.createReaction({
        postId,
        userId,
        type: req.body.type, // "heart", "hands", "sparkles"
      });
      res.json(reaction);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao adicionar reação" });
    }
  });

  app.delete("/api/community/posts/:postId/reactions/:type", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { postId, type } = req.params;
      await storage.deleteReaction(postId, userId, type);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao remover reação" });
    }
  });

  // Reports
  app.post("/api/community/posts/:postId/reports", requireAuth, validateBody(createReportSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const { postId } = req.params;
      const report = await storage.createReport({
        postId,
        userId,
        reason: req.body.reason,
      });
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao reportar post" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
