import {
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Subscription, type InsertSubscription,
  type Post, type InsertPost,
  type ViralPost, type InsertViralPost,
  type Tip, type InsertTip,
  type DailyFeatured, type InsertDailyFeatured,
  type AiSession, type InsertAiSession,
  type AiMessage, type InsertAiMessage,
  type QaCache, type InsertQaCache,
  type SavedQa, type InsertSavedQa,
  type Habit, type InsertHabit,
  type HabitCompletion, type InsertHabitCompletion,
  type UserStats, type InsertUserStats,
  type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement,
  type Favorite, type InsertFavorite,
  type CommunityPost, type InsertCommunityPost,
  type DailyQuestion, type InsertDailyQuestion,
  type Comment, type InsertComment,
  type Reaction, type InsertReaction,
  type Report, type InsertReport,
} from "@shared/schema";
import { db } from "../db";
import {
  users, profiles, subscriptions, posts, viralPosts, tips, dailyFeatured,
  aiSessions, aiMessages, qaCache, savedQa, habits, habitCompletions,
  userStats, achievements, userAchievements, favorites, communityPosts,
  dailyQuestions, comments, reactions, reports,
} from "@shared/schema";
import { eq, and, desc, asc, inArray, gte, lte, sql } from "drizzle-orm";
import type { IStorage } from "./types";
import { GAMIFICATION } from "../constants";

/**
 * DrizzleStorage - Implementação de IStorage usando Drizzle ORM com PostgreSQL
 * Substitui MemStorage para persistência real de dados
 */
export class DrizzleStorage implements IStorage {
  // User methods (Authentication)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser & { id?: string }): Promise<User> {
    const values: InsertUser & { id?: string } = { ...insertUser };
    if (insertUser.id) {
      values.id = insertUser.id;
    }
    const result = await db.insert(users).values(values).returning();
    return result[0];
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  // Profiles
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return result[0];
  }

  async createProfile(insertProfile: InsertProfile & { userId: string }): Promise<Profile> {
    const result = await db.insert(profiles).values(insertProfile).returning();
    return result[0];
  }

  // Subscriptions
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId)).limit(1);
    return result[0];
  }

  async createSubscription(insertSub: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(insertSub).returning();
    return result[0];
  }

  // Posts
  async getPosts(category?: string): Promise<Post[]> {
    if (category && category !== "all") {
      return await db.select().from(posts)
        .where(eq(posts.category, category))
        .orderBy(desc(posts.publishedAt));
    }
    return await db.select().from(posts).orderBy(desc(posts.publishedAt));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(insertPost).returning();
    return result[0];
  }

  // Viral Posts
  async getViralPosts(featured?: boolean, category?: string): Promise<ViralPost[]> {
    let conditions = [];
    if (featured !== undefined) {
      conditions.push(eq(viralPosts.featured, featured));
    }
    if (category && category !== "all") {
      conditions.push(eq(viralPosts.category, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const result = await db.select().from(viralPosts)
      .where(whereClause)
      .orderBy(desc(viralPosts.featured), desc(viralPosts.publishedAt));
    return result;
  }

  async createViralPost(insertPost: InsertViralPost): Promise<ViralPost> {
    const result = await db.insert(viralPosts).values(insertPost).returning();
    return result[0];
  }

  // Tips
  async getTips(): Promise<Tip[]> {
    return await db.select().from(tips);
  }

  async getTip(id: string): Promise<Tip | undefined> {
    const result = await db.select().from(tips).where(eq(tips.id, id)).limit(1);
    return result[0];
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const result = await db.insert(tips).values(insertTip).returning();
    return result[0];
  }

  // Daily Featured
  async getDailyFeatured(date: string): Promise<DailyFeatured | undefined> {
    const result = await db.select().from(dailyFeatured)
      .where(eq(dailyFeatured.date, date)).limit(1);
    return result[0];
  }

  async createDailyFeatured(insertFeatured: InsertDailyFeatured): Promise<DailyFeatured> {
    const result = await db.insert(dailyFeatured).values(insertFeatured).returning();
    return result[0];
  }

  // AI Sessions & Messages
  async getAiSession(id: string): Promise<AiSession | undefined> {
    const result = await db.select().from(aiSessions).where(eq(aiSessions.id, id)).limit(1);
    return result[0];
  }

  async createAiSession(insertSession: InsertAiSession): Promise<AiSession> {
    const values: InsertAiSession = {
      userId: insertSession.userId,
      agentType: insertSession.agentType || "general",
      ...(insertSession.id && { id: insertSession.id }),
    };
    const result = await db.insert(aiSessions).values(values).returning();
    return result[0];
  }

  async getAiMessages(sessionId: string): Promise<AiMessage[]> {
    return await db.select().from(aiMessages)
      .where(eq(aiMessages.sessionId, sessionId))
      .orderBy(asc(aiMessages.createdAt));
  }

  async createAiMessage(insertMessage: InsertAiMessage): Promise<AiMessage> {
    const result = await db.insert(aiMessages).values(insertMessage).returning();
    return result[0];
  }

  // Q&A Cache
  async getQaCache(hash: string): Promise<QaCache | undefined> {
    const result = await db.select().from(qaCache)
      .where(and(
        eq(qaCache.hash, hash),
        gte(qaCache.ttlExpiresAt, new Date())
      )).limit(1);
    return result[0];
  }

  async createQaCache(insertCache: InsertQaCache): Promise<QaCache> {
    const result = await db.insert(qaCache).values({
      hash: insertCache.hash,
      question: insertCache.question,
      answer: insertCache.answer,
      sources: (insertCache.sources || []) as { title: string; url: string }[],
      ttlExpiresAt: insertCache.ttlExpiresAt,
    }).returning();
    return result[0];
  }

  // Saved Q&A
  async getSavedQa(userId: string): Promise<SavedQa[]> {
    return await db.select().from(savedQa)
      .where(eq(savedQa.userId, userId))
      .orderBy(desc(savedQa.savedAt));
  }

  async createSavedQa(insertSavedQa: InsertSavedQa): Promise<SavedQa> {
    const result = await db.insert(savedQa).values({
      userId: insertSavedQa.userId,
      question: insertSavedQa.question,
      answer: insertSavedQa.answer,
      sources: (insertSavedQa.sources || []) as { title: string; url: string }[],
    }).returning();
    return result[0];
  }

  // Habits
  async getHabits(userId: string): Promise<Habit[]> {
    return await db.select().from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(asc(habits.order));
  }

  async getHabit(habitId: string): Promise<Habit | undefined> {
    const result = await db.select().from(habits).where(eq(habits.id, habitId)).limit(1);
    return result[0];
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const result = await db.insert(habits).values(insertHabit).returning();
    return result[0];
  }

  async deleteHabit(habitId: string): Promise<void> {
    // Delete habit and all its completions
    await db.delete(habitCompletions).where(eq(habitCompletions.habitId, habitId));
    await db.delete(habits).where(eq(habits.id, habitId));
  }

  async updateHabitOrder(habitId: string, newOrder: number): Promise<void> {
    await db.update(habits)
      .set({ order: newOrder })
      .where(eq(habits.id, habitId));
  }

  // Habit Completions
  async getHabitCompletion(habitId: string, date: string): Promise<HabitCompletion | undefined> {
    const result = await db.select().from(habitCompletions)
      .where(and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.date, date)
      )).limit(1);
    return result[0];
  }

  async getHabitCompletions(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]> {
    return await db.select().from(habitCompletions)
      .where(and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.date, startDate),
        lte(habitCompletions.date, endDate)
      ));
  }

  async getHabitCompletionsByHabitIds(habitIds: string[], startDate: string, endDate: string): Promise<HabitCompletion[]> {
    if (habitIds.length === 0) return [];
    return await db.select().from(habitCompletions)
      .where(and(
        inArray(habitCompletions.habitId, habitIds),
        gte(habitCompletions.date, startDate),
        lte(habitCompletions.date, endDate)
      ));
  }

  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const result = await db.insert(habitCompletions).values(insertCompletion).returning();
    return result[0];
  }

  async deleteHabitCompletion(habitId: string, date: string): Promise<void> {
    await db.delete(habitCompletions)
      .where(and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.date, date)
      ));
  }

  // User Stats (Gamification)
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const result = await db.select().from(userStats)
      .where(eq(userStats.userId, userId)).limit(1);
    return result[0];
  }

  async createOrUpdateUserStats(userId: string, xpGain: number, incrementCompletions: boolean = true): Promise<UserStats> {
    const existing = await this.getUserStats(userId);

    if (existing) {
      const newXp = Math.max(0, existing.xp + xpGain);
      const newLevel = Math.floor(newXp / GAMIFICATION.XP_PER_LEVEL) + 1;
      const newTotalCompletions = incrementCompletions
        ? existing.totalCompletions + 1
        : Math.max(0, existing.totalCompletions + (xpGain < 0 ? -1 : 1));

      const result = await db.update(userStats)
        .set({
          xp: newXp,
          level: newLevel,
          totalCompletions: newTotalCompletions,
          updatedAt: new Date(),
        })
        .where(eq(userStats.id, existing.id))
        .returning();
      return result[0];
    }

    // Create new stats
    const newXp = Math.max(0, xpGain);
    const newLevel = Math.floor(newXp / GAMIFICATION.XP_PER_LEVEL) + 1;
    const result = await db.insert(userStats).values({
      userId,
      xp: newXp,
      level: newLevel,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: incrementCompletions ? 1 : 0,
      lastActivityDate: null,
    }).returning();
    return result[0];
  }

  async updateStreak(userId: string, date: string): Promise<UserStats> {
    const existing = await this.getUserStats(userId);

    if (!existing) {
      const result = await db.insert(userStats).values({
        userId,
        xp: 0,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        totalCompletions: 0,
        lastActivityDate: date,
      }).returning();
      return result[0];
    }

    // Check if yesterday
    const lastDate = existing.lastActivityDate ? new Date(existing.lastActivityDate) : null;
    const currentDate = new Date(date);

    let newStreak = existing.currentStreak;

    if (lastDate) {
      const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        // Consecutive day
        newStreak = existing.currentStreak + 1;
      } else if (dayDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If same day, keep streak
    } else {
      newStreak = 1;
    }

    const result = await db.update(userStats)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(existing.longestStreak, newStreak),
        lastActivityDate: date,
        updatedAt: new Date(),
      })
      .where(eq(userStats.id, existing.id))
      .returning();
    return result[0];
  }

  async updateStreakValue(userId: string, streak: number): Promise<UserStats> {
    const existing = await this.getUserStats(userId);

    if (!existing) {
      const result = await db.insert(userStats).values({
        userId,
        xp: 0,
        level: 1,
        currentStreak: streak,
        longestStreak: streak,
        totalCompletions: 0,
        lastActivityDate: null,
      }).returning();
      return result[0];
    }

    const result = await db.update(userStats)
      .set({
        currentStreak: streak,
        longestStreak: Math.max(existing.longestStreak, streak),
        updatedAt: new Date(),
      })
      .where(eq(userStats.id, existing.id))
      .returning();
    return result[0];
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    // Check if already unlocked
    const existing = await db.select().from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )).limit(1);

    if (existing.length > 0) return null;

    const result = await db.insert(userAchievements).values({
      userId,
      achievementId,
    }).returning();
    return result[0];
  }

  // Favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(insertFavorite).returning();
    return result[0];
  }

  async deleteFavorite(userId: string, postId: string): Promise<void> {
    await db.delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.postId, postId)
      ));
  }

  // Community
  async getCommunityPosts(type?: string, limit?: number, tag?: string, featured?: boolean): Promise<CommunityPost[]> {
    let conditions = [eq(communityPosts.hidden, false)];

    if (type) {
      conditions.push(eq(communityPosts.type, type));
    }
    if (tag) {
      conditions.push(eq(communityPosts.tag, tag));
    }
    if (featured !== undefined) {
      conditions.push(eq(communityPosts.featured, featured));
    }

    let query = db.select().from(communityPosts)
      .where(and(...conditions))
      .orderBy(desc(communityPosts.createdAt));

    if (limit) {
      return await query.limit(limit);
    }

    return await query;
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const result = await db.insert(communityPosts).values({
      ...insertPost,
      reactionCount: 0,
      commentCount: 0,
      reportCount: 0,
      hidden: false,
      featured: false,
    }).returning();
    return result[0];
  }

  async getDailyQuestion(date: string): Promise<DailyQuestion | undefined> {
    const result = await db.select().from(dailyQuestions)
      .where(and(
        eq(dailyQuestions.date, date),
        eq(dailyQuestions.active, true)
      )).limit(1);
    return result[0];
  }

  async createDailyQuestion(insertQuestion: InsertDailyQuestion): Promise<DailyQuestion> {
    const result = await db.insert(dailyQuestions).values({
      ...insertQuestion,
      active: true,
    }).returning();
    return result[0];
  }

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    // Enforce max 5 comments per post
    const existing = await db.select().from(comments)
      .where(eq(comments.postId, insertComment.postId));

    if (existing.length >= 5) {
      throw new Error("Máximo de 5 comentários atingido para este post");
    }

    const result = await db.insert(comments).values(insertComment).returning();

    // Sync commentCount on post
    await db.update(communityPosts)
      .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
      .where(eq(communityPosts.id, insertComment.postId));

    return result[0];
  }

  // Reactions
  async getReactions(postId: string): Promise<Reaction[]> {
    return await db.select().from(reactions)
      .where(eq(reactions.postId, postId));
  }

  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    // Check if reaction already exists
    const existing = await db.select().from(reactions)
      .where(and(
        eq(reactions.postId, insertReaction.postId),
        eq(reactions.userId, insertReaction.userId),
        eq(reactions.type, insertReaction.type)
      )).limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(reactions).values(insertReaction).returning();

    // Sync reactionCount on post
    await db.update(communityPosts)
      .set({ reactionCount: sql`${communityPosts.reactionCount} + 1` })
      .where(eq(communityPosts.id, insertReaction.postId));

    return result[0];
  }

  async deleteReaction(postId: string, userId: string, type: string): Promise<void> {
    await db.delete(reactions)
      .where(and(
        eq(reactions.postId, postId),
        eq(reactions.userId, userId),
        eq(reactions.type, type)
      ));

    // Sync reactionCount on post
    const post = await db.select().from(communityPosts)
      .where(eq(communityPosts.id, postId)).limit(1);
    if (post[0] && post[0].reactionCount > 0) {
      await db.update(communityPosts)
        .set({ reactionCount: sql`${communityPosts.reactionCount} - 1` })
        .where(eq(communityPosts.id, postId));
    }
  }

  // Reports
  async createReport(insertReport: InsertReport): Promise<Report> {
    // Check if report already exists
    const existing = await db.select().from(reports)
      .where(and(
        eq(reports.postId, insertReport.postId),
        eq(reports.userId, insertReport.userId)
      )).limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(reports).values(insertReport).returning();

    // Sync reportCount on post and auto-hide if >= 3
    const post = await db.select().from(communityPosts)
      .where(eq(communityPosts.id, insertReport.postId)).limit(1);

    if (post[0]) {
      const newReportCount = post[0].reportCount + 1;
      await db.update(communityPosts)
        .set({
          reportCount: newReportCount,
          hidden: newReportCount >= 3,
        })
        .where(eq(communityPosts.id, insertReport.postId));
    }

    return result[0];
  }
}

