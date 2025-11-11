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

// Habits
export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  order: integer("order").notNull(),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Habit Entries
export const habitEntries = pgTable("habit_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  done: boolean("done").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).omit({
  id: true,
});

export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;
export type HabitEntry = typeof habitEntries.$inferSelect;

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
