/**
 * Global test setup
 * This file runs before all tests
 */

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret-key-for-testing-only-min-32-chars";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";

// Suppress console logs in tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   log: vi.fn(),
//   error: vi.fn(),
//   warn: vi.fn(),
// };

