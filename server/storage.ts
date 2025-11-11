import {
  type Profile, type InsertProfile,
  type Subscription, type InsertSubscription,
  type Post, type InsertPost,
  type Tip, type InsertTip,
  type DailyFeatured, type InsertDailyFeatured,
  type AiSession, type InsertAiSession,
  type AiMessage, type InsertAiMessage,
  type QaCache, type InsertQaCache,
  type SavedQa, type InsertSavedQa,
  type Habit, type InsertHabit,
  type HabitEntry, type InsertHabitEntry,
  type Favorite, type InsertFavorite,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Profiles
  getProfile(id: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  
  // Subscriptions
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  
  // Posts
  getPosts(category?: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  
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
  createHabit(habit: InsertHabit): Promise<Habit>;
  getHabitEntry(habitId: string, date: string): Promise<HabitEntry | undefined>;
  createOrUpdateHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry>;
  getHabitStreak(habitId: string, currentDate: string): Promise<number>;
  
  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: string, postId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private profiles: Map<string, Profile>;
  private subscriptions: Map<string, Subscription>;
  private posts: Map<string, Post>;
  private tips: Map<string, Tip>;
  private dailyFeatured: Map<string, DailyFeatured>;
  private aiSessions: Map<string, AiSession>;
  private aiMessages: Map<string, AiMessage>;
  private qaCache: Map<string, QaCache>;
  private savedQa: Map<string, SavedQa>;
  private habits: Map<string, Habit>;
  private habitEntries: Map<string, HabitEntry>;
  private favorites: Map<string, Favorite>;

  constructor() {
    this.profiles = new Map();
    this.subscriptions = new Map();
    this.posts = new Map();
    this.tips = new Map();
    this.dailyFeatured = new Map();
    this.aiSessions = new Map();
    this.aiMessages = new Map();
    this.qaCache = new Map();
    this.savedQa = new Map();
    this.habits = new Map();
    this.habitEntries = new Map();
    this.favorites = new Map();

    this.seedData();
  }

  private seedData() {
    // Seed tips
    const tips: Tip[] = [
      {
        id: "tip-1",
        text: "Lembre-se: você conhece seu corpo melhor do que ninguém. Confie em seus instintos.",
        mood: "encouraging",
      },
      {
        id: "tip-2",
        text: "Hidrate-se! Beba água regularmente ao longo do dia para manter você e seu bebê saudáveis.",
        mood: "calm",
      },
      {
        id: "tip-3",
        text: "Tire alguns minutos para respirar profundamente. O autocuidado não é egoísmo.",
        mood: "reflective",
      },
    ];
    tips.forEach((tip) => this.tips.set(tip.id, tip));

    // Seed posts
    const posts: Post[] = [
      {
        id: "post-1",
        title: "Yoga para Gestantes - Primeiro Trimestre",
        type: "video",
        category: "Treinos",
        premium: false,
        mediaUrl: "https://example.com/video1.mp4",
        thumbnailUrl: "",
        duration: 900,
        description: "Exercícios suaves e seguros para o início da gravidez",
        tags: ["yoga", "exercício", "primeiro-trimestre"],
        publishedAt: new Date(),
      },
      {
        id: "post-2",
        title: "Receitas Nutritivas para o Puerpério",
        type: "article",
        category: "Culinária",
        premium: false,
        mediaUrl: "https://example.com/article1",
        thumbnailUrl: "",
        duration: null,
        description: "Alimentos que ajudam na recuperação pós-parto",
        tags: ["nutrição", "puerpério", "receitas"],
        publishedAt: new Date(),
      },
      {
        id: "post-3",
        title: "Meditação Guiada para Ansiedade",
        type: "audio",
        category: "Gestação",
        premium: true,
        mediaUrl: "https://example.com/audio1.mp3",
        thumbnailUrl: "",
        duration: 600,
        description: "Acalme sua mente com esta meditação especial",
        tags: ["meditação", "ansiedade", "bem-estar"],
        publishedAt: new Date(),
      },
    ];
    posts.forEach((post) => this.posts.set(post.id, post));

    // Seed daily featured
    const today = new Date().toISOString().split("T")[0];
    this.dailyFeatured.set(today, {
      id: "daily-1",
      date: today,
      tipId: "tip-1",
      postId: "post-1",
      quote: "Você está fazendo um trabalho incrível. Seja gentil consigo mesma.",
    });

    // Seed default habits for test user
    const defaultHabits: Habit[] = [
      { id: "habit-1", userId: "test-user", title: "Beber 2L de água", icon: "droplet", order: 1 },
      { id: "habit-2", userId: "test-user", title: "Exercícios de respiração", icon: "wind", order: 2 },
      { id: "habit-3", userId: "test-user", title: "Alongamento leve", icon: "stretch", order: 3 },
      { id: "habit-4", userId: "test-user", title: "Diário de humor", icon: "bookHeart", order: 4 },
      { id: "habit-5", userId: "test-user", title: "Leitura de 10 min", icon: "bookOpen", order: 5 },
    ];
    defaultHabits.forEach((habit) => this.habits.set(habit.id, habit));
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = {
      id,
      name: insertProfile.name,
      stage: insertProfile.stage,
      goals: insertProfile.goals || null,
      createdAt: new Date(),
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find((sub) => sub.userId === userId);
  }

  async createSubscription(insertSub: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      id,
      userId: insertSub.userId,
      status: insertSub.status,
      trialUntil: insertSub.trialUntil || null,
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async getPosts(category?: string): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    if (category && category !== "all") {
      posts = posts.filter((p) => p.category === category);
    }
    return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      id,
      title: insertPost.title,
      type: insertPost.type,
      category: insertPost.category,
      premium: insertPost.premium ?? false,
      mediaUrl: insertPost.mediaUrl,
      thumbnailUrl: insertPost.thumbnailUrl || null,
      duration: insertPost.duration || null,
      description: insertPost.description || null,
      tags: insertPost.tags || null,
      publishedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getTips(): Promise<Tip[]> {
    return Array.from(this.tips.values());
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const id = randomUUID();
    const tip: Tip = { ...insertTip, id };
    this.tips.set(id, tip);
    return tip;
  }

  async getDailyFeatured(date: string): Promise<DailyFeatured | undefined> {
    return this.dailyFeatured.get(date);
  }

  async createDailyFeatured(insertFeatured: InsertDailyFeatured): Promise<DailyFeatured> {
    const id = randomUUID();
    const featured: DailyFeatured = {
      id,
      date: insertFeatured.date,
      tipId: insertFeatured.tipId || null,
      postId: insertFeatured.postId || null,
      quote: insertFeatured.quote || null,
    };
    this.dailyFeatured.set(featured.date, featured);
    return featured;
  }

  async getAiSession(id: string): Promise<AiSession | undefined> {
    return this.aiSessions.get(id);
  }

  async createAiSession(insertSession: InsertAiSession): Promise<AiSession> {
    const id = randomUUID();
    const session: AiSession = { ...insertSession, id, startedAt: new Date() };
    this.aiSessions.set(id, session);
    return session;
  }

  async getAiMessages(sessionId: string): Promise<AiMessage[]> {
    return Array.from(this.aiMessages.values())
      .filter((m) => m.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createAiMessage(insertMessage: InsertAiMessage): Promise<AiMessage> {
    const id = randomUUID();
    const message: AiMessage = { ...insertMessage, id, createdAt: new Date() };
    this.aiMessages.set(id, message);
    return message;
  }

  async getQaCache(hash: string): Promise<QaCache | undefined> {
    const cached = Array.from(this.qaCache.values()).find((c) => c.hash === hash);
    if (cached && cached.ttlExpiresAt > new Date()) {
      return cached;
    }
    return undefined;
  }

  async createQaCache(insertCache: InsertQaCache): Promise<QaCache> {
    const id = randomUUID();
    const cache: QaCache = {
      id,
      hash: insertCache.hash,
      question: insertCache.question,
      answer: insertCache.answer,
      sources: insertCache.sources || null,
      ttlExpiresAt: insertCache.ttlExpiresAt,
      createdAt: new Date(),
    };
    this.qaCache.set(insertCache.hash, cache);
    return cache;
  }

  async getSavedQa(userId: string): Promise<SavedQa[]> {
    return Array.from(this.savedQa.values())
      .filter((qa) => qa.userId === userId)
      .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }

  async createSavedQa(insertSavedQa: InsertSavedQa): Promise<SavedQa> {
    const id = randomUUID();
    const savedQa: SavedQa = {
      id,
      userId: insertSavedQa.userId,
      question: insertSavedQa.question,
      answer: insertSavedQa.answer,
      sources: insertSavedQa.sources || null,
      savedAt: new Date(),
    };
    this.savedQa.set(id, savedQa);
    return savedQa;
  }

  async getHabits(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values())
      .filter((h) => h.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = { ...insertHabit, id };
    this.habits.set(id, habit);
    return habit;
  }

  async getHabitEntry(habitId: string, date: string): Promise<HabitEntry | undefined> {
    const key = `${habitId}-${date}`;
    return this.habitEntries.get(key);
  }

  async createOrUpdateHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    const key = `${insertEntry.habitId}-${insertEntry.date}`;
    const existing = this.habitEntries.get(key);
    
    if (existing) {
      const updated: HabitEntry = {
        ...existing,
        done: insertEntry.done,
        completedAt: insertEntry.done ? new Date() : null,
      };
      this.habitEntries.set(key, updated);
      return updated;
    }
    
    const id = randomUUID();
    const entry: HabitEntry = {
      id,
      habitId: insertEntry.habitId,
      date: insertEntry.date,
      done: insertEntry.done ?? false,
      completedAt: insertEntry.done ? new Date() : null,
    };
    this.habitEntries.set(key, entry);
    return entry;
  }

  async getHabitStreak(habitId: string, currentDate: string): Promise<number> {
    let streak = 0;
    let checkDate = new Date(currentDate);
    
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const entry = await this.getHabitEntry(habitId, dateStr);
      
      if (!entry || !entry.done) break;
      
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      
      if (streak > 365) break; // Safety limit
    }
    
    return streak;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values())
      .filter((f) => f.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { ...insertFavorite, id, createdAt: new Date() };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(userId: string, postId: string): Promise<void> {
    const favorite = Array.from(this.favorites.values()).find(
      (f) => f.userId === userId && f.postId === postId
    );
    if (favorite) {
      this.favorites.delete(favorite.id);
    }
  }
}

export const storage = new MemStorage();
