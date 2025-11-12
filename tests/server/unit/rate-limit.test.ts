import { describe, it, expect } from "vitest";
import { aiChatLimiter, aiSearchLimiter, authLimiter, generalApiLimiter } from "../../../server/rate-limit";

describe("Rate Limiters", () => {
  describe("aiChatLimiter", () => {
    it("deve ser criado corretamente", () => {
      expect(aiChatLimiter).toBeDefined();
      expect(typeof aiChatLimiter).toBe("function");
    });
  });

  describe("aiSearchLimiter", () => {
    it("deve ser criado corretamente", () => {
      expect(aiSearchLimiter).toBeDefined();
      expect(typeof aiSearchLimiter).toBe("function");
    });
  });

  describe("authLimiter", () => {
    it("deve ser criado corretamente", () => {
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe("function");
    });
  });

  describe("generalApiLimiter", () => {
    it("deve ser criado corretamente", () => {
      expect(generalApiLimiter).toBeDefined();
      expect(typeof generalApiLimiter).toBe("function");
    });
  });
});

