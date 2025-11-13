import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gamificationService } from '../../server/services/gamification.service';
import { storage } from '../../server/storage';
import type { UserStats } from '@shared/schema';

vi.mock('../../server/storage', () => ({
  storage: {
    unlockAchievement: vi.fn(),
  },
}));

describe('GamificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateLevel', () => {
    it('should calculate level 1 for 0 XP', () => {
      expect(gamificationService.calculateLevel(0)).toBe(1);
    });

    it('should calculate level 2 for 100 XP', () => {
      expect(gamificationService.calculateLevel(100)).toBe(2);
    });

    it('should calculate level 5 for 400 XP', () => {
      expect(gamificationService.calculateLevel(400)).toBe(5);
    });
  });

  describe('checkAndUnlockAchievements', () => {
    it('should unlock streak_3 achievement', async () => {
      const stats: UserStats = {
        id: '1',
        userId: 'user1',
        xp: 0,
        level: 1,
        currentStreak: 3,
        longestStreak: 3,
        totalCompletions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(storage.unlockAchievement).mockResolvedValue({
        id: '1',
        userId: 'user1',
        achievementId: 'streak_3',
        unlockedAt: new Date(),
      });

      const unlocked = await gamificationService.checkAndUnlockAchievements('user1', stats);
      expect(unlocked).toContain('streak_3');
    });
  });
});
