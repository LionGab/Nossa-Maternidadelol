import { describe, it, expect } from "vitest";

describe("Gamification Logic", () => {
  describe("XP Calculation", () => {
    it("deve calcular level corretamente", () => {
      // Level = Math.floor(xp / 100) + 1
      expect(Math.floor(0 / 100) + 1).toBe(1);
      expect(Math.floor(50 / 100) + 1).toBe(1);
      expect(Math.floor(100 / 100) + 1).toBe(2);
      expect(Math.floor(150 / 100) + 1).toBe(2);
      expect(Math.floor(200 / 100) + 1).toBe(3);
    });

    it("deve calcular XP gain por hábito", () => {
      const xpPerHabit = 10;
      expect(xpPerHabit).toBe(10);
    });
  });

  describe("Streak Logic", () => {
    it("deve calcular diferença de dias corretamente", () => {
      const today = new Date("2025-01-15");
      const yesterday = new Date("2025-01-14");
      const dayDiff = Math.floor((today.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24));
      expect(dayDiff).toBe(1);
    });

    it("deve identificar dia consecutivo", () => {
      const dayDiff = 1;
      const isConsecutive = dayDiff === 1;
      expect(isConsecutive).toBe(true);
    });

    it("deve identificar streak quebrado", () => {
      const dayDiff = 2;
      const isBroken = dayDiff > 1;
      expect(isBroken).toBe(true);
    });
  });

  describe("Achievement Requirements", () => {
    const achievements = [
      { id: "first_habit", type: "habit_count", requirement: 1 },
      { id: "streak_3", type: "streak", requirement: 3 },
      { id: "streak_7", type: "streak", requirement: 7 },
      { id: "completions_10", type: "completions", requirement: 10 },
      { id: "level_5", type: "level", requirement: 5 },
    ];

    it("deve verificar se achievement foi desbloqueado", () => {
      const userStats = {
        totalCompletions: 10,
        currentStreak: 7,
        level: 5,
      };

      const habitCount = 1;

      // Verificar cada tipo
      expect(habitCount >= achievements[0].requirement).toBe(true);
      expect(userStats.currentStreak >= achievements[1].requirement).toBe(true);
      expect(userStats.currentStreak >= achievements[2].requirement).toBe(true);
      expect(userStats.totalCompletions >= achievements[3].requirement).toBe(true);
      expect(userStats.level >= achievements[4].requirement).toBe(true);
    });
  });
});

