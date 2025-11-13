import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createHabitSchema,
  createCommunityPostSchema,
  nathiaChatSchema,
} from '../../server/validation';

describe('Validation Schemas', () => {
  describe('createHabitSchema', () => {
    it('should validate valid habit data', () => {
      const valid = {
        title: 'Test Habit',
        emoji: '✅',
        color: '#000000',
      };
      expect(() => createHabitSchema.parse(valid)).not.toThrow();
    });

    it('should reject missing title', () => {
      const invalid = {
        emoji: '✅',
        color: '#000000',
      };
      expect(() => createHabitSchema.parse(invalid)).toThrow();
    });
  });

  describe('createCommunityPostSchema', () => {
    it('should validate valid post data', () => {
      const valid = {
        type: 'question',
        content: 'Test content',
        tag: 'wellness',
      };
      expect(() => createCommunityPostSchema.parse(valid)).not.toThrow();
    });

    it('should reject invalid type', () => {
      const invalid = {
        type: 'invalid',
        content: 'Test',
      };
      expect(() => createCommunityPostSchema.parse(invalid)).toThrow();
    });
  });

  describe('nathiaChatSchema', () => {
    it('should validate valid chat data', () => {
      const valid = {
        sessionId: 'session1',
        message: 'Hello',
      };
      expect(() => nathiaChatSchema.parse(valid)).not.toThrow();
    });

    it('should reject missing message', () => {
      const invalid = {
        sessionId: 'session1',
      };
      expect(() => nathiaChatSchema.parse(invalid)).toThrow();
    });
  });
});
