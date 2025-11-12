import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DrizzleStorage } from "../../../server/storage";
import { db } from "../../../server/db";
import { users, profiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { hashPassword, verifyPassword } from "../../../server/auth";

describe("Auth Integration Tests", () => {
  const storage = new DrizzleStorage();
  let testUserId: string;
  const testEmail = `test-auth-${randomUUID()}@example.com`;
  const testPassword = "testPassword123";

  beforeAll(async () => {
    // Clean up
    testUserId = randomUUID();
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await db.delete(profiles).where(eq(profiles.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("User Registration", () => {
    it("deve criar usuário com senha hasheada", async () => {
      const passwordHash = await hashPassword(testPassword);
      const user = await storage.createUser({
        email: testEmail,
        passwordHash,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.passwordHash).not.toBe(testPassword);
      testUserId = user.id;
    });

    it("deve verificar senha correta", async () => {
      const user = await storage.getUserByEmail(testEmail);
      expect(user).toBeDefined();
      
      if (user) {
        const isValid = await verifyPassword(testPassword, user.passwordHash);
        expect(isValid).toBe(true);
      }
    });

    it("deve rejeitar senha incorreta", async () => {
      const user = await storage.getUserByEmail(testEmail);
      expect(user).toBeDefined();
      
      if (user) {
        const isValid = await verifyPassword("wrongPassword", user.passwordHash);
        expect(isValid).toBe(false);
      }
    });
  });

  describe("Profile Management", () => {
    it("deve criar perfil para usuário", async () => {
      const profile = await storage.createProfile({
        userId: testUserId,
        name: "Test User",
        stage: "pregnant",
        goals: ["exercício", "alimentação"],
      });

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(testUserId);
      expect(profile.name).toBe("Test User");
    });

    it("deve buscar perfil por userId", async () => {
      const profile = await storage.getProfileByUserId(testUserId);
      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(testUserId);
    });
  });
});

