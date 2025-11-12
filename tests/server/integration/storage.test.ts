import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DrizzleStorage } from "../../../server/storage";
import { db } from "../../../server/db";
import {
  users, profiles, habits, habitCompletions, userStats,
  achievements, userAchievements,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

describe("DrizzleStorage Integration Tests", () => {
  const storage = new DrizzleStorage();
  let testUserId: string;
  let testHabitId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    testUserId = randomUUID();
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await db.delete(habitCompletions).where(eq(habitCompletions.userId, testUserId));
      await db.delete(habits).where(eq(habits.userId, testUserId));
      await db.delete(userStats).where(eq(userStats.userId, testUserId));
      await db.delete(userAchievements).where(eq(userAchievements.userId, testUserId));
      await db.delete(profiles).where(eq(profiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("User Management", () => {
    it("deve criar um usuário", async () => {
      const user = await storage.createUser({
        email: `test-${testUserId}@example.com`,
        passwordHash: "hashed_password",
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(`test-${testUserId}@example.com`);
      testUserId = user.id;
    });

    it("deve buscar usuário por ID", async () => {
      const user = await storage.getUser(testUserId);
      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);
    });

    it("deve buscar usuário por email", async () => {
      const user = await storage.getUserByEmail(`test-${testUserId}@example.com`);
      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);
    });

    it("deve atualizar lastLogin", async () => {
      await storage.updateUserLastLogin(testUserId);
      const user = await storage.getUser(testUserId);
      expect(user?.lastLoginAt).toBeDefined();
    });
  });

  describe("Habits", () => {
    it("deve criar um hábito", async () => {
      const habit = await storage.createHabit({
        userId: testUserId,
        title: "Beber água",
        emoji: "💧",
        color: "from-blue-500 to-cyan-500",
        order: 1,
      });

      expect(habit).toBeDefined();
      expect(habit.title).toBe("Beber água");
      expect(habit.userId).toBe(testUserId);
      testHabitId = habit.id;
    });

    it("deve buscar hábitos do usuário", async () => {
      const habits = await storage.getHabits(testUserId);
      expect(habits.length).toBeGreaterThan(0);
      expect(habits[0].id).toBe(testHabitId);
    });

    it("deve buscar hábito por ID", async () => {
      const habit = await storage.getHabit(testHabitId);
      expect(habit).toBeDefined();
      expect(habit?.id).toBe(testHabitId);
    });

    it("deve atualizar ordem do hábito", async () => {
      await storage.updateHabitOrder(testHabitId, 2);
      const habit = await storage.getHabit(testHabitId);
      expect(habit?.order).toBe(2);
    });
  });

  describe("Habit Completions", () => {
    it("deve criar completion", async () => {
      const today = new Date().toISOString().split("T")[0];
      const completion = await storage.createHabitCompletion({
        habitId: testHabitId,
        userId: testUserId,
        date: today,
      });

      expect(completion).toBeDefined();
      expect(completion.habitId).toBe(testHabitId);
      expect(completion.date).toBe(today);
    });

    it("deve buscar completion por habitId e date", async () => {
      const today = new Date().toISOString().split("T")[0];
      const completion = await storage.getHabitCompletion(testHabitId, today);
      expect(completion).toBeDefined();
      expect(completion?.date).toBe(today);
    });

    it("deve buscar completions por range de datas", async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      
      const completions = await storage.getHabitCompletions(
        testUserId,
        startDate.toISOString().split("T")[0],
        today.toISOString().split("T")[0]
      );

      expect(completions.length).toBeGreaterThan(0);
    });

    it("deve buscar completions por múltiplos habitIds (batch)", async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      
      const completions = await storage.getHabitCompletionsByHabitIds(
        [testHabitId],
        startDate.toISOString().split("T")[0],
        today.toISOString().split("T")[0]
      );

      expect(completions.length).toBeGreaterThan(0);
    });
  });

  describe("User Stats (Gamification)", () => {
    it("deve criar stats iniciais", async () => {
      const stats = await storage.createOrUpdateUserStats(testUserId, 10, true);
      expect(stats).toBeDefined();
      expect(stats.xp).toBe(10);
      expect(stats.level).toBe(1);
      expect(stats.totalCompletions).toBe(1);
    });

    it("deve atualizar stats existentes", async () => {
      const stats = await storage.createOrUpdateUserStats(testUserId, 10, true);
      expect(stats.xp).toBe(20);
      expect(stats.totalCompletions).toBe(2);
    });

    it("deve atualizar streak", async () => {
      const today = new Date().toISOString().split("T")[0];
      const stats = await storage.updateStreak(testUserId, today);
      expect(stats.currentStreak).toBeGreaterThan(0);
    });

    it("deve buscar stats do usuário", async () => {
      const stats = await storage.getUserStats(testUserId);
      expect(stats).toBeDefined();
      expect(stats?.userId).toBe(testUserId);
    });
  });

  describe("Achievements", () => {
    it("deve buscar achievements disponíveis", async () => {
      const achievements = await storage.getAchievements();
      expect(achievements.length).toBeGreaterThan(0);
    });

    it("deve desbloquear achievement", async () => {
      const achievements = await storage.getAchievements();
      if (achievements.length > 0) {
        const unlocked = await storage.unlockAchievement(testUserId, achievements[0].id);
        expect(unlocked).toBeDefined();
        expect(unlocked?.achievementId).toBe(achievements[0].id);
      }
    });

    it("não deve desbloquear achievement já desbloqueado", async () => {
      const achievements = await storage.getAchievements();
      if (achievements.length > 0) {
        const unlocked = await storage.unlockAchievement(testUserId, achievements[0].id);
        expect(unlocked).toBeNull();
      }
    });

    it("deve buscar achievements do usuário", async () => {
      const userAchievements = await storage.getUserAchievements(testUserId);
      expect(userAchievements.length).toBeGreaterThan(0);
    });
  });
});

