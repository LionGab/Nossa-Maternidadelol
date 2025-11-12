/**
 * Schema do banco de dados com índices otimizados
 */
import { pgTable, text, timestamp, integer, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  avatarPath: text('avatar_path'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Community Posts
export const communityPosts = pgTable('community_posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  imagePath: text('image_path'),
  commentCount: integer('comment_count').default(0),
  reactionCount: integer('reaction_count').default(0),
  reportCount: integer('report_count').default(0),
  isHidden: boolean('is_hidden').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Índice composto para posts do usuário ordenados por data
  userIdCreatedAtIdx: index('idx_community_posts_user_created').on(table.userId, table.createdAt),
  // Índice para posts não ocultos ordenados por data
  visibleCreatedAtIdx: index('idx_community_posts_visible_created').on(table.isHidden, table.createdAt),
}));

// Comments
export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => communityPosts.id),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Índice composto para comentários de um post ordenados por data
  postIdCreatedAtIdx: index('idx_comments_post_created').on(table.postId, table.createdAt),
}));

// Reactions
export const reactions = pgTable('reactions', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => communityPosts.id),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'like' | 'love' | 'support'
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Índice composto para reações de um post por tipo
  postIdTypeIdx: index('idx_reactions_post_type').on(table.postId, table.type),
  // Índice único para evitar reações duplicadas
  postUserIdx: uniqueIndex('idx_reactions_post_user').on(table.postId, table.userId),
}));

// Reports
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => communityPosts.id),
  userId: text('user_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Habits
export const habits = pgTable('habits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_habits_user').on(table.userId),
}));

// Habit Completions
export const habitCompletions = pgTable('habit_completions', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id),
  userId: text('user_id').notNull().references(() => users.id),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Índice composto crítico para queries de completions por usuário e data
  userIdDateIdx: index('idx_habit_completions_user_date').on(table.userId, table.date),
  habitIdDateIdx: index('idx_habit_completions_habit_date').on(table.habitId, table.date),
}));

// AI Messages
export const aiMessages = pgTable('ai_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Índice composto para mensagens de uma sessão ordenadas por data
  sessionIdCreatedAtIdx: index('idx_ai_messages_session_created').on(table.sessionId, table.createdAt),
}));

// User Stats
export const userStats = pgTable('user_stats', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  totalPosts: integer('total_posts').default(0),
  totalComments: integer('total_comments').default(0),
  totalReactions: integer('total_reactions').default(0),
  streakDays: integer('streak_days').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Achievements
export const userAchievements = pgTable('user_achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  achievementId: text('achievement_id').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
}, (table) => ({
  userIdAchievementIdx: uniqueIndex('idx_user_achievements_user_achievement').on(table.userId, table.achievementId),
}));

// Nota: Use eq, and, isNotNull de 'drizzle-orm' diretamente
// Estes helpers não são mais necessários

