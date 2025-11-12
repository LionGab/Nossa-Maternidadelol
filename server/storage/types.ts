import type {
  User, InsertUser,
  Profile, InsertProfile,
  Subscription, InsertSubscription,
  Post, InsertPost,
  ViralPost, InsertViralPost,
  Tip, InsertTip,
  DailyFeatured, InsertDailyFeatured,
  AiSession, InsertAiSession,
  AiMessage, InsertAiMessage,
  QaCache, InsertQaCache,
  SavedQa, InsertSavedQa,
  Habit, InsertHabit,
  HabitCompletion, InsertHabitCompletion,
  UserStats, InsertUserStats,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  Favorite, InsertFavorite,
  CommunityPost, InsertCommunityPost,
  DailyQuestion, InsertDailyQuestion,
  Comment, InsertComment,
  Reaction, InsertReaction,
  Report, InsertReport,
} from "@shared/schema";

/**
 * Storage interface - defines all data operations
 * Implemented by MemStorage (in-memory) and DrizzleStorage (PostgreSQL)
 */
export interface IStorage {
  // Users (Authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { id?: string }): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;

  // Profiles
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile & { userId: string }): Promise<Profile>;

  // Subscriptions
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;

  // Posts
  getPosts(category?: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;

  // Viral Posts
  getViralPosts(featured?: boolean, category?: string): Promise<ViralPost[]>;
  createViralPost(post: InsertViralPost): Promise<ViralPost>;

  // Tips
  getTips(): Promise<Tip[]>;
  createTip(tip: InsertTip): Promise<Tip>;

  // Daily Featured
  getDailyFeatured(date: string): Promise<DailyFeatured | undefined>;
  createDailyFeatured(featured: InsertDailyFeatured): Promise<DailyFeatured>;

  // AI Sessions & Messages
  getAiSession(id: string): Promise<AiSession | undefined>;
  createAiSession(session: InsertAiSession): Promise<AiSession>;
  getAiMessages(sessionId: string): Promise<AiMessage[]>;
  createAiMessage(message: InsertAiMessage): Promise<AiMessage>;

  // Q&A Cache
  getQaCache(hash: string): Promise<QaCache | undefined>;
  createQaCache(cache: InsertQaCache): Promise<QaCache>;

  // Saved Q&A
  getSavedQa(userId: string): Promise<SavedQa[]>;
  createSavedQa(savedQa: InsertSavedQa): Promise<SavedQa>;

  // Habits
  getHabits(userId: string): Promise<Habit[]>;
  getHabit(habitId: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  deleteHabit(habitId: string): Promise<void>;
  updateHabitOrder(habitId: string, newOrder: number): Promise<void>;

  // Habit Completions
  getHabitCompletion(habitId: string, date: string): Promise<HabitCompletion | undefined>;
  getHabitCompletions(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]>;
  getHabitCompletionsByHabitIds(habitIds: string[], startDate: string, endDate: string): Promise<HabitCompletion[]>;
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  deleteHabitCompletion(habitId: string, date: string): Promise<void>;

  // User Stats (Gamification)
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createOrUpdateUserStats(userId: string, xpGain: number, incrementCompletions?: boolean): Promise<UserStats>;
  updateStreak(userId: string, date: string): Promise<UserStats>;
  updateStreakValue(userId: string, streak: number): Promise<UserStats>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null>;

  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: string, postId: string): Promise<void>;

  // Community
  getCommunityPosts(type?: string, limit?: number, tag?: string, featured?: boolean): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getDailyQuestion(date: string): Promise<DailyQuestion | undefined>;
  createDailyQuestion(question: InsertDailyQuestion): Promise<DailyQuestion>;

  // Comments
  getComments(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Reactions
  getReactions(postId: string): Promise<Reaction[]>;
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  deleteReaction(postId: string, userId: string, type: string): Promise<void>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;
}

