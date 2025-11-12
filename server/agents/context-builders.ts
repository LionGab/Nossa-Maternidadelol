import { storage } from "../storage";
import type { ChatContext } from "../gemini";
import type { HabitsContext } from "./prompts/habits-prompt";
import type { ContentContext } from "./prompts/content-prompt";
import type { CommunityContext } from "./prompts/community-prompt";
import type { AgentType } from "@shared/schema";
import { GAMIFICATION, AI, TIME } from "../constants";

export async function buildGeneralContext(userId: string): Promise<ChatContext> {
  const profile = await storage.getProfileByUserId(userId);
  
  return {
    userStage: profile?.stage,
    userGoals: profile?.goals || [],
  };
}

export async function buildHabitsContext(userId: string): Promise<HabitsContext> {
  const profile = await storage.getProfileByUserId(userId);
  const habits = await storage.getHabits(userId);
  const stats = await storage.getUserStats(userId);
  
  // Buscar completions de hoje
  const today = new Date().toISOString().split("T")[0];
  const completions = await storage.getHabitCompletions(userId, today, today);
  const completedHabitIds = new Set(completions.map(c => c.habitId));
  
  // Buscar achievements recentes
  const userAchievements = await storage.getUserAchievements(userId);
  const allAchievements = await storage.getAchievements();
  const achievementMap = new Map(allAchievements.map(a => [a.id, a]));
  const recentAchievements = userAchievements
    .slice(-AI.RECENT_ACHIEVEMENTS_COUNT)
    .map(ua => achievementMap.get(ua.achievementId)?.title)
    .filter(Boolean) as string[];
  
  // Calcular taxa de conclusão (últimos N dias)
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - TIME.COMPLETION_RATE_DAYS);
  const startDate = daysAgo.toISOString().split("T")[0];
  const recentCompletions = await storage.getHabitCompletions(userId, startDate, today);
  const totalPossible = habits.length * TIME.COMPLETION_RATE_DAYS;
  const completionRate = totalPossible > 0 ? recentCompletions.length / totalPossible : 0;
  
  return {
    userStage: profile?.stage,
    userGoals: profile?.goals || [],
    habits: habits.map(h => ({
      name: h.title,
      emoji: h.emoji,
      completedToday: completedHabitIds.has(h.id),
    })),
    currentStreak: stats?.currentStreak,
    totalXP: stats?.xp,
    level: stats?.xp ? Math.floor(stats.xp / GAMIFICATION.XP_PER_LEVEL) + 1 : undefined,
    recentAchievements,
    completionRate,
  };
}

export async function buildContentContext(userId: string): Promise<ContentContext> {
  const profile = await storage.getProfileByUserId(userId);
  const favorites = await storage.getFavorites(userId);
  
  // Buscar posts favoritados para extrair categorias
  const postIds = favorites.map(f => f.postId);
  const posts = await Promise.all(
    postIds.slice(-AI.FAVORITE_POSTS_FETCH_COUNT).map(id => storage.getPost(id))
  );
  const validPosts = posts.filter(Boolean) as any[];
  
  const favoriteCategories = Array.from(
    new Set(validPosts.map(p => p.category).filter(Boolean))
  ) as string[];
  
  const recentFavorites = validPosts
    .slice(-AI.RECENT_FAVORITES_COUNT)
    .map(p => ({
      title: p.title,
      category: p.category,
    }));
  
  // Tipos de conteúdo preferidos (baseado em favoritos)
  const contentTypes = Array.from(
    new Set(validPosts.map(p => p.type).filter(Boolean))
  ) as string[];
  
  return {
    userStage: profile?.stage,
    userGoals: profile?.goals || [],
    favoriteCategories,
    recentFavorites,
    viewedPosts: favorites.length,
    preferredContentTypes: contentTypes,
  };
}

export async function buildCommunityContext(userId: string): Promise<CommunityContext> {
  const profile = await storage.getProfileByUserId(userId);
  
  // Buscar posts recentes da comunidade
  const recentPosts = await storage.getCommunityPosts(undefined, 10);
  
  // Contar interações do usuário (comentários e reações)
  // Nota: Em produção, seria melhor ter um método getCommentsByUserId
  // Por enquanto, vamos estimar baseado nos posts da comunidade
  let userInteractions = 0;
  
  // Extrair tópicos ativos (tags mais comuns)
  const allPosts = await storage.getCommunityPosts(undefined, 50);
  const tagCounts = new Map<string, number>();
  allPosts.forEach(post => {
    // Assumindo que posts têm tags ou podemos inferir de conteúdo
    // Por enquanto, vamos usar o tipo como tópico
    if (post.type) {
      tagCounts.set(post.type, (tagCounts.get(post.type) || 0) + 1);
    }
  });
  const activeTopics = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, AI.ACTIVE_TOPICS_COUNT)
    .map(([topic]) => topic);
  
  return {
    userStage: profile?.stage,
    userGoals: profile?.goals || [],
    recentPosts: recentPosts.slice(0, AI.RECENT_COMMUNITY_POSTS_COUNT).map(p => ({
      title: p.content.substring(0, 50) + (p.content.length > 50 ? "..." : ""),
      reactions: 0, // Seria necessário buscar reações
      comments: 0, // Seria necessário buscar comentários
    })),
    userInteractions,
    activeTopics,
  };
}

export async function buildContextForAgent(
  agentType: AgentType,
  userId: string
): Promise<ChatContext | HabitsContext | ContentContext | CommunityContext> {
  switch (agentType) {
    case "habits":
      return buildHabitsContext(userId);
    case "content":
      return buildContentContext(userId);
    case "community":
      return buildCommunityContext(userId);
    case "general":
    default:
      return buildGeneralContext(userId);
  }
}

