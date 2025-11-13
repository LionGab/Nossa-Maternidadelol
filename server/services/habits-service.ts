/**
 * HabitsService - Lógica de negócio para hábitos e gamification
 * Extrai complexidade das rotas para facilitar testes e reutilização
 */

import { storage } from "../storage";
import { GAMIFICATION, ACHIEVEMENTS, TIME } from "../constants";
import type { Habit, HabitCompletion, UserStats, UserAchievement } from "@shared/schema";

export interface HabitWithCompletion extends Habit {
  completedToday: boolean;
  streak: number;
}

export class HabitsService {
  /**
   * Calcula streak de um hábito baseado em datas de completion
   * Algoritmo: Conta dias consecutivos de trás para frente a partir de hoje
   */
  calculateStreak(completionDates: Set<string>): number {
    const today = new Date().toISOString().split("T")[0];
    let streak = 0;
    let checkDate = new Date(today);

    while (streak < GAMIFICATION.MAX_STREAK_DAYS) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (!completionDates.has(dateStr)) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Busca hábitos com informações de completion otimizado
   * Evita N+1 queries carregando tudo de uma vez
   */
  async getHabitsWithCompletionInfo(userId: string): Promise<HabitWithCompletion[]> {
    const habits = await storage.getHabits(userId);
    if (habits.length === 0) return [];

    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - GAMIFICATION.MAX_STREAK_DAYS);
    const startDateStr = startDate.toISOString().split("T")[0];

    const habitIds = habits.map(h => h.id);
    const allCompletions = await storage.getHabitCompletionsByHabitIds(
      habitIds,
      startDateStr,
      today
    );

    // Indexar completions por habitId
    const completionMap = new Map<string, Set<string>>();
    for (const completion of allCompletions) {
      if (!completionMap.has(completion.habitId)) {
        completionMap.set(completion.habitId, new Set());
      }
      completionMap.get(completion.habitId)!.add(completion.date);
    }

    // Calcular streaks e status
    return habits.map(habit => ({
      ...habit,
      completedToday: completionMap.get(habit.id)?.has(today) ?? false,
      streak: this.calculateStreak(completionMap.get(habit.id) || new Set()),
    }));
  }

  /**
   * Calcula XP e nível do usuário
   */
  calculateLevel(xp: number): number {
    return Math.floor(xp / GAMIFICATION.XP_PER_LEVEL) + 1;
  }

  /**
   * Calcula XP necessário para o próximo nível
   */
  calculateXpForNextLevel(currentXp: number): number {
    const currentLevel = this.calculateLevel(currentXp);
    return currentLevel * GAMIFICATION.XP_PER_LEVEL - currentXp;
  }

  /**
   * Verifica e desbloqueia achievements baseado em stats
   */
  async checkAndUnlockAchievements(
    userId: string,
    stats: UserStats,
    totalCompletions: number
  ): Promise<UserAchievement[]> {
    const unlockedAchievements: UserAchievement[] = [];

    // Buscar achievements existentes do usuário
    const existingAchievements = await storage.getUserAchievements(userId);
    const existingIds = new Set(existingAchievements.map(a => a.achievementId));

    // Buscar todos achievements disponíveis
    const allAchievements = await storage.getAchievements();

    // Check cada achievement
    for (const achievement of allAchievements) {
      // Pular se já desbloqueado
      if (existingIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      // Verificar condições baseado no tipo
      if (achievement.id === ACHIEVEMENTS.STREAK_3 && stats.currentStreak >= ACHIEVEMENTS.THRESHOLDS.STREAK_3) {
        shouldUnlock = true;
      } else if (achievement.id === ACHIEVEMENTS.STREAK_7 && stats.currentStreak >= ACHIEVEMENTS.THRESHOLDS.STREAK_7) {
        shouldUnlock = true;
      } else if (achievement.id === ACHIEVEMENTS.STREAK_30 && stats.currentStreak >= ACHIEVEMENTS.THRESHOLDS.STREAK_30) {
        shouldUnlock = true;
      } else if (achievement.id === ACHIEVEMENTS.COMPLETIONS_10 && totalCompletions >= ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_10) {
        shouldUnlock = true;
      } else if (achievement.id === ACHIEVEMENTS.COMPLETIONS_50 && totalCompletions >= ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_50) {
        shouldUnlock = true;
      } else if (achievement.id === ACHIEVEMENTS.COMPLETIONS_100 && totalCompletions >= ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_100) {
        shouldUnlock = true;
      } else if (achievement.id === ACHIEVEMENTS.LEVEL_5 && this.calculateLevel(stats.xp) >= ACHIEVEMENTS.THRESHOLDS.LEVEL_5) {
        shouldUnlock = true;
      } else if (achievement.id === ACHIEVEMENTS.LEVEL_10 && this.calculateLevel(stats.xp) >= ACHIEVEMENTS.THRESHOLDS.LEVEL_10) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        const userAchievement = await storage.unlockAchievement(userId, achievement.id);
        if (userAchievement) {
          unlockedAchievements.push(userAchievement);
        }
      }
    }

    return unlockedAchievements;
  }

  /**
   * Calcula taxa de completude dos últimos 7 dias
   */
  calculateCompletionRate(completions: HabitCompletion[], totalHabits: number): number {
    if (totalHabits === 0) return 0;

    const last7Days = new Set<string>();
    const today = new Date();

    for (let i = 0; i < TIME.COMPLETION_RATE_DAYS; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.add(date.toISOString().split("T")[0]);
    }

    const completionsLast7Days = completions.filter(c => last7Days.has(c.date));
    const maxPossible = totalHabits * TIME.COMPLETION_RATE_DAYS;

    return maxPossible > 0 ? Math.round((completionsLast7Days.length / maxPossible) * 100) : 0;
  }
}

// Singleton export
export const habitsService = new HabitsService();
