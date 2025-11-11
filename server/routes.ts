import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithNathIA } from "./gemini";
import { searchWithPerplexity } from "./perplexity";
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

  // Habits
  app.get("/api/habits", async (req, res) => {
    const habits = await storage.getHabits(TEST_USER_ID);
    const today = new Date().toISOString().split("T")[0];
    
    const habitsWithData = await Promise.all(
      habits.map(async (habit) => {
        const entry = await storage.getHabitEntry(habit.id, today);
        const streak = await storage.getHabitStreak(habit.id, today);
        return {
          ...habit,
          entry,
          streak,
        };
      })
    );
    
    res.json(habitsWithData);
  });

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
        const entry = await storage.getHabitEntry(habit.id, dateStr);
        total++;
        if (entry?.done) {
          completed++;
        }
      }
    }
    
    res.json({ completed, total });
  });

  app.post("/api/habits/toggle", async (req, res) => {
    try {
      const { habitId, date, done } = req.body;
      
      const entry = await storage.createOrUpdateHabitEntry({
        habitId,
        date,
        done,
      });
      
      res.json(entry);
    } catch (error) {
      console.error("Toggle habit error:", error);
      res.status(500).json({ error: "Failed to toggle habit" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
