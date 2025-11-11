import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithNathIA } from "./gemini";
import { searchWithPerplexity } from "./perplexity";
import type { UserStats } from "@shared/schema";
import crypto from "crypto";

const TEST_USER_ID = "test-user";

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

  app.get("/api/posts", async (req, res) => {
    const category = req.query.category as string;
    const posts = await storage.getPosts(category);
    res.json(posts);
  });

  // Viral Posts
  app.get("/api/viral-posts", async (req, res) => {
    const featured = req.query.featured === "true" ? true : undefined;
    const category = req.query.category as string;
    const viralPosts = await storage.getViralPosts(featured, category);
    res.json(viralPosts);
  });

  // Favorites
  app.get("/api/favorites", async (req, res) => {
    const favorites = await storage.getFavorites(TEST_USER_ID);
    const postIds = favorites.map((f) => f.postId);
    res.json(postIds);
  });

  app.post("/api/favorites", async (req, res) => {
    const { postId } = req.body;
    const favorite = await storage.createFavorite({
      userId: TEST_USER_ID,
      postId,
    });
    res.json(favorite);
  });

  app.delete("/api/favorites/:postId", async (req, res) => {
    const { postId } = req.params;
    await storage.deleteFavorite(TEST_USER_ID, postId);
    res.json({ success: true });
  });

  // NathIA Chat
  app.get("/api/nathia/messages/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    
    // Create session if it doesn't exist
    let session = await storage.getAiSession(sessionId);
    if (!session) {
      session = await storage.createAiSession({
        userId: TEST_USER_ID,
      });
    }
    
    const messages = await storage.getAiMessages(sessionId);
    res.json(messages);
  });

  app.post("/api/nathia/chat", async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      
      if (!sessionId || !message) {
        return res.status(400).json({ error: "sessionId and message are required" });
      }
      
      // Create session if it doesn't exist
      let session = await storage.getAiSession(sessionId);
      if (!session) {
        session = await storage.createAiSession({
          id: sessionId,
          userId: TEST_USER_ID,
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
      console.error("NathIA chat error:", error);
      res.status(500).json({ error: "Failed to get response" });
    }
  });

  // MãeValente Search
  app.get("/api/mae-valente/saved", async (req, res) => {
    const saved = await storage.getSavedQa(TEST_USER_ID);
    res.json(saved);
  });

  app.post("/api/mae-valente/search", async (req, res) => {
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
      console.error("MãeValente search error:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  app.post("/api/mae-valente/save", async (req, res) => {
    try {
      const { question, answer, sources } = req.body;
      
      const saved = await storage.createSavedQa({
        userId: TEST_USER_ID,
        question,
        answer,
        sources,
      });
      
      res.json(saved);
    } catch (error) {
      console.error("Save Q&A error:", error);
      res.status(500).json({ error: "Failed to save" });
    }
  });

  // Habits (Gamified)
  app.get("/api/habits", async (req, res) => {
    const habits = await storage.getHabits(TEST_USER_ID);
    const today = new Date().toISOString().split("T")[0];
    
    const habitsWithCompletion = await Promise.all(
      habits.map(async (habit) => {
        const completion = await storage.getHabitCompletion(habit.id, today);
        
        // Calculate streak for this habit
        let streak = 0;
        let checkDate = new Date(today);
        while (streak < 365) {
          const dateStr = checkDate.toISOString().split("T")[0];
          const dayCompletion = await storage.getHabitCompletion(habit.id, dateStr);
          if (!dayCompletion) break;
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
        
        return {
          ...habit,
          completedToday: !!completion,
          // Legacy support for old frontend
          entry: completion ? { done: true, completedAt: completion.completedAt } : undefined,
          streak,
        };
      })
    );
    
    res.json(habitsWithCompletion);
  });

  // Week stats (legacy endpoint for backwards compatibility)
  app.get("/api/habits/week-stats", async (req, res) => {
    const habits = await storage.getHabits(TEST_USER_ID);
    const today = new Date();
    let completed = 0;
    let total = 0;
    
    // Count completed habits in the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      for (const habit of habits) {
        const completion = await storage.getHabitCompletion(habit.id, dateStr);
        total++;
        if (completion) {
          completed++;
        }
      }
    }
    
    res.json({ completed, total });
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const { title, emoji, color } = req.body;
      
      const existingHabits = await storage.getHabits(TEST_USER_ID);
      const maxOrder = existingHabits.length > 0 
        ? Math.max(...existingHabits.map((h) => h.order)) 
        : 0;
      
      const habit = await storage.createHabit({
        userId: TEST_USER_ID,
        title,
        emoji,
        color,
        order: maxOrder + 1,
      });
      
      // Check for achievements
      const habits = await storage.getHabits(TEST_USER_ID);
      if (habits.length === 1) {
        await storage.unlockAchievement(TEST_USER_ID, "first_habit");
      } else if (habits.length === 5) {
        await storage.unlockAchievement(TEST_USER_ID, "habit_master");
      }
      
      res.json(habit);
    } catch (error) {
      console.error("Create habit error:", error);
      res.status(500).json({ error: "Failed to create habit" });
    }
  });

  app.delete("/api/habits/:habitId", async (req, res) => {
    try {
      const { habitId } = req.params;
      await storage.deleteHabit(habitId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete habit error:", error);
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  app.post("/api/habits/:habitId/complete", async (req, res) => {
    try {
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
        userId: TEST_USER_ID,
        date: today,
      });
      
      // Update user stats (+10 XP per completion)
      const stats = await storage.createOrUpdateUserStats(TEST_USER_ID, 10);
      
      // Update streak
      await storage.updateStreak(TEST_USER_ID, today);
      
      // Check achievements
      const updatedStats = await storage.getUserStats(TEST_USER_ID);
      if (updatedStats) {
        // Check streak achievements
        if (updatedStats.currentStreak === 3) {
          await storage.unlockAchievement(TEST_USER_ID, "streak_3");
        } else if (updatedStats.currentStreak === 7) {
          await storage.unlockAchievement(TEST_USER_ID, "streak_7");
        } else if (updatedStats.currentStreak === 30) {
          await storage.unlockAchievement(TEST_USER_ID, "streak_30");
        }
        
        // Check completion achievements
        if (updatedStats.totalCompletions === 10) {
          await storage.unlockAchievement(TEST_USER_ID, "completions_10");
        } else if (updatedStats.totalCompletions === 50) {
          await storage.unlockAchievement(TEST_USER_ID, "completions_50");
        } else if (updatedStats.totalCompletions === 100) {
          await storage.unlockAchievement(TEST_USER_ID, "completions_100");
        }
        
        // Check level achievements
        if (updatedStats.level === 5) {
          await storage.unlockAchievement(TEST_USER_ID, "level_5");
        } else if (updatedStats.level === 10) {
          await storage.unlockAchievement(TEST_USER_ID, "level_10");
        }
      }
      
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Complete habit error:", error);
      res.status(500).json({ error: "Failed to complete habit" });
    }
  });

  app.delete("/api/habits/:habitId/complete", async (req, res) => {
    try {
      const { habitId } = req.params;
      const today = new Date().toISOString().split("T")[0];
      
      await storage.deleteHabitCompletion(habitId, today);
      
      // Subtract XP and decrement total completions
      await storage.createOrUpdateUserStats(TEST_USER_ID, -10, false);
      
      // Recalculate streak
      const stats = await storage.getUserStats(TEST_USER_ID);
      if (stats) {
        let newStreak = 0;
        let checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday
        
        while (newStreak < 365) {
          const dateStr = checkDate.toISOString().split("T")[0];
          const dayCompletions = await storage.getHabitCompletions(TEST_USER_ID, dateStr, dateStr);
          if (dayCompletions.length === 0) break;
          newStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
        
        // Update streak directly
        const updatedStats = { ...stats, currentStreak: newStreak, updatedAt: new Date() };
        // Access internal map to update
        const statsArray = Array.from((storage as any).userStats.values());
        const userStat = statsArray.find((s: UserStats) => s.userId === TEST_USER_ID);
        if (userStat) {
          Object.assign(userStat, updatedStats);
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Uncomplete habit error:", error);
      res.status(500).json({ error: "Failed to uncomplete habit" });
    }
  });

  // User Stats
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getUserStats(TEST_USER_ID);
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

  // Achievements
  app.get("/api/achievements", async (req, res) => {
    const allAchievements = await storage.getAchievements();
    const userAchievements = await storage.getUserAchievements(TEST_USER_ID);
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
    
    const achievementsWithStatus = allAchievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find((ua) => ua.achievementId === achievement.id)?.unlockedAt,
    }));
    
    res.json(achievementsWithStatus);
  });

  // Habit History (for calendar view)
  app.get("/api/habits/history", async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate required" });
    }
    
    const completions = await storage.getHabitCompletions(
      TEST_USER_ID,
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

  app.get("/api/community/posts", async (req, res) => {
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const posts = await storage.getCommunityPosts(type, limit);
    res.json(posts);
  });

  const httpServer = createServer(app);

  return httpServer;
}
