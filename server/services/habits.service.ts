/**
 * Habits Service - Business logic for habit management and gamification
 */

import { subDays } from "date-fns";
import { storage } from "../storage";
import { cache, CacheKeys, CacheTTL } from "../cache";
import { GAMIFICATION, TIME } from "../constants";
import type { Habit, HabitCompletion } from "@shared/schema";

export interface HabitWithStats extends Habit {
  completedToday: boolean;
  streak: number;
  entry?: {
    done: boolean;
    completedAt?: Date;
  };
}

export class HabitsService {
  /**
   * Calculate streak for a habit based on completion dates
   */
  calculateStreak(habitDates: Set<string>, today: string): number {
    let streak = 0;
    let checkDate = new Date(today);

    while (streak < GAMIFICATION.MAX_STREAK_DAYS) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (!habitDates.has(dateStr)) break;
      streak++;
      checkDate = subDays(checkDate, 1); // ✅ Immutable date manipulation
    }

    return streak;
  }

  /**
   * Get habits with completion stats and streaks
   */
  async getHabitsWithStats(userId: string): Promise<HabitWithStats[]> {
    const habits = await storage.getHabits(userId);
    if (habits.length === 0) return [];

    const today = new Date().toISOString().split("T")[0];
    const habitIds = habits.map((h) => h.id);

    // Optimize: fetch all completions in one query (last year)
    const startDate = subDays(new Date(), TIME.DAYS_PER_YEAR);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Check cache first
    const cacheKey = CacheKeys.habitCompletions(userId, startDateStr, today);
    let allCompletions = await cache.get<HabitCompletion[]>(cacheKey);

    if (!allCompletions) {
      allCompletions = await storage.getHabitCompletionsByHabitIds(
        habitIds,
        startDateStr,
        today
      );
      // Cache for 1 hour
      await cache.set(cacheKey, allCompletions, CacheTTL.HABIT_COMPLETIONS);
    }

    // Group completions by habitId and date for O(1) lookup
    const completionMap = new Map<string, Set<string>>();
    const completionByHabitAndDate = new Map<string, HabitCompletion>();
    
    for (const completion of allCompletions) {
      if (!completionMap.has(completion.habitId)) {
        completionMap.set(completion.habitId, new Set());
      }
      completionMap.get(completion.habitId)!.add(completion.date);
      
      // Index for O(1) lookup of completedAt
      const key = `${completion.habitId}-${completion.date}`;
      completionByHabitAndDate.set(key, completion);
    }

    // Calculate completion status and streaks efficiently
    const habitsWithCompletion = habits.map((habit) => {
      const habitDates = completionMap.get(habit.id) || new Set();
      const completedToday = habitDates.has(today);
      const streak = this.calculateStreak(habitDates, today);
      
      const key = `${habit.id}-${today}`;
      const todayCompletion = completionByHabitAndDate.get(key);

      return {
        ...habit,
        completedToday,
        streak,
        // Legacy support for old frontend
        entry: completedToday
          ? {
              done: true,
              completedAt: todayCompletion?.completedAt,
            }
          : undefined,
      };
    });

    return habitsWithCompletion;
  }

  /**
   * Get week stats for habits
   */
  async getWeekStats(userId: string): Promise<{ completed: number; total: number }> {
    const habits = await storage.getHabits(userId);
    if (habits.length === 0) {
      return { completed: 0, total: 0 };
    }

    const today = new Date();
    const startDate = subDays(today, TIME.HABIT_HISTORY_DAYS_OFFSET);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = today.toISOString().split("T")[0];
    const habitIds = habits.map((h) => h.id);

    // Batch load all completions for the week (1 query instead of 7*N)
    const completions = await storage.getHabitCompletionsByHabitIds(
      habitIds,
      startDateStr,
      endDateStr
    );

    const total = habits.length * 7;
    const completed = completions.length;

    return { completed, total };
  }

  /**
   * Create a new habit with order calculation
   */
  async createHabit(
    userId: string,
    data: { title: string; emoji: string; color: string }
  ): Promise<Habit> {
    const existingHabits = await storage.getHabits(userId);
    
    // Check max habits limit
    if (existingHabits.length >= GAMIFICATION.MAX_HABITS) {
      throw new Error(`Limite de ${GAMIFICATION.MAX_HABITS} hábitos atingido`);
    }
    
    const maxOrder = existingHabits.length > 0
      ? Math.max(...existingHabits.map((h) => h.order))
      : 0;

    return await storage.createHabit({
      userId,
      ...data,
      order: maxOrder + 1,
    });
  }

  /**
   * Invalidate habit-related caches
   */
  async invalidateHabitCaches(userId: string, today: string): Promise<void> {
    const startDate = subDays(new Date(), TIME.DAYS_PER_YEAR);
    const startDateStr = startDate.toISOString().split("T")[0];
    
    const cacheKey = CacheKeys.habitCompletions(userId, startDateStr, today);
    await cache.del(cacheKey);
    await cache.del(CacheKeys.userStats(userId));
  }
}

export const habitsService = new HabitsService();
