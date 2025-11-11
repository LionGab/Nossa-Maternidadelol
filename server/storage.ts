import {
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
  createHabit(habit: InsertHabit): Promise<Habit>;
  deleteHabit(habitId: string): Promise<void>;
  updateHabitOrder(habitId: string, newOrder: number): Promise<void>;
  
  // Habit Completions
  getHabitCompletion(habitId: string, date: string): Promise<HabitCompletion | undefined>;
  getHabitCompletions(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]>;
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  deleteHabitCompletion(habitId: string, date: string): Promise<void>;
  
  // User Stats (Gamification)
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createOrUpdateUserStats(userId: string, xpGain: number, incrementCompletions?: boolean): Promise<UserStats>;
  updateStreak(userId: string, date: string): Promise<UserStats>;
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null>;
  
  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: string, postId: string): Promise<void>;
  
  // Community
  getCommunityPosts(type?: string, limit?: number): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getDailyQuestion(date: string): Promise<DailyQuestion | undefined>;
  createDailyQuestion(question: InsertDailyQuestion): Promise<DailyQuestion>;
}

export class MemStorage implements IStorage {
  private profiles: Map<string, Profile>;
  private subscriptions: Map<string, Subscription>;
  private posts: Map<string, Post>;
  private viralPosts: Map<string, ViralPost>;
  private tips: Map<string, Tip>;
  private dailyFeatured: Map<string, DailyFeatured>;
  private aiSessions: Map<string, AiSession>;
  private aiMessages: Map<string, AiMessage>;
  private qaCache: Map<string, QaCache>;
  private savedQa: Map<string, SavedQa>;
  private habits: Map<string, Habit>;
  private habitCompletions: Map<string, HabitCompletion>;
  private userStats: Map<string, UserStats>;
  private achievements: Map<string, Achievement>;
  private userAchievements: Map<string, UserAchievement>;
  private favorites: Map<string, Favorite>;
  private communityPosts: Map<string, CommunityPost>;
  private dailyQuestions: Map<string, DailyQuestion>;

  constructor() {
    this.profiles = new Map();
    this.subscriptions = new Map();
    this.posts = new Map();
    this.viralPosts = new Map();
    this.tips = new Map();
    this.dailyFeatured = new Map();
    this.aiSessions = new Map();
    this.aiMessages = new Map();
    this.qaCache = new Map();
    this.savedQa = new Map();
    this.habits = new Map();
    this.habitCompletions = new Map();
    this.userStats = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.favorites = new Map();
    this.communityPosts = new Map();
    this.dailyQuestions = new Map();

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

    // Seed viral posts - Real videos from Nathália Valente
    const viralPosts: ViralPost[] = [
      {
        id: "viral-1",
        platform: "tiktok",
        externalId: "7566750505972682005",
        embedUrl: "https://www.tiktok.com/@nathaliavalente/video/7566750505972682005",
        title: "Fomos assaltados no final do vídeo",
        description: "Momento inesperado durante as gravações",
        category: "Dicas",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-10"),
      },
      {
        id: "viral-2",
        platform: "tiktok",
        externalId: "7568568827387071764",
        embedUrl: "https://www.tiktok.com/@nathaliavalente/video/7568568827387071764",
        title: "É isso.❤️",
        description: "Reflexão sobre a maternidade",
        category: "Bem-estar",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-09"),
      },
      {
        id: "viral-3",
        platform: "tiktok",
        externalId: "7564435430641274132",
        embedUrl: "https://www.tiktok.com/@nathaliavalente/video/7564435430641274132",
        title: "Comprando enfeites de Natal🎁🎄",
        description: "Preparando o Natal em família",
        category: "Dicas",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-08"),
      },
      {
        id: "viral-4",
        platform: "tiktok",
        externalId: "7567446650856230164",
        embedUrl: "https://www.tiktok.com/@nathaliavalente/video/7567446650856230164",
        title: "Novidades do dia",
        description: "Compartilhando momentos especiais",
        category: "Dicas",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-07"),
      },
      {
        id: "viral-5",
        platform: "instagram",
        externalId: "DQzWxxDjuaI",
        embedUrl: "https://www.instagram.com/reel/DQzWxxDjuaI/",
        title: "Reel especial",
        description: "Momento marcante no Instagram",
        category: "Dicas",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-06"),
      },
      {
        id: "viral-6",
        platform: "instagram",
        externalId: "DQxcSirEtcq",
        embedUrl: "https://www.instagram.com/reel/DQxcSirEtcq/",
        title: "Compartilhando experiências",
        description: "Da rotina da maternidade",
        category: "Pós-parto",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-05"),
      },
      {
        id: "viral-7",
        platform: "instagram",
        externalId: "DQnfqrTjhFV",
        embedUrl: "https://www.instagram.com/reel/DQnfqrTjhFV/",
        title: "Conteúdo exclusivo",
        description: "Mais um momento especial da Nath",
        category: "Dicas",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-04"),
      },
      {
        id: "viral-8",
        platform: "instagram",
        externalId: "DQcrTwTEl0f",
        embedUrl: "https://www.instagram.com/reel/DQcrTwTEl0f/",
        title: "Dicas e inspirações",
        description: "Compartilhando o dia a dia",
        category: "Bem-estar",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-03"),
      },
      {
        id: "viral-9",
        platform: "instagram",
        externalId: "DQFilJEEnf-",
        embedUrl: "https://www.instagram.com/reel/DQFilJEEnf-/",
        title: "Momentos reais",
        description: "A rotina sem filtros",
        category: "Dicas",
        thumbnailUrl: null,
        likes: null,
        comments: null,
        shares: null,
        featured: true,
        publishedAt: new Date("2025-01-02"),
      },
    ];
    viralPosts.forEach((vp) => this.viralPosts.set(vp.id, vp));

    // Seed daily featured
    const today = new Date().toISOString().split("T")[0];
    this.dailyFeatured.set(today, {
      id: "daily-1",
      date: today,
      tipId: "tip-1",
      postId: "post-1",
      quote: "Você está fazendo um trabalho incrível. Seja gentil consigo mesma.",
    });

    // Seed achievements
    const defaultAchievements: Achievement[] = [
      { id: "first_habit", title: "Primeiro Passo", description: "Crie seu primeiro hábito", emoji: "🎯", requirement: 1, type: "habit_count" },
      { id: "habit_master", title: "Organizadora", description: "Crie 5 hábitos", emoji: "📋", requirement: 5, type: "habit_count" },
      { id: "streak_3", title: "Consistente", description: "Mantenha 3 dias de sequência", emoji: "🔥", requirement: 3, type: "streak" },
      { id: "streak_7", title: "Uma Semana", description: "Complete 7 dias seguidos", emoji: "✨", requirement: 7, type: "streak" },
      { id: "streak_30", title: "Mãe Dedicada", description: "Incrível! 30 dias de sequência", emoji: "👑", requirement: 30, type: "streak" },
      { id: "completions_10", title: "Iniciante", description: "Complete 10 hábitos", emoji: "🌱", requirement: 10, type: "completions" },
      { id: "completions_50", title: "Comprometida", description: "Complete 50 hábitos", emoji: "🌟", requirement: 50, type: "completions" },
      { id: "completions_100", title: "Determinada", description: "100 hábitos completados!", emoji: "💪", requirement: 100, type: "completions" },
      { id: "level_5", title: "Nível 5", description: "Alcance o nível 5", emoji: "⭐", requirement: 5, type: "level" },
      { id: "level_10", title: "Nível 10", description: "Alcance o nível 10", emoji: "🎖️", requirement: 10, type: "level" },
    ];
    defaultAchievements.forEach((achievement) => this.achievements.set(achievement.id, achievement));

    // Seed daily question
    const dailyQuestion: DailyQuestion = {
      id: "question-1",
      date: today,
      question: "Qual foi sua maior vitória como mãe hoje?",
      active: true,
      createdAt: new Date(),
    };
    this.dailyQuestions.set(dailyQuestion.id, dailyQuestion);

    // Seed community posts (RefúgioNath)
    const communityPosts: CommunityPost[] = [
      // Vitórias (Mural de Vitórias)
      {
        id: "comm-1",
        userId: "user-1",
        authorName: "Carolina M.",
        type: "victory",
        content: "Hoje consegui tomar banho sem pressa! Parece bobagem mas pra mim foi uma vitória enorme 💙",
        imageUrl: null,
        tag: null,
        likes: 12,
        moderated: true,
        featured: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "comm-2",
        userId: "user-2",
        authorName: "Julia S.",
        type: "victory",
        content: "Meu bebê dormiu 4 horas seguidas pela primeira vez! Eu consegui descansar um pouco ❤️",
        imageUrl: null,
        tag: null,
        likes: 18,
        moderated: true,
        featured: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        id: "comm-3",
        userId: "user-3",
        authorName: "Mariana P.",
        type: "victory",
        content: "Saí de casa sozinha hoje, mesmo com medo. Fui na padaria e voltei. Pequenos passos!",
        imageUrl: null,
        tag: null,
        likes: 25,
        moderated: true,
        featured: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: "comm-4",
        userId: "user-4",
        authorName: "Ana Clara",
        type: "victory",
        content: "Consegui fazer uma refeição completa sentada à mesa. Não foi só biscoito em pé na cozinha!",
        imageUrl: null,
        tag: null,
        likes: 14,
        moderated: true,
        featured: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        id: "comm-5",
        userId: "user-5",
        authorName: "Beatriz L.",
        type: "victory",
        content: "Disse não pra visita inesperada hoje. Estou orgulhosa de colocar limites!",
        imageUrl: null,
        tag: null,
        likes: 31,
        moderated: true,
        featured: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      // Respostas à Pergunta do Dia
      {
        id: "comm-6",
        userId: "user-6",
        authorName: "Fernanda T.",
        type: "question_response",
        content: "Vi minha filha dar os primeiros passinhos! Chorei de emoção 😭❤️",
        imageUrl: null,
        tag: null,
        likes: 8,
        moderated: true,
        featured: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: "comm-7",
        userId: "user-7",
        authorName: "Patrícia R.",
        type: "question_response",
        content: "Consegui não gritar hoje, mesmo exausta. Respirei fundo e funcionou.",
        imageUrl: null,
        tag: null,
        likes: 15,
        moderated: true,
        featured: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        id: "comm-8",
        userId: "user-8",
        authorName: "Renata K.",
        type: "question_response",
        content: "Aceitei ajuda da minha mãe sem sentir culpa. Isso é ENORME pra mim!",
        imageUrl: null,
        tag: null,
        likes: 22,
        moderated: true,
        featured: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
    ];
    communityPosts.forEach((post) => this.communityPosts.set(post.id, post));
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

  async getViralPosts(featured?: boolean, category?: string): Promise<ViralPost[]> {
    let posts = Array.from(this.viralPosts.values());
    
    if (featured !== undefined) {
      posts = posts.filter((p) => p.featured === featured);
    }
    
    if (category && category !== "all") {
      posts = posts.filter((p) => p.category === category);
    }
    
    return posts.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }

  async createViralPost(insertPost: InsertViralPost): Promise<ViralPost> {
    const id = randomUUID();
    const post: ViralPost = {
      id,
      platform: insertPost.platform,
      externalId: insertPost.externalId,
      embedUrl: insertPost.embedUrl,
      title: insertPost.title,
      description: insertPost.description || null,
      category: insertPost.category || null,
      thumbnailUrl: insertPost.thumbnailUrl || null,
      likes: insertPost.likes || null,
      comments: insertPost.comments || null,
      shares: insertPost.shares || null,
      featured: insertPost.featured ?? false,
      publishedAt: new Date(),
    };
    this.viralPosts.set(id, post);
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
    const id = insertSession.id || randomUUID();
    const session: AiSession = { userId: insertSession.userId, id, startedAt: new Date() };
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
      sources: (insertCache.sources ?? []) as { title: string; url: string }[],
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
      sources: (insertSavedQa.sources ?? []) as { title: string; url: string }[],
      savedAt: new Date(),
    };
    this.savedQa.set(id, savedQa);
    return savedQa;
  }

  // Habits
  async getHabits(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values())
      .filter((h) => h.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = { ...insertHabit, id, createdAt: new Date() };
    this.habits.set(id, habit);
    return habit;
  }

  async deleteHabit(habitId: string): Promise<void> {
    this.habits.delete(habitId);
    // Also delete all completions
    Array.from(this.habitCompletions.keys())
      .filter((key) => key.startsWith(`${habitId}-`))
      .forEach((key) => this.habitCompletions.delete(key));
  }

  async updateHabitOrder(habitId: string, newOrder: number): Promise<void> {
    const habit = this.habits.get(habitId);
    if (habit) {
      habit.order = newOrder;
      this.habits.set(habitId, habit);
    }
  }

  // Habit Completions
  async getHabitCompletion(habitId: string, date: string): Promise<HabitCompletion | undefined> {
    const key = `${habitId}-${date}`;
    return this.habitCompletions.get(key);
  }

  async getHabitCompletions(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter((completion) => {
      return completion.userId === userId && completion.date >= startDate && completion.date <= endDate;
    });
  }

  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = randomUUID();
    const key = `${insertCompletion.habitId}-${insertCompletion.date}`;
    const completion: HabitCompletion = {
      id,
      habitId: insertCompletion.habitId,
      userId: insertCompletion.userId,
      date: insertCompletion.date,
      completedAt: new Date(),
    };
    this.habitCompletions.set(key, completion);
    return completion;
  }

  async deleteHabitCompletion(habitId: string, date: string): Promise<void> {
    const key = `${habitId}-${date}`;
    this.habitCompletions.delete(key);
  }

  // User Stats (Gamification)
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find((stats) => stats.userId === userId);
  }

  async createOrUpdateUserStats(userId: string, xpGain: number, incrementCompletions: boolean = true): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    
    if (existing) {
      const newXp = Math.max(0, existing.xp + xpGain);
      const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level
      
      const updated: UserStats = {
        ...existing,
        xp: newXp,
        level: newLevel,
        totalCompletions: incrementCompletions 
          ? existing.totalCompletions + 1 
          : Math.max(0, existing.totalCompletions + (xpGain < 0 ? -1 : 1)),
        updatedAt: new Date(),
      };
      this.userStats.set(existing.id, updated);
      return updated;
    }
    
    // Create new stats
    const id = randomUUID();
    const stats: UserStats = {
      id,
      userId,
      xp: Math.max(0, xpGain),
      level: Math.floor(Math.max(0, xpGain) / 100) + 1,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: incrementCompletions ? 1 : 0,
      lastActivityDate: null,
      updatedAt: new Date(),
    };
    this.userStats.set(id, stats);
    return stats;
  }

  async updateStreak(userId: string, date: string): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    
    if (!existing) {
      const id = randomUUID();
      const stats: UserStats = {
        id,
        userId,
        xp: 0,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        totalCompletions: 0,
        lastActivityDate: date,
        updatedAt: new Date(),
      };
      this.userStats.set(id, stats);
      return stats;
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
    
    const updated: UserStats = {
      ...existing,
      currentStreak: newStreak,
      longestStreak: Math.max(existing.longestStreak, newStreak),
      lastActivityDate: date,
      updatedAt: new Date(),
    };
    
    this.userStats.set(existing.id, updated);
    return updated;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter((ua) => ua.userId === userId)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    // Check if already unlocked
    const existing = Array.from(this.userAchievements.values()).find(
      (ua) => ua.userId === userId && ua.achievementId === achievementId
    );
    
    if (existing) return null;
    
    const id = randomUUID();
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: new Date(),
    };
    
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
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

  // Community
  async getCommunityPosts(type?: string, limit?: number): Promise<CommunityPost[]> {
    let posts = Array.from(this.communityPosts.values())
      .filter(post => post.moderated); // Only moderated posts
    
    if (type) {
      posts = posts.filter(post => post.type === type);
    }
    
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      posts = posts.slice(0, limit);
    }
    
    return posts;
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = randomUUID();
    const post: CommunityPost = {
      userId: insertPost.userId,
      authorName: insertPost.authorName,
      type: insertPost.type,
      content: insertPost.content,
      imageUrl: insertPost.imageUrl || null,
      tag: insertPost.tag || null,
      id,
      likes: 0,
      moderated: false,
      featured: false,
      createdAt: new Date(),
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async getDailyQuestion(date: string): Promise<DailyQuestion | undefined> {
    return Array.from(this.dailyQuestions.values()).find(
      q => q.date === date && q.active
    );
  }

  async createDailyQuestion(insertQuestion: InsertDailyQuestion): Promise<DailyQuestion> {
    const id = randomUUID();
    const question: DailyQuestion = {
      ...insertQuestion,
      id,
      active: true,
      createdAt: new Date(),
    };
    this.dailyQuestions.set(id, question);
    return question;
  }
}

export const storage = new MemStorage();
