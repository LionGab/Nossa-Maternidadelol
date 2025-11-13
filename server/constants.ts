/**
 * Application constants
 * Centralized constants to avoid magic numbers and hardcoded strings
 */

// Gamification constants
export const GAMIFICATION = {
  /** XP gained per habit completion */
  XP_PER_COMPLETION: 10,
  /** XP required per level (level = floor(xp / XP_PER_LEVEL) + 1) */
  XP_PER_LEVEL: 100,
  /** Maximum number of habits a user can create */
  MAX_HABITS: 5,
  /** Maximum days to calculate streak (1 year) */
  MAX_STREAK_DAYS: 365,
} as const;

// Achievement thresholds
export const ACHIEVEMENTS = {
  STREAK_3: "streak_3",
  STREAK_7: "streak_7",
  STREAK_30: "streak_30",
  COMPLETIONS_10: "completions_10",
  COMPLETIONS_50: "completions_50",
  COMPLETIONS_100: "completions_100",
  LEVEL_5: "level_5",
  LEVEL_10: "level_10",
  HABIT_COUNT_1: "first_habit",
  HABIT_COUNT_5: "habit_master",

  THRESHOLDS: {
    STREAK_3: 3,
    STREAK_7: 7,
    STREAK_30: 30,
    COMPLETIONS_10: 10,
    COMPLETIONS_50: 50,
    COMPLETIONS_100: 100,
    LEVEL_5: 5,
    LEVEL_10: 10,
    HABIT_COUNT_1: 1,
    HABIT_COUNT_5: 5,
  },
} as const;

// Community constants
export const COMMUNITY = {
  /** Maximum number of comments per post */
  MAX_COMMENTS_PER_POST: 5,
  /** Maximum characters per comment */
  MAX_COMMENT_LENGTH: 150,
  /** Maximum reports before auto-hiding a post */
  MAX_REPORTS_BEFORE_HIDE: 3,
} as const;

// AI constants
export const AI = {
  /** Number of recent messages to include in context */
  RECENT_MESSAGES_COUNT: 6,
  /** Number of recent achievements to include in context */
  RECENT_ACHIEVEMENTS_COUNT: 5,
  /** Number of recent favorite posts to include in context */
  RECENT_FAVORITES_COUNT: 5,
  /** Number of favorite posts to fetch for category analysis */
  FAVORITE_POSTS_FETCH_COUNT: 10,
  /** Number of active topics to include in context */
  ACTIVE_TOPICS_COUNT: 5,
  /** Number of recent community posts to include in context */
  RECENT_COMMUNITY_POSTS_COUNT: 5,
  /** Number of sources to return from Perplexity API */
  PERPLEXITY_MAX_SOURCES: 4,
} as const;

// Upload constants
export const UPLOAD = {
  /** Allowed file types for avatar uploads */
  AVATAR_ALLOWED_TYPES: ["jpg", "jpeg", "png", "webp"] as const,
  /** Maximum file size for avatar upload (5MB) */
  AVATAR_MAX_SIZE: 5 * 1024 * 1024,
  /** Supabase storage bucket name for avatars */
  AVATAR_BUCKET: "avatars",
  /** Allowed file types for content uploads */
  CONTENT_ALLOWED_TYPES: ["jpg", "jpeg", "png", "webp", "gif"] as const,
  /** Maximum file size for content upload (10MB) */
  CONTENT_MAX_SIZE: 10 * 1024 * 1024,
  /** Supabase storage bucket name for content */
  CONTENT_BUCKET: "content",
  /** Default content type for image uploads */
  DEFAULT_CONTENT_TYPE: "image/jpeg",
  /** Cache control value in seconds (1 hour) */
  CACHE_CONTROL_SECONDS: 3600,
  /** Cache control header value (1 hour in seconds) - @deprecated Use CACHE_CONTROL_SECONDS */
  CACHE_CONTROL: "3600",
} as const;

// Time constants
export const TIME = {
  /** Days in a year */
  DAYS_PER_YEAR: 365,
  /** Milliseconds per day */
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  /** Days to calculate completion rate (last week) */
  COMPLETION_RATE_DAYS: 7,
  /** Days offset for habit history (6 days ago = 7 days including today) */
  HABIT_HISTORY_DAYS_OFFSET: 6,
} as const;

// Content constants
export const CONTENT = {
  /** Number of featured posts to return */
  FEATURED_POSTS_COUNT: 3,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages (Portuguese)
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: "Email ou senha incorretos.",
  EMAIL_ALREADY_EXISTS: "Este email já está cadastrado.",
  UNAUTHORIZED: "Você precisa estar logado para acessar este recurso.",
  INVALID_TOKEN: "Token inválido ou expirado.",

  // Rate limiting
  TOO_MANY_REQUESTS_AI: "Muitas mensagens enviadas. Aguarde um minuto e tente novamente.",
  TOO_MANY_REQUESTS_AUTH: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  TOO_MANY_REQUESTS_GENERAL: "Muitas requisições. Por favor, aguarde.",

  // Validation
  INVALID_INPUT: "Dados inválidos. Verifique os campos e tente novamente.",
  INVALID_EMAIL: "Email inválido.",
  PASSWORD_TOO_SHORT: "Senha deve ter no mínimo 8 caracteres.",
  REQUIRED_FIELD: "Este campo é obrigatório.",

  // Resources
  NOT_FOUND: "Recurso não encontrado.",
  HABIT_NOT_FOUND: "Hábito não encontrado.",
  POST_NOT_FOUND: "Post não encontrado.",
  PROFILE_NOT_FOUND: "Perfil não encontrado.",

  // Generic
  INTERNAL_ERROR: "Erro interno do servidor. Tente novamente mais tarde.",
  DATABASE_ERROR: "Erro ao acessar o banco de dados.",
  EXTERNAL_API_ERROR: "Erro ao comunicar com serviço externo.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: "Login realizado com sucesso!",
  REGISTER_SUCCESS: "Conta criada com sucesso!",
  LOGOUT_SUCCESS: "Logout realizado com sucesso!",

  // Habits
  HABIT_CREATED: "Hábito criado com sucesso!",
  HABIT_COMPLETED: "Hábito concluído! Continue assim! 🎉",
  HABIT_DELETED: "Hábito removido.",
  HABIT_UPDATED: "Hábito atualizado.",

  // Community
  POST_CREATED: "Post publicado com sucesso!",
  COMMENT_CREATED: "Comentário adicionado!",
  REACTION_ADDED: "Reação adicionada!",
  REPORT_SUBMITTED: "Denúncia enviada. Obrigada por ajudar a comunidade!",

  // Content
  FAVORITE_ADDED: "Adicionado aos favoritos!",
  FAVORITE_REMOVED: "Removido dos favoritos.",

  // Profile
  PROFILE_UPDATED: "Perfil atualizado com sucesso!",
  AVATAR_UPDATED: "Avatar atualizado!",
} as const;

