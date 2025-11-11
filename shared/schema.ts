import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Profile
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  stage: text("stage").notNull(), // "pregnant", "postpartum", "planning"
  goals: text("goals").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  name: true,
  stage: true,
  goals: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Subscription Status
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull(), // "active", "trial", "inactive", "tester"
  trialUntil: timestamp("trial_until"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  status: true,
  trialUntil: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Content Posts (Videos, Articles, Audio)
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // "video", "article", "audio"
  category: text("category").notNull(), // "Gestação", "Puerpério", "Treinos", "Culinária"
  premium: boolean("premium").default(false).notNull(),
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds for video/audio
  description: text("description"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  publishedAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Viral Social Media Posts (TikTok/Instagram)
export const viralPosts = pgTable("viral_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(), // "tiktok", "instagram"
  externalId: text("external_id").notNull(), // Platform's video/post ID
  embedUrl: text("embed_url").notNull(), // Full canonical share URL
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // Optional: "Gestação", "Puerpério", "Treinos", "Culinária"
  thumbnailUrl: text("thumbnail_url"),
  likes: integer("likes"), // Nullable - manual snapshots only
  comments: integer("comments"), // Nullable - manual snapshots only
  shares: integer("shares"), // Nullable - manual snapshots only
  featured: boolean("featured").default(false).notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const insertViralPostSchema = createInsertSchema(viralPosts).omit({
  id: true,
  publishedAt: true,
});

export type InsertViralPost = z.infer<typeof insertViralPostSchema>;
export type ViralPost = typeof viralPosts.$inferSelect;

// Daily Tips
export const tips = pgTable("tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  mood: text("mood").notNull(), // "encouraging", "calm", "energizing", "reflective"
});

export const insertTipSchema = createInsertSchema(tips).pick({
  text: true,
  mood: true,
});

export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tips.$inferSelect;

// Daily Featured Content
export const dailyFeatured = pgTable("daily_featured", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  tipId: varchar("tip_id"),
  postId: varchar("post_id"),
  quote: text("quote"),
});

export const insertDailyFeaturedSchema = createInsertSchema(dailyFeatured).omit({
  id: true,
});

export type InsertDailyFeatured = z.infer<typeof insertDailyFeaturedSchema>;
export type DailyFeatured = typeof dailyFeatured.$inferSelect;

// AI Chat Sessions (NathIA)
export const aiSessions = pgTable("ai_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export const insertAiSessionSchema = createInsertSchema(aiSessions).pick({
  userId: true,
}).extend({
  id: z.string().optional(),
});

export type InsertAiSession = z.infer<typeof insertAiSessionSchema>;
export type AiSession = typeof aiSessions.$inferSelect;

// AI Chat Messages
export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  role: text("role").notNull(), // "user", "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;

// Q&A Cache (MãeValente - Perplexity responses)
export const qaCache = pgTable("qa_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hash: text("hash").notNull().unique(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sources: json("sources").$type<{ title: string; url: string }[]>().default([]),
  ttlExpiresAt: timestamp("ttl_expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQaCacheSchema = createInsertSchema(qaCache).omit({
  id: true,
  createdAt: true,
});

export type InsertQaCache = z.infer<typeof insertQaCacheSchema>;
export type QaCache = typeof qaCache.$inferSelect;

// Saved Q&A Items
export const savedQa = pgTable("saved_qa", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sources: json("sources").$type<{ title: string; url: string }[]>().default([]),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const insertSavedQaSchema = createInsertSchema(savedQa).omit({
  id: true,
  savedAt: true,
});

export type InsertSavedQa = z.infer<typeof insertSavedQaSchema>;
export type SavedQa = typeof savedQa.$inferSelect;

// Habits (Customizable)
export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  emoji: text("emoji").notNull(),
  color: text("color").notNull(), // gradient class like "from-blue-500 to-purple-500"
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Habit Completions (Daily tracking)
export const habitCompletions = pgTable("habit_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
  completedAt: true,
});

export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

// User Stats (Gamification)
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  totalCompletions: integer("total_completions").default(0).notNull(),
  lastActivityDate: text("last_activity_date"), // YYYY-MM-DD
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// Achievements (Badges)
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull(),
  requirement: integer("requirement").notNull(), // Number needed to unlock
  type: text("type").notNull(), // "streak", "completions", "level", "habit_count"
});

export const insertAchievementSchema = createInsertSchema(achievements);

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

// User Achievements (Unlocked badges)
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

// Favorites
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  postId: varchar("post_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
