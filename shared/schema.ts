import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, json, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  emailVerified: true,
  createdAt: true,
  lastLoginAt: true,
}).extend({
  email: z.string().email("Email inválido"),
  passwordHash: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Profile
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(), // Link to users table
  name: text("name").notNull(),
  stage: text("stage").notNull(), // "pregnant", "postpartum", "planning"
  goals: text("goals").array().default(sql`ARRAY[]::text[]`),
  avatarUrl: text("avatar_url"), // Optional: URL to avatar in Supabase Storage
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

// Agent Types
export const AgentType = {
  GENERAL: "general",
  HABITS: "habits",
  CONTENT: "content",
  COMMUNITY: "community",
} as const;

export type AgentType = typeof AgentType[keyof typeof AgentType];

// AI Chat Sessions (NathIA)
export const aiSessions = pgTable("ai_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  agentType: text("agent_type").default("general").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export const insertAiSessionSchema = createInsertSchema(aiSessions).pick({
  userId: true,
  agentType: true,
}).extend({
  id: z.string().optional(),
  agentType: z.enum(["general", "habits", "content", "community"]).optional(),
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
}, (table) => ({
  sessionIdIdx: index("ai_messages_session_id_idx").on(table.sessionId),
}));

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
}, (table) => ({
  userIdIdx: index("habits_user_id_idx").on(table.userId),
}));

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
}, (table) => ({
  habitDateIdx: index("habit_completions_habit_date_idx").on(table.habitId, table.date),
  userDateIdx: index("habit_completions_user_date_idx").on(table.userId, table.date),
}));

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

// Community Posts (RefúgioNath - 4 tipos)
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  authorName: text("author_name").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  type: text("type").notNull(), // "desabafo", "vitoria", "apoio", "reflexao"
  content: text("content").notNull(),
  tag: text("tag"), // Optional: "#Exaustão", "#Culpa", "#Vitória", etc.
  reactionCount: integer("reaction_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  reportCount: integer("report_count").default(0).notNull(),
  hidden: boolean("hidden").default(false).notNull(), // Auto-hidden if reportCount >= 3
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  typeCreatedAtIdx: index("community_posts_type_created_at_idx").on(table.type, table.createdAt),
  userIdIdx: index("community_posts_user_id_idx").on(table.userId),
}));

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  reactionCount: true,
  commentCount: true,
  reportCount: true,
  hidden: true,
  featured: true,
  createdAt: true,
});

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Comments (máx 5 por post, 150 caracteres)
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  authorName: text("author_name").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  content: text("content").notNull(), // max 150 chars enforced in validation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
}).extend({
  content: z.string().max(150, "Comentário deve ter no máximo 150 caracteres"),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Reactions (❤️ Apoio, 🤝 Empatia, ✨ Força)
// Note: In production, add unique constraint on (postId, userId, type) to prevent duplicates
export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "heart", "hands", "sparkles"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});

export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;

// Reports (moderação automática)
// Note: In production, add unique constraint on (postId, userId) to prevent duplicate reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  reason: text("reason"), // Optional
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Daily Question (Pergunta do Dia dinâmica)
export const dailyQuestions = pgTable("daily_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  question: text("question").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDailyQuestionSchema = createInsertSchema(dailyQuestions).omit({
  id: true,
  active: true,
  createdAt: true,
});

export type InsertDailyQuestion = z.infer<typeof insertDailyQuestionSchema>;
export type DailyQuestion = typeof dailyQuestions.$inferSelect;
