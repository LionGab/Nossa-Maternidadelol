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
import { randomUUID } from "crypto";
import { generateAvatar } from "../avatar";
import type { IStorage } from "./types";
import { GAMIFICATION } from "../constants";

/**
 * MemStorage - Implementação de IStorage usando Maps em memória
 * Usado para desenvolvimento quando DATABASE_URL não está configurada
 */
export class MemStorage implements IStorage {
  private users: Map<string, User>;
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
  private comments: Map<string, Comment>;
  private reactions: Map<string, Reaction>;
  private reports: Map<string, Report>;

  constructor() {
    this.users = new Map();
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
    this.comments = new Map();
    this.reactions = new Map();
    this.reports = new Map();

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

    // Seed community posts (RefúgioNath - 4 tipos: desabafo, vitoria, apoio, reflexao)
    // Posts vulneráveis e autênticos baseados em experiências reais de mães
    const communityPosts: CommunityPost[] = [
      // 💬 DESABAFOS (#Exaustão, #Culpa, #Sobrecarrega)
      {
        id: "post-1",
        userId: "user-1",
        authorName: "Ana",
        avatarUrl: generateAvatar("user-1", "lorelei"),
        type: "desabafo",
        content: "Gritei com meu filho hoje. Me senti a pior mãe do mundo. A culpa não passa.",
        tag: "#Culpa",
        reactionCount: 34,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
      },
      {
        id: "post-2",
        userId: "user-2",
        authorName: "Carla",
        avatarUrl: generateAvatar("user-2", "lorelei"),
        type: "desabafo",
        content: "Tô exausta e ninguém me pergunta como eu tô. Só querem saber do bebê.",
        tag: "#Exaustão",
        reactionCount: 56,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h atrás
      },
      {
        id: "post-3",
        userId: "user-3",
        authorName: "Juliana",
        avatarUrl: generateAvatar("user-3", "lorelei"),
        type: "desabafo",
        content: "Sinto que não sou boa o suficiente. Vejo outras mães e parecem ter tudo sob controle.",
        tag: "#Culpa",
        reactionCount: 42,
        commentCount: 4,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h atrás
      },
      {
        id: "post-4",
        userId: "user-4",
        authorName: "Beatriz",
        avatarUrl: generateAvatar("user-4", "lorelei"),
        type: "desabafo",
        content: "Acordo e já tô cansada. Durmo e acordo no mesmo cansaço. Não aguento mais.",
        tag: "#Exaustão",
        reactionCount: 67,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h atrás
      },
      {
        id: "post-5",
        userId: "user-5",
        authorName: "Patricia",
        avatarUrl: generateAvatar("user-5", "lorelei"),
        type: "desabafo",
        content: "Minha casa é uma bagunça. Meu marido reclama. Eu quero gritar que TÔ FAZENDO O MELHOR QUE POSSO.",
        tag: "#Sobrecarrega",
        reactionCount: 89,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18h atrás
      },
      {
        id: "post-6",
        userId: "user-6",
        authorName: "Fernanda",
        avatarUrl: generateAvatar("user-6", "lorelei"),
        type: "desabafo",
        content: "Chorei escondida no banheiro hoje. De novo.",
        tag: "#Exaustão",
        reactionCount: 78,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      },

      // 🎉 PEQUENAS VITÓRIAS (#Vitória, #Autocuidado, #Orgulho)
      {
        id: "post-7",
        userId: "user-7",
        authorName: "Maria",
        avatarUrl: generateAvatar("user-7", "lorelei"),
        type: "vitoria",
        content: "Tomei banho antes das 15h. Parece pouco mas foi MUITO.",
        tag: "#Autocuidado",
        reactionCount: 89,
        commentCount: 3,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
      },
      {
        id: "post-8",
        userId: "user-8",
        authorName: "Carolina",
        avatarUrl: generateAvatar("user-8", "lorelei"),
        type: "vitoria",
        content: "Consegui comer sentada sem ninguém me interromper.",
        tag: "#Vitória",
        reactionCount: 54,
        commentCount: 2,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h atrás
      },
      {
        id: "post-9",
        userId: "user-9",
        authorName: "Renata",
        avatarUrl: generateAvatar("user-9", "lorelei"),
        type: "vitoria",
        content: "Disse não sem me sentir culpada.",
        tag: "#Orgulho",
        reactionCount: 92,
        commentCount: 4,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10h atrás
      },
      {
        id: "post-10",
        userId: "user-10",
        authorName: "Luciana",
        avatarUrl: generateAvatar("user-10", "lorelei"),
        type: "vitoria",
        content: "Pedi ajuda e não morri de vergonha.",
        tag: "#Vitória",
        reactionCount: 71,
        commentCount: 3,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14h atrás
      },
      {
        id: "post-11",
        userId: "user-11",
        authorName: "Daniela",
        avatarUrl: generateAvatar("user-11", "lorelei"),
        type: "vitoria",
        content: "Rir com meu filho mesmo cansada.",
        tag: "#Vitória",
        reactionCount: 65,
        commentCount: 2,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20h atrás
      },
      {
        id: "post-12",
        userId: "user-12",
        authorName: "Amanda",
        avatarUrl: generateAvatar("user-12", "lorelei"),
        type: "vitoria",
        content: "Fiz uma refeição de verdade. Não foi biscoito em pé na cozinha.",
        tag: "#Autocuidado",
        reactionCount: 48,
        commentCount: 2,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // 26h atrás
      },

      // 🆘 PRECISO DE APOIO (#Exaustão, #NãoAguento, #Socorro)
      {
        id: "post-13",
        userId: "user-13",
        authorName: "Roberta",
        avatarUrl: generateAvatar("user-13", "lorelei"),
        type: "apoio",
        content: "Não durmo há dias e tô no limite. Meu corpo não aguenta mais.",
        tag: "#NãoAguento",
        reactionCount: 95,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h atrás
      },
      {
        id: "post-14",
        userId: "user-14",
        authorName: "Camila",
        avatarUrl: generateAvatar("user-14", "lorelei"),
        type: "apoio",
        content: "Meu filho não para de chorar e não sei mais o que fazer. Cansei de tentar.",
        tag: "#Socorro",
        reactionCount: 82,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7h atrás
      },
      {
        id: "post-15",
        userId: "user-15",
        authorName: "Mariana",
        avatarUrl: generateAvatar("user-15", "lorelei"),
        type: "apoio",
        content: "Tô sozinha nisso e cansei. Ninguém me ajuda de verdade.",
        tag: "#Exaustão",
        reactionCount: 103,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11h atrás
      },
      {
        id: "post-16",
        userId: "user-16",
        authorName: "Gabriela",
        avatarUrl: generateAvatar("user-16", "lorelei"),
        type: "apoio",
        content: "Sinto que vou surtar. Não consigo fazer nada direito.",
        tag: "#NãoAguento",
        reactionCount: 76,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16h atrás
      },
      {
        id: "post-17",
        userId: "user-17",
        authorName: "Tatiana",
        avatarUrl: generateAvatar("user-17", "lorelei"),
        type: "apoio",
        content: "Tenho medo de não conseguir. De falhar. De desistir.",
        tag: "#Socorro",
        reactionCount: 88,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22h atrás
      },

      // 💭 REFLEXÕES (#Pensamento, #Identidade, #Maternidade)
      {
        id: "post-18",
        userId: "user-18",
        authorName: "Vanessa",
        avatarUrl: generateAvatar("user-18", "lorelei"),
        type: "reflexao",
        content: "Tenho mais medo de falhar como mãe do que qualquer outra coisa.",
        tag: "#Pensamento",
        reactionCount: 94,
        commentCount: 4,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9h atrás
      },
      {
        id: "post-19",
        userId: "user-19",
        authorName: "Bruna",
        avatarUrl: generateAvatar("user-19", "lorelei"),
        type: "reflexao",
        content: "Perdi minha identidade e não sei quem eu sou além de mãe.",
        tag: "#Identidade",
        reactionCount: 107,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000), // 13h atrás
      },
      {
        id: "post-20",
        userId: "user-20",
        authorName: "Aline",
        avatarUrl: generateAvatar("user-20", "lorelei"),
        type: "reflexao",
        content: "Amo meu filho mas sinto falta de quem eu era.",
        tag: "#Identidade",
        reactionCount: 119,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: true,
        createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000), // 17h atrás
      },
      {
        id: "post-21",
        userId: "user-21",
        authorName: "Priscila",
        avatarUrl: generateAvatar("user-21", "lorelei"),
        type: "reflexao",
        content: "Ninguém me preparou pra isso. Pra solidão. Pro cansaço que não passa.",
        tag: "#Maternidade",
        reactionCount: 86,
        commentCount: 4,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000), // 21h atrás
      },
      {
        id: "post-22",
        userId: "user-22",
        authorName: "Letícia",
        avatarUrl: generateAvatar("user-22", "lorelei"),
        type: "reflexao",
        content: "Percebi que tá tudo bem não estar bem o tempo todo.",
        tag: "#Pensamento",
        reactionCount: 72,
        commentCount: 3,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25h atrás
      },
      {
        id: "post-23",
        userId: "user-23",
        authorName: "Simone",
        avatarUrl: generateAvatar("user-23", "lorelei"),
        type: "reflexao",
        content: "A maternidade me desconstruiu. E eu tô tentando me reconstruir diferente.",
        tag: "#Identidade",
        reactionCount: 98,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30h atrás
      },

      // Mais DESABAFOS e VITÓRIAS para completar 30 posts
      {
        id: "post-24",
        userId: "user-24",
        authorName: "Adriana",
        avatarUrl: generateAvatar("user-24", "lorelei"),
        type: "desabafo",
        content: "Meu marido não entende. Ele acha que eu só fico em casa.",
        tag: "#Sobrecarrega",
        reactionCount: 102,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15h atrás
      },
      {
        id: "post-25",
        userId: "user-25",
        authorName: "Mônica",
        avatarUrl: generateAvatar("user-25", "lorelei"),
        type: "vitoria",
        content: "Saí de casa sozinha. Só 20 minutos. Mas respirei.",
        tag: "#Autocuidado",
        reactionCount: 63,
        commentCount: 3,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000), // 19h atrás
      },
      {
        id: "post-26",
        userId: "user-26",
        authorName: "Sandra",
        avatarUrl: generateAvatar("user-26", "lorelei"),
        type: "desabafo",
        content: "Tenho vontade de sumir. Só por algumas horas. Descansar.",
        tag: "#Exaustão",
        reactionCount: 91,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23h atrás
      },
      {
        id: "post-27",
        userId: "user-27",
        authorName: "Elaine",
        avatarUrl: generateAvatar("user-27", "lorelei"),
        type: "vitoria",
        content: "Arrumei a casa. Não tudo. Mas arrumei.",
        tag: "#Vitória",
        reactionCount: 44,
        commentCount: 2,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 27 * 60 * 60 * 1000), // 27h atrás
      },
      {
        id: "post-28",
        userId: "user-28",
        authorName: "Raquel",
        avatarUrl: generateAvatar("user-28", "lorelei"),
        type: "apoio",
        content: "Esqueci como é dormir a noite toda. Alguém mais?",
        tag: "#Exaustão",
        reactionCount: 115,
        commentCount: 5,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 29 * 60 * 60 * 1000), // 29h atrás
      },
      {
        id: "post-29",
        userId: "user-29",
        authorName: "Claudia",
        avatarUrl: generateAvatar("user-29", "lorelei"),
        type: "reflexao",
        content: "Ser mãe é amar tanto que dói. Literalmente dói.",
        tag: "#Maternidade",
        reactionCount: 81,
        commentCount: 4,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 31 * 60 * 60 * 1000), // 31h atrás
      },
      {
        id: "post-30",
        userId: "user-30",
        authorName: "Isabel",
        avatarUrl: generateAvatar("user-30", "lorelei"),
        type: "vitoria",
        content: "Fui no mercado com ele. Sobrevivi. Vitória.",
        tag: "#Vitória",
        reactionCount: 58,
        commentCount: 2,
        reportCount: 0,
        hidden: false,
        featured: false,
        createdAt: new Date(Date.now() - 33 * 60 * 60 * 1000), // 33h atrás
      },
    ];
    communityPosts.forEach((post) => this.communityPosts.set(post.id, post));

    // Seed comments (acolhimento curto, máx 150 chars, máx 5 por post)
    const comments: Comment[] = [
      // Comentários no post-1 (desabafo sobre gritar) - 5 comments
      { id: "comment-1", postId: "post-1", userId: "user-50", authorName: "Carla", avatarUrl: generateAvatar("user-50", "lorelei"), content: "Eu também. Você não é má.", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-2", postId: "post-1", userId: "user-51", authorName: "Ju", avatarUrl: generateAvatar("user-51", "lorelei"), content: "Respira. Amanhã é outro dia.", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-3", postId: "post-1", userId: "user-52", authorName: "Bia", avatarUrl: generateAvatar("user-52", "lorelei"), content: "Tô contigo. A gente erra. Você tá fazendo o que pode.", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { id: "comment-4", postId: "post-1", userId: "user-53", authorName: "Lu", avatarUrl: generateAvatar("user-53", "lorelei"), content: "Acontece. Não se destrua por isso.", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 20 * 60 * 1000) },
      { id: "comment-5", postId: "post-1", userId: "user-54", authorName: "Dani", avatarUrl: generateAvatar("user-54", "lorelei"), content: "Você pediu desculpas? Então tá tudo bem. A gente é humana.", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000) },

      // Comentários no post-2 (exaustão, ninguém pergunta) - 5 comments
      { id: "comment-6", postId: "post-2", userId: "user-55", authorName: "Rê", avatarUrl: generateAvatar("user-55", "lorelei"), content: "Tô passando pela mesma coisa. Te vejo.", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-7", postId: "post-2", userId: "user-56", authorName: "Gabi", avatarUrl: generateAvatar("user-56", "lorelei"), content: "Como você tá? De verdade?", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-8", postId: "post-2", userId: "user-57", authorName: "Cris", avatarUrl: generateAvatar("user-57", "lorelei"), content: "Eu te entendo tanto. Você não tá sozinha nisso.", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { id: "comment-9", postId: "post-2", userId: "user-58", authorName: "Lê", avatarUrl: generateAvatar("user-58", "lorelei"), content: "Tô aqui. De coração. Você importa.", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 20 * 60 * 1000) },
      { id: "comment-10", postId: "post-2", userId: "user-59", authorName: "Fabi", avatarUrl: generateAvatar("user-59", "lorelei"), content: "Eu pergunto: como você tá? Fala comigo.", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 25 * 60 * 1000) },

      // Comentários no post-3 (não sou boa o suficiente) - 4 comments
      { id: "comment-11", postId: "post-3", userId: "user-60", authorName: "Mari", avatarUrl: generateAvatar("user-60", "lorelei"), content: "Instagram é fake. Elas também estão se segurando.", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-12", postId: "post-3", userId: "user-61", authorName: "Pati", avatarUrl: generateAvatar("user-61", "lorelei"), content: "Você É boa o suficiente. Acredita.", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-13", postId: "post-3", userId: "user-62", authorName: "Nath", avatarUrl: generateAvatar("user-62", "lorelei"), content: "Ninguém tem tudo sob controle. É mentira.", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { id: "comment-14", postId: "post-3", userId: "user-63", authorName: "Vivi", avatarUrl: generateAvatar("user-63", "lorelei"), content: "Você tá fazendo demais. Sério.", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000 + 20 * 60 * 1000) },

      // Comentários no post-4 (cansaço permanente) - 5 comments
      { id: "comment-15", postId: "post-4", userId: "user-64", authorName: "Sofia", avatarUrl: generateAvatar("user-64", "lorelei"), content: "Eu também acordo cansada. Todo dia. Te entendo.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-16", postId: "post-4", userId: "user-65", authorName: "Lara", avatarUrl: generateAvatar("user-65", "lorelei"), content: "Isso vai passar. Eu juro que vai.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-17", postId: "post-4", userId: "user-66", authorName: "Alice", avatarUrl: generateAvatar("user-66", "lorelei"), content: "Você precisa de ajuda. De verdade. Pede.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { id: "comment-18", postId: "post-4", userId: "user-67", authorName: "Nina", avatarUrl: generateAvatar("user-67", "lorelei"), content: "Tô contigo. A gente aguenta junto.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 20 * 60 * 1000) },
      { id: "comment-19", postId: "post-4", userId: "user-68", authorName: "Clara", avatarUrl: generateAvatar("user-68", "lorelei"), content: "Força. Você tá fazendo o que pode.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 25 * 60 * 1000) },

      // Comentários no post-5 (marido reclama da bagunça) - 5 comments
      { id: "comment-20", postId: "post-5", userId: "user-69", authorName: "Tati", avatarUrl: generateAvatar("user-69", "lorelei"), content: "Ele reclama? Então ele pode limpar.", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-21", postId: "post-5", userId: "user-70", authorName: "Cami", avatarUrl: generateAvatar("user-70", "lorelei"), content: "Você TÁ fazendo o melhor. Ele que não vê.", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-22", postId: "post-5", userId: "user-71", authorName: "Rafa", avatarUrl: generateAvatar("user-71", "lorelei"), content: "Grita sim. Ele precisa ouvir.", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { id: "comment-23", postId: "post-5", userId: "user-72", authorName: "Jéssica", avatarUrl: generateAvatar("user-72", "lorelei"), content: "Bagunça é sinal de vida. De amor. De cansaço também.", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000 + 20 * 60 * 1000) },
      { id: "comment-24", postId: "post-5", userId: "user-73", authorName: "Paula", avatarUrl: generateAvatar("user-73", "lorelei"), content: "Tô com você. Ele não entende nada.", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000 + 25 * 60 * 1000) },

      // Comentários no post-6 (chorei no banheiro) - 5 comments
      { id: "comment-25", postId: "post-6", userId: "user-74", authorName: "Roberta", avatarUrl: generateAvatar("user-74", "lorelei"), content: "Eu também. Ontem.", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-26", postId: "post-6", userId: "user-75", authorName: "Sabrina", avatarUrl: generateAvatar("user-75", "lorelei"), content: "O banheiro é nosso refúgio. Te entendo.", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-27", postId: "post-6", userId: "user-76", authorName: "Helena", avatarUrl: generateAvatar("user-76", "lorelei"), content: "Chora. Solta. Você merece desabafar.", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { id: "comment-28", postId: "post-6", userId: "user-77", authorName: "Melissa", avatarUrl: generateAvatar("user-77", "lorelei"), content: "Tô aqui. Se precisar, fala.", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 20 * 60 * 1000) },
      { id: "comment-29", postId: "post-6", userId: "user-78", authorName: "Lívia", avatarUrl: generateAvatar("user-78", "lorelei"), content: "Você não tá sozinha. A gente segura junto.", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000) },

      // Comentários no post-7 (banho antes das 15h) - 3 comments
      { id: "comment-30", postId: "post-7", userId: "user-79", authorName: "Bea", avatarUrl: generateAvatar("user-79", "lorelei"), content: "Isso é gigante! Parabéns!", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-31", postId: "post-7", userId: "user-80", authorName: "Lorena", avatarUrl: generateAvatar("user-80", "lorelei"), content: "Eu sei o quanto isso é difícil. Celebra!", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-32", postId: "post-7", userId: "user-81", authorName: "Amanda", avatarUrl: generateAvatar("user-81", "lorelei"), content: "Tô orgulhosa de você!", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 15 * 60 * 1000) },

      // Comentários no post-9 (disse não sem culpa) - 4 comments
      { id: "comment-33", postId: "post-9", userId: "user-82", authorName: "Fernanda", avatarUrl: generateAvatar("user-82", "lorelei"), content: "Isso é ENORME. Sério. Parabéns!", createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-34", postId: "post-9", userId: "user-83", authorName: "Carol", avatarUrl: generateAvatar("user-83", "lorelei"), content: "Limites são amor próprio. Você conseguiu!", createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-35", postId: "post-9", userId: "user-84", authorName: "Andreia", avatarUrl: generateAvatar("user-84", "lorelei"), content: "Orgulho de você. Continua!", createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000 + 15 * 60 * 1000) },
      { id: "comment-36", postId: "post-9", userId: "user-85", authorName: "Thais", avatarUrl: generateAvatar("user-85", "lorelei"), content: "Você merece esse orgulho todo.", createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000 + 20 * 60 * 1000) },

      // Continue para outros posts com comments...
      // post-10 (pedi ajuda) - 3 comments
      { id: "comment-37", postId: "post-10", userId: "user-86", authorName: "Val", avatarUrl: generateAvatar("user-86", "lorelei"), content: "Pedir ajuda é força, não fraqueza.", createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000 + 5 * 60 * 1000) },
      { id: "comment-38", postId: "post-10", userId: "user-87", authorName: "Rita", avatarUrl: generateAvatar("user-87", "lorelei"), content: "Você fez certo. Continua pedindo.", createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000 + 10 * 60 * 1000) },
      { id: "comment-39", postId: "post-10", userId: "user-88", authorName: "Sônia", avatarUrl: generateAvatar("user-88", "lorelei"), content: "Orgulho de você!", createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000 + 15 * 60 * 1000) },
    ];
    comments.forEach((comment) => this.comments.set(comment.id, comment));
  }

  // User methods (Authentication)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser & { id?: string }): Promise<User> {
    const id = insertUser.id || randomUUID();
    const user: User = {
      id,
      email: insertUser.email,
      passwordHash: insertUser.passwordHash,
      emailVerified: false,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(id, user);
    }
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find((p) => p.userId === userId);
  }

  async createProfile(insertProfile: InsertProfile & { userId: string }): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = {
      id,
      userId: insertProfile.userId,
      name: insertProfile.name,
      stage: insertProfile.stage,
      goals: insertProfile.goals || null,
      avatarUrl: null,
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
    const session: AiSession = {
      userId: insertSession.userId,
      id,
      agentType: insertSession.agentType || "general",
      startedAt: new Date(),
    };
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

  async getHabit(habitId: string): Promise<Habit | undefined> {
    return this.habits.get(habitId);
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

  async getHabitCompletionsByHabitIds(habitIds: string[], startDate: string, endDate: string): Promise<HabitCompletion[]> {
    const habitIdSet = new Set(habitIds);
    return Array.from(this.habitCompletions.values()).filter((completion) => {
      return habitIdSet.has(completion.habitId) && completion.date >= startDate && completion.date <= endDate;
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
      const newLevel = Math.floor(newXp / GAMIFICATION.XP_PER_LEVEL) + 1;

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
      level: Math.floor(Math.max(0, xpGain) / GAMIFICATION.XP_PER_LEVEL) + 1,
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

  async updateStreakValue(userId: string, streak: number): Promise<UserStats> {
    const existing = await this.getUserStats(userId);

    if (!existing) {
      const id = randomUUID();
      const stats: UserStats = {
        id,
        userId,
        xp: 0,
        level: 1,
        currentStreak: streak,
        longestStreak: streak,
        totalCompletions: 0,
        lastActivityDate: null,
        updatedAt: new Date(),
      };
      this.userStats.set(id, stats);
      return stats;
    }

    const updated: UserStats = {
      ...existing,
      currentStreak: streak,
      longestStreak: Math.max(existing.longestStreak, streak),
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
  async getCommunityPosts(type?: string, limit?: number, tag?: string, featured?: boolean): Promise<CommunityPost[]> {
    let posts = Array.from(this.communityPosts.values())
      .filter(post => !post.hidden); // Only non-hidden posts

    if (type) {
      posts = posts.filter(post => post.type === type);
    }

    if (tag) {
      posts = posts.filter(post => post.tag === tag);
    }

    if (featured !== undefined) {
      posts = posts.filter(post => post.featured === featured);
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
      avatarUrl: insertPost.avatarUrl,
      type: insertPost.type,
      content: insertPost.content,
      tag: insertPost.tag || null,
      id,
      reactionCount: 0,
      commentCount: 0,
      reportCount: 0,
      hidden: false,
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

  // Comments (with counter sync)
  async getComments(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    // Enforce max 5 comments per post
    const existing = Array.from(this.comments.values())
      .filter(comment => comment.postId === insertComment.postId);

    if (existing.length >= 5) {
      throw new Error("Máximo de 5 comentários atingido para este post");
    }

    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);

    // Sync commentCount on post
    const post = this.communityPosts.get(insertComment.postId);
    if (post) {
      post.commentCount = post.commentCount + 1;
      this.communityPosts.set(post.id, post);
    }

    return comment;
  }

  // Reactions (with counter sync)
  async getReactions(postId: string): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(reaction => reaction.postId === postId);
  }

  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    // Check if reaction already exists (prevent duplicates)
    const existing = Array.from(this.reactions.values()).find(
      r => r.postId === insertReaction.postId &&
        r.userId === insertReaction.userId &&
        r.type === insertReaction.type
    );

    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const reaction: Reaction = {
      ...insertReaction,
      id,
      createdAt: new Date(),
    };
    this.reactions.set(id, reaction);

    // Sync reactionCount on post
    const post = this.communityPosts.get(insertReaction.postId);
    if (post) {
      post.reactionCount += 1;
      this.communityPosts.set(post.id, post);
    }

    return reaction;
  }

  async deleteReaction(postId: string, userId: string, type: string): Promise<void> {
    const reaction = Array.from(this.reactions.values()).find(
      r => r.postId === postId && r.userId === userId && r.type === type
    );

    if (reaction) {
      this.reactions.delete(reaction.id);

      // Sync reactionCount on post
      const post = this.communityPosts.get(postId);
      if (post && post.reactionCount > 0) {
        post.reactionCount -= 1;
        this.communityPosts.set(post.id, post);
      }
    }
  }

  // Reports (with auto-hide)
  async createReport(insertReport: InsertReport): Promise<Report> {
    // Check if report already exists (prevent duplicates)
    const existing = Array.from(this.reports.values()).find(
      r => r.postId === insertReport.postId && r.userId === insertReport.userId
    );

    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const report: Report = {
      id,
      postId: insertReport.postId,
      userId: insertReport.userId,
      reason: insertReport.reason || null,
      createdAt: new Date(),
    };
    this.reports.set(id, report);

    // Sync reportCount on post and auto-hide if >= 3
    const post = this.communityPosts.get(insertReport.postId);
    if (post) {
      post.reportCount += 1;

      if (post.reportCount >= 3) {
        post.hidden = true; // Auto-hide after 3 reports
      }

      this.communityPosts.set(post.id, post);
    }

    return report;
  }
}

