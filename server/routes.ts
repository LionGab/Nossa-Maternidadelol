import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithNathIA } from "./gemini";
import { searchWithPerplexity } from "./perplexity";
import { requireAuth, validateUserId, validateSessionOwnership } from "./auth";
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
  sessionIdParamSchema,
} from "./validation";
import { chatWithAgent } from "./agents/base-agent";
import { buildContextForAgent } from "./agents/context-builders";
import type { AgentType } from "@shared/schema";
import { logger } from "./logger";
import { paginationSchema, paginateArray } from "./pagination";
import { generateAvatar } from "./avatar";
import { cache, CacheKeys, CacheTTL } from "./cache";
import { uploadFile, validateFileType, validateFileSize } from "./storage-upload";
import type { AuthenticatedRequest } from "./types";
import {
  GAMIFICATION,
  ACHIEVEMENTS,
  COMMUNITY,
  AI,
  UPLOAD,
  TIME,
  CONTENT,
} from "./constants";

/**
 * Register routes without creating HTTP server (for Vercel/serverless)
 */
export function registerRoutesSync(app: Express): void {
  // Health Check Endpoints (public, for monitoring)
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  app.get("/health/ready", async (_req, res) => {
    const checks = {
      storage: false,
      gemini: false,
      perplexity: false,
    };

    try {
      // Check storage (try to get tips - lightweight query)
      await storage.getTips();
      checks.storage = true;
    } catch (e) {
      logger.warn({ msg: "Health check: storage failed", err: e });
    }

    try {
      // Check AI APIs (just verify keys exist)
      checks.gemini = !!process.env.GEMINI_API_KEY;
      checks.perplexity = !!process.env.PERPLEXITY_API_KEY;
    } catch (e) {
      logger.warn({ msg: "Health check: AI APIs failed", err: e });
    }

    const isHealthy = checks.storage && checks.gemini && checks.perplexity;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health/integrations", (_req, res) => {
    res.json({
      database: !!process.env.DATABASE_URL,
      supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      sentry: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
    });
  });

  // Daily Featured (public route)
  app.get("/api/daily-featured", async (req, res) => {
    try {
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
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching daily featured" });
      res.status(500).json({ error: "Erro ao carregar conteúdo do dia." });
    }
  });

  // Posts (public routes)
  app.get("/api/posts/featured", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts.slice(0, CONTENT.FEATURED_POSTS_COUNT));
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching featured posts" });
      res.status(500).json({ error: "Erro ao carregar posts em destaque." });
    }
  });

  app.get("/api/posts", validateQuery(paginationSchema), async (req, res) => {
    try {
      const category = req.query.category as string;
      const { page, limit } = req.query as any;

      const posts = await storage.getPosts(category);
      const paginated = paginateArray(posts, page, limit);

      res.json(paginated);
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching posts" });
      res.status(500).json({ error: "Erro ao carregar posts." });
    }
  });

  // Viral Posts (public route)
  app.get("/api/viral-posts", validateQuery(paginationSchema), async (req, res) => {
    try {
      const featured = req.query.featured === "true" ? true : undefined;
      const category = req.query.category as string;
      const { page, limit } = req.query as any;

      const viralPosts = await storage.getViralPosts(featured, category);
      const paginated = paginateArray(viralPosts, page, limit);

      res.json(paginated);
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching viral posts" });
      res.status(500).json({ error: "Erro ao carregar posts virais." });
    }
  });

  // Favorites (protected routes)
  app.get("/api/favorites", requireAuth, async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.id;
    const favorites = await storage.getFavorites(userId);
    const postIds = favorites.map((f) => f.postId);
    res.json(postIds);
  });

  app.post("/api/favorites", requireAuth, validateBody(createFavoriteSchema), async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { postId } = req.body;
    const favorite = await storage.createFavorite({
      userId,
      postId,
    });
    res.json(favorite);
  });

  app.delete("/api/favorites/:postId", requireAuth, validateParams(postIdParamSchema), async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { postId } = req.params;
    await storage.deleteFavorite(userId, postId);
    res.json({ success: true });
  });

  // Unified Agent Routes (protected routes)
  app.get("/api/agents/:agentType/messages/:sessionId", requireAuth, validateSessionOwnership, validateParams(sessionIdParamSchema), async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { agentType, sessionId } = req.params as { agentType: AgentType; sessionId: string };

    // Create session if it doesn't exist
    let session = await storage.getAiSession(sessionId);
    if (!session) {
      session = await storage.createAiSession({
        userId,
        agentType: agentType as AgentType,
      });
    } else {
      // Double-check ownership (defense in depth)
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Não autorizado: sessão não pertence ao usuário" });
      }
    }

    const messages = await storage.getAiMessages(sessionId);
    res.json(messages);
  });

  app.post("/api/agents/:agentType/chat", requireAuth, validateSessionOwnership, aiChatLimiter, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { agentType } = req.params as { agentType: AgentType };
      const { sessionId, message } = req.body;

      // Create session if it doesn't exist
      let session = await storage.getAiSession(sessionId);
      if (!session) {
        session = await storage.createAiSession({
          id: sessionId,
          userId,
          agentType: agentType as AgentType,
        });
      } else {
        // Double-check ownership (defense in depth)
        if (session.userId !== userId) {
          return res.status(403).json({ error: "Não autorizado: sessão não pertence ao usuário" });
        }
      }

      // Save user message
      await storage.createAiMessage({
        sessionId: session.id,
        role: "user",
        content: message,
      });

      // Get recent messages for context
      const allMessages = await storage.getAiMessages(sessionId);
      const recentMessages = allMessages.slice(-AI.RECENT_MESSAGES_COUNT);

      // Build context for agent
      const context = await buildContextForAgent(agentType, userId);

      // Get AI response
      const aiResponse = await chatWithAgent(
        agentType,
        recentMessages.map((m) => ({ role: m.role, content: m.content })),
        context
      );

      // Save AI response
      await storage.createAiMessage({
        sessionId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({ success: true });
    } catch (error) {
      logger.error({ err: error, msg: `Agent ${req.params.agentType} chat error` });
      res.status(500).json({ error: "Failed to get response" });
    }
  });

  // NathIA Chat (protected routes) - Maintain compatibility, redirects to general agent
  app.get("/api/nathia/messages/:sessionId", requireAuth, validateSessionOwnership, async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.id;
    const { sessionId } = req.params;

    // Create session if it doesn't exist (general agent for compatibility)
    let session = await storage.getAiSession(sessionId);
    if (!session) {
      session = await storage.createAiSession({
        userId,
        agentType: "general",
      });
    } else {
      // Double-check ownership (defense in depth)
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Não autorizado: sessão não pertence ao usuário" });
      }
    }

    const messages = await storage.getAiMessages(sessionId);
    res.json(messages);
  });

  app.post("/api/nathia/chat", requireAuth, validateSessionOwnership, aiChatLimiter, validateBody(nathiaChatSchema), async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { sessionId, message } = req.body;

      // Create session if it doesn't exist (general agent for compatibility)
      let session = await storage.getAiSession(sessionId);
      if (!session) {
        session = await storage.createAiSession({
          id: sessionId,
          userId,
          agentType: "general",
        });
      } else {
        // Double-check ownership (defense in depth)
        if (session.userId !== userId) {
          return res.status(403).json({ error: "Não autorizado: sessão não pertence ao usuário" });
        }
      }

      // Save user message
      await storage.createAiMessage({
        sessionId: session.id,
        role: "user",
        content: message,
      });

      // Get recent messages for context
      const allMessages = await storage.getAiMessages(sessionId);
      const recentMessages = allMessages.slice(-AI.RECENT_MESSAGES_COUNT);

      // Build context for general agent
      const context = await buildContextForAgent("general", userId);

      // Get AI response using unified agent system
      const aiResponse = await chatWithAgent(
        "general",
        recentMessages.map((m) => ({ role: m.role, content: m.content })),
        context
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
    const userId = (req as AuthenticatedRequest).user.id;
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
      const userId = (req as AuthenticatedRequest).user.id;
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
    const userId = (req as AuthenticatedRequest).user.id;
    const habits = await storage.getHabits(userId);

    if (habits.length === 0) {
      return res.json([]);
    }

    const today = new Date().toISOString().split("T")[0];
    const habitIds = habits.map((h) => h.id);

    // Optimize: fetch all completions in one query (last year)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - TIME.DAYS_PER_YEAR);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Check cache first
    const cacheKey = CacheKeys.habitCompletions(userId, startDateStr, today);
    let allCompletions = await cache.get<any[]>(cacheKey);

    if (!allCompletions) {
      allCompletions = await storage.getHabitCompletionsByHabitIds(
        habitIds,
        startDateStr,
        today
      );
      // Cache for 1 hour
      await cache.set(cacheKey, allCompletions, CacheTTL.HABIT_COMPLETIONS);
    }

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
      // Using immutable approach to avoid Date mutation
      let streak = 0;
      let checkDate = new Date(today);
      while (streak < GAMIFICATION.MAX_STREAK_DAYS) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (!habitDates.has(dateStr)) break;
        streak++;
        // Create new Date instance instead of mutating (24h in milliseconds)
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
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
    const userId = (req as AuthenticatedRequest).user.id;
    const habits = await storage.getHabits(userId);

    if (habits.length === 0) {
      return res.json({ completed: 0, total: 0 });
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - TIME.HABIT_HISTORY_DAYS_OFFSET); // 7 days including today

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
      const userId = (req as AuthenticatedRequest).user.id;
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
      if (habits.length === ACHIEVEMENTS.THRESHOLDS.HABIT_COUNT_1) {
        await storage.unlockAchievement(userId, ACHIEVEMENTS.HABIT_COUNT_1);
      } else if (habits.length === ACHIEVEMENTS.THRESHOLDS.HABIT_COUNT_5) {
        await storage.unlockAchievement(userId, ACHIEVEMENTS.HABIT_COUNT_5);
      }

      res.json(habit);
    } catch (error) {
      logger.error({ err: error, msg: "Create habit error" });
      res.status(500).json({ error: "Failed to create habit" });
    }
  });

  app.delete("/api/habits/:habitId", requireAuth, validateParams(habitIdParamSchema), async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
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
      const userId = (req as AuthenticatedRequest).user.id;
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

      // Invalidate habit completions cache
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - TIME.DAYS_PER_YEAR);
      const startDateStr = startDate.toISOString().split("T")[0];
      const cacheKey = CacheKeys.habitCompletions(userId, startDateStr, today);
      await cache.del(cacheKey);

      // Invalidate user stats cache
      await cache.del(CacheKeys.userStats(userId));

      // Update user stats (XP per completion)
      const stats = await storage.createOrUpdateUserStats(userId, GAMIFICATION.XP_PER_COMPLETION);

      // Update streak
      await storage.updateStreak(userId, today);

      // Check achievements
      const updatedStats = await storage.getUserStats(userId);
      if (updatedStats) {
        // Check streak achievements
        if (updatedStats.currentStreak === ACHIEVEMENTS.THRESHOLDS.STREAK_3) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.STREAK_3);
        } else if (updatedStats.currentStreak === ACHIEVEMENTS.THRESHOLDS.STREAK_7) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.STREAK_7);
        } else if (updatedStats.currentStreak === ACHIEVEMENTS.THRESHOLDS.STREAK_30) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.STREAK_30);
        }

        // Check completion achievements
        if (updatedStats.totalCompletions === ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_10) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.COMPLETIONS_10);
        } else if (updatedStats.totalCompletions === ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_50) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.COMPLETIONS_50);
        } else if (updatedStats.totalCompletions === ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_100) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.COMPLETIONS_100);
        }

        // Check level achievements
        if (updatedStats.level === ACHIEVEMENTS.THRESHOLDS.LEVEL_5) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.LEVEL_5);
        } else if (updatedStats.level === ACHIEVEMENTS.THRESHOLDS.LEVEL_10) {
          await storage.unlockAchievement(userId, ACHIEVEMENTS.LEVEL_10);
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

      res.json({ success: true });
    } catch (error) {
      logger.error({ err: error, msg: "Uncomplete habit error" });
      res.status(500).json({ error: "Failed to uncomplete habit" });
    }
  });

  // User Stats (protected)
  app.get("/api/stats", requireAuth, async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.id;

    // Check cache first
    const cacheKey = CacheKeys.userStats(userId);
    let stats = await cache.get<any>(cacheKey);

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
  });

  // Achievements (protected)
  app.get("/api/achievements", requireAuth, async (req, res) => {
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
  });

  // Habit History (for calendar view - protected)
  app.get("/api/habits/history", requireAuth, async (req, res) => {
    const userId = (req as AuthenticatedRequest).user.id;
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

  // Community (RefúgioNath) - public routes
  app.get("/api/community/question", async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const question = await storage.getDailyQuestion(today);
      res.json(question || null);
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching daily question" });
      res.status(500).json({ error: "Erro ao carregar pergunta do dia." });
    }
  });

  app.get("/api/community/posts", validateQuery(paginationSchema), async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const tag = req.query.tag as string | undefined;
      const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
      const { page, limit } = req.query as any;

      // Storage.getCommunityPosts has its own limit param - we'll override with pagination
      const posts = await storage.getCommunityPosts(type, undefined, tag, featured);
      const paginated = paginateArray(posts, page, limit);

      res.json(paginated);
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching community posts" });
      res.status(500).json({ error: "Erro ao carregar posts da comunidade." });
    }
  });

  app.post("/api/community/posts", requireAuth, validateBody(createCommunityPostSchema), async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

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

  // Comments (public route - GET, protected - POST)
  app.get("/api/community/posts/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getComments(postId);
      res.json(comments);
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching comments", postId: req.params.postId });
      res.status(500).json({ error: "Erro ao carregar comentários." });
    }
  });

  app.post("/api/community/posts/:postId/comments", requireAuth, validateBody(createCommentSchema), async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
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
      const userId = (req as AuthenticatedRequest).user.id;
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
      const userId = (req as AuthenticatedRequest).user.id;
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
      const userId = (req as AuthenticatedRequest).user.id;
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

  // File Upload Routes (protected)
  // Note: For now, these routes accept base64 encoded files
  // In production, use proper multipart/form-data with multer
  app.post("/api/upload/avatar", requireAuth, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { file, filename, contentType } = req.body;

      if (!file || !filename) {
        return res.status(400).json({ error: "Arquivo não fornecido" });
      }

      // Validate file type
      if (!validateFileType(filename, UPLOAD.AVATAR_ALLOWED_TYPES)) {
        return res.status(400).json({ error: `Tipo de arquivo não permitido. Use: ${UPLOAD.AVATAR_ALLOWED_TYPES.join(", ").toUpperCase()}` });
      }

      // Decode base64 file
      const fileBuffer = Buffer.from(file, "base64");

      // Validate file size
      if (!validateFileSize(fileBuffer.length, UPLOAD.AVATAR_MAX_SIZE)) {
        return res.status(400).json({ error: `Arquivo muito grande. Máximo: ${UPLOAD.AVATAR_MAX_SIZE / (1024 * 1024)}MB` });
      }

      // Generate unique filename
      const extension = filename.split(".").pop();
      const uniqueFilename = `${userId}/${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const result = await uploadFile(UPLOAD.AVATAR_BUCKET, uniqueFilename, fileBuffer, contentType || UPLOAD.DEFAULT_CONTENT_TYPE, {
        upsert: false,
        cacheControl: String(UPLOAD.CACHE_CONTROL_SECONDS),
      });

      res.json({
        url: result.publicUrl,
        path: result.path,
      });
    } catch (error) {
      logger.error({ err: error, msg: "Avatar upload error" });
      res.status(500).json({ error: "Erro ao fazer upload do avatar" });
    }
  });

  app.post("/api/upload/content", requireAuth, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { file, filename, contentType } = req.body;

      if (!file || !filename) {
        return res.status(400).json({ error: "Arquivo não fornecido" });
      }

      // Validate file type
      if (!validateFileType(filename, UPLOAD.CONTENT_ALLOWED_TYPES)) {
        return res.status(400).json({ error: `Tipo de arquivo não permitido. Use: ${UPLOAD.CONTENT_ALLOWED_TYPES.join(", ").toUpperCase()}` });
      }

      // Decode base64 file
      const fileBuffer = Buffer.from(file, "base64");

      // Validate file size
      if (!validateFileSize(fileBuffer.length, UPLOAD.CONTENT_MAX_SIZE)) {
        return res.status(400).json({ error: `Arquivo muito grande. Máximo: ${UPLOAD.CONTENT_MAX_SIZE / (1024 * 1024)}MB` });
      }

      // Generate unique filename
      const extension = filename.split(".").pop();
      const uniqueFilename = `${userId}/${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const result = await uploadFile(UPLOAD.CONTENT_BUCKET, uniqueFilename, fileBuffer, contentType || UPLOAD.DEFAULT_CONTENT_TYPE, {
        upsert: false,
        cacheControl: String(UPLOAD.CACHE_CONTROL_SECONDS),
      });

      res.json({
        url: result.publicUrl,
        path: result.path,
      });
    } catch (error) {
      logger.error({ err: error, msg: "Content upload error" });
      res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
    }
  });
}

/**
 * Register routes and create HTTP server (for traditional Express server)
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Register all routes synchronously
  registerRoutesSync(app);

  // Create HTTP server for traditional Express
  const httpServer = createServer(app);

  return httpServer;
}
