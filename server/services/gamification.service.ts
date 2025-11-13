/**
 * Gamification Service - Business logic for XP, levels, streaks, and achievements
 */

import { storage } from "../storage";
import { ACHIEVEMENTS, GAMIFICATION } from "../constants";
import type { UserStats } from "@shared/schema";

export class GamificationService {
  /**
   * Calculate level from XP
   */
  calculateLevel(xp: number): number {
    return Math.floor(xp / GAMIFICATION.XP_PER_LEVEL) + 1;
  }

  /**
   * Achievement check configuration
   */
  private readonly achievementChecks: Array<{
    check: (stats: UserStats) => boolean;
    achievementId: string;
  }> = [
    {
      check: (stats) => stats.currentStreak === ACHIEVEMENTS.THRESHOLDS.STREAK_3,
      achievementId: ACHIEVEMENTS.STREAK_3,
    },
    {
      check: (stats) => stats.currentStreak === ACHIEVEMENTS.THRESHOLDS.STREAK_7,
      achievementId: ACHIEVEMENTS.STREAK_7,
    },
    {
      check: (stats) => stats.currentStreak === ACHIEVEMENTS.THRESHOLDS.STREAK_30,
      achievementId: ACHIEVEMENTS.STREAK_30,
    },
    {
      check: (stats) => stats.totalCompletions === ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_10,
      achievementId: ACHIEVEMENTS.COMPLETIONS_10,
    },
    {
      check: (stats) => stats.totalCompletions === ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_50,
      achievementId: ACHIEVEMENTS.COMPLETIONS_50,
    },
    {
      check: (stats) => stats.totalCompletions === ACHIEVEMENTS.THRESHOLDS.COMPLETIONS_100,
      achievementId: ACHIEVEMENTS.COMPLETIONS_100,
    },
    {
      check: (stats) => stats.level === ACHIEVEMENTS.THRESHOLDS.LEVEL_5,
      achievementId: ACHIEVEMENTS.LEVEL_5,
    },
    {
      check: (stats) => stats.level === ACHIEVEMENTS.THRESHOLDS.LEVEL_10,
      achievementId: ACHIEVEMENTS.LEVEL_10,
    },
  ];

  /**
   * Check and unlock achievements based on user stats
   */
  async checkAndUnlockAchievements(
    userId: string,
    stats: UserStats
  ): Promise<string[]> {
    const unlocked: string[] = [];

    for (const { check, achievementId } of this.achievementChecks) {
      if (check(stats)) {
        const result = await storage.unlockAchievement(userId, achievementId);
        if (result) {
          unlocked.push(achievementId);
        }
      }
    }

    return unlocked;
  }

  /**
   * Check habit count achievements
   */
  async checkHabitCountAchievements(
    userId: string,
    habitCount: number
  ): Promise<string[]> {
    const unlocked: string[] = [];

    if (habitCount === ACHIEVEMENTS.THRESHOLDS.HABIT_COUNT_1) {
      const result = await storage.unlockAchievement(userId, ACHIEVEMENTS.HABIT_COUNT_1);
      if (result) unlocked.push(ACHIEVEMENTS.HABIT_COUNT_1);
    } else if (habitCount === ACHIEVEMENTS.THRESHOLDS.HABIT_COUNT_5) {
      const result = await storage.unlockAchievement(userId, ACHIEVEMENTS.HABIT_COUNT_5);
      if (result) unlocked.push(ACHIEVEMENTS.HABIT_COUNT_5);
    }

    return unlocked;
  }
}

export const gamificationService = new GamificationService();
