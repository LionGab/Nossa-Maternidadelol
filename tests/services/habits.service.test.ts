import { describe, it, expect, beforeEach, vi } from 'vitest';
import { habitsService } from '../../server/services/habits.service';
import { storage } from '../../server/storage';
import type { Habit, HabitCompletion } from '@shared/schema';

// Mock storage
vi.mock('../../server/storage', () => ({
  storage: {
    getHabits: vi.fn(),
    getHabitCompletionsByHabitIds: vi.fn(),
  },
}));

describe('HabitsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateStreak', () => {
    it('should calculate streak correctly for consecutive days', () => {
      const habitDates = new Set(['2024-01-01', '2024-01-02', '2024-01-03']);
      const today = '2024-01-03';
      const streak = habitsService.calculateStreak(habitDates, today);
      expect(streak).toBe(3);
    });

    it('should return 0 for no completions', () => {
      const habitDates = new Set();
      const today = '2024-01-03';
      const streak = habitsService.calculateStreak(habitDates, today);
      expect(streak).toBe(0);
    });
  });

  describe('getHabitsWithStats', () => {
    it('should return habits with completion stats', async () => {
      const mockHabits: Habit[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Test Habit',
          emoji: '✅',
          color: '#000',
          order: 1,
          createdAt: new Date(),
        },
      ];

      const mockCompletions: HabitCompletion[] = [
        {
          id: '1',
          habitId: '1',
          userId: 'user1',
          date: '2024-01-03',
          completedAt: new Date(),
        },
      ];

      vi.mocked(storage.getHabits).mockResolvedValue(mockHabits);
      vi.mocked(storage.getHabitCompletionsByHabitIds).mockResolvedValue(mockCompletions);

      const result = await habitsService.getHabitsWithStats('user1');
      expect(result).toHaveLength(1);
      expect(result[0].completedToday).toBe(true);
      expect(result[0].streak).toBeGreaterThan(0);
    });
  });
});
