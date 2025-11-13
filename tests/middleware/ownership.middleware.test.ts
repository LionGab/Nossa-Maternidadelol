import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { validateResourceOwnership } from '../../server/middleware/ownership.middleware';
import { storage } from '../../server/storage';
import type { Habit } from '@shared/schema';

vi.mock('../../server/storage', () => ({
  storage: {
    getHabit: vi.fn(),
  },
}));

describe('validateResourceOwnership', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      params: { habitId: 'habit1' },
      user: { id: 'user1', email: 'test@test.com', emailVerified: true },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  it('should allow access to own resource', async () => {
    const mockHabit: Habit = {
      id: 'habit1',
      userId: 'user1',
      title: 'Test',
      emoji: '✅',
      color: '#000',
      order: 1,
      createdAt: new Date(),
    };

    vi.mocked(storage.getHabit).mockResolvedValue(mockHabit);

    const middleware = validateResourceOwnership(storage.getHabit.bind(storage), 'habitId');
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should deny access to other user resource', async () => {
    const mockHabit: Habit = {
      id: 'habit1',
      userId: 'user2', // Different user
      title: 'Test',
      emoji: '✅',
      color: '#000',
      order: 1,
      createdAt: new Date(),
    };

    vi.mocked(storage.getHabit).mockResolvedValue(mockHabit);

    const middleware = validateResourceOwnership(storage.getHabit.bind(storage), 'habitId');
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
