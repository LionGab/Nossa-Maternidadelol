# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nossa Maternidade** is a digital wellness platform for mothers and pregnant women created by influencer Nathália Valente. The app provides a judgment-free space for maternal support through AI assistants, habit tracking, community features, and educational content.

## Commands

### Development
```bash
npm run dev          # Start dev server (frontend + backend) on localhost:5000
npm run build        # Build for production (Vite + esbuild)
npm start            # Run production build
npm run check        # TypeScript type checking (no emit)
```

### Database
```bash
npm run db:push      # Push schema changes to database (Drizzle Kit)
```

Note: This project uses Drizzle ORM with Neon PostgreSQL (serverless). Schema is defined in `shared/schema.ts`.

## Architecture

### Monorepo Structure

This is a **fullstack TypeScript monorepo** with three main directories:

- **`client/`** - React frontend with Vite
- **`server/`** - Express.js backend with TypeScript
- **`shared/`** - Shared types and schemas (Zod + Drizzle)

### Backend Architecture

**Entry Point:** `server/index.ts`
- Sets up Express with session middleware (express-session)
- Configures Passport.js for authentication (local strategy with scrypt password hashing)
- Registers routes in this order:
  1. Auth routes (`server/auth-routes.ts`)
  2. Application routes (`server/routes.ts`)
  3. Vite dev server (dev) or static files (production)

**Storage Layer:** `server/storage.ts`
- Currently uses **in-memory storage** with Maps for development
- Interface `IStorage` defines all data operations
- Designed to be swapped with a Drizzle-based implementation (see `server/db.ts`)

**Authentication:** `server/auth.ts`
- Passport.js with Local Strategy (email + password)
- Password hashing using Node.js `scrypt` with salt
- Session-based auth with `requireAuth` middleware for protected routes

**AI Integrations:**
- **NathIA (Chat Assistant):** `server/gemini.ts` - Uses Google Gemini 2.5 Flash via Replit AI Integrations
- **Mãe Valente (Search):** `server/perplexity.ts` - Uses Perplexity AI for mental health searches

### Frontend Architecture

**Router:** Wouter (lightweight React router)

**State Management:**
- TanStack Query (React Query) for server state
- React hooks for local state

**UI Components:**
- Built with **shadcn/ui** (Radix UI primitives)
- Styled with **Tailwind CSS**
- Path alias: `@/` → `client/src/`

**Pages:**
- `Home.tsx` - Dashboard with daily featured content
- `NathIA.tsx` - AI chat assistant (Gemini-powered)
- `MaeValente.tsx` - Perplexity-powered Q&A search
- `Habitos.tsx` - Gamified habit tracker with streaks/XP
- `MundoNath.tsx` - Educational content and viral social media posts
- `RefugioNath.tsx` - Community forum (posts, comments, reactions)

### Data Schema

**Database:** PostgreSQL (via Neon serverless)

**Schema Location:** `shared/schema.ts`
- All tables defined using Drizzle ORM (`drizzle-orm/pg-core`)
- Zod schemas generated with `drizzle-zod` for validation
- Schema includes 20+ tables organized by feature:
  - Auth: `users`, `profiles`, `subscriptions`
  - Content: `posts`, `viralPosts`, `tips`, `dailyFeatured`
  - AI: `aiSessions`, `aiMessages`, `qaCache`, `savedQa`
  - Habits: `habits`, `habitCompletions`, `userStats`, `achievements`, `userAchievements`
  - Social: `communityPosts`, `comments`, `reactions`, `reports`, `dailyQuestions`
  - Favorites: `favorites`

**Important Pattern:** Always import types from `@shared/schema` in both client and server code to maintain type safety across the stack.

### Protected Routes

Most API endpoints require authentication via `requireAuth` middleware. When adding new endpoints:
- Use `requireAuth` for user-specific operations
- Access user ID via `req.user!.id` (Passport populates this)
- Return 401 for unauthenticated requests

### Gamification System

The habit tracking system includes XP, levels, streaks, and achievements:
- Each habit completion = +10 XP
- Level calculation: `Math.floor(xp / 100) + 1`
- Streaks tracked in `userStats.currentStreak`
- Achievements unlock at specific thresholds (see `server/routes.ts:345-371`)

### API Response Patterns

**Success:** Return JSON data directly
```typescript
res.json({ data: result })
```

**Error:** Return error object with message
```typescript
res.status(400).json({ error: "Message" })
```

**Protected routes:** Check `req.user` for authentication state

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key (or Replit AI Integrations variables)
- `PERPLEXITY_API_KEY` - Perplexity API key
- `SESSION_SECRET` - Random secret for session encryption
- `NODE_ENV` - `development` or `production`

## TypeScript Configuration

- **Module System:** ESNext with bundler resolution
- **Strict Mode:** Enabled
- **Path Aliases:**
  - `@/*` → `client/src/*`
  - `@shared/*` → `shared/*`
  - `@assets/*` → `attached_assets/*` (images/resources)

## Key Development Notes

1. **In-Memory Storage:** The current `storage.ts` implementation is temporary. Data resets on server restart. Production should use the Drizzle ORM implementation with `server/db.ts`.

2. **AI Rate Limits:** Both Gemini and Perplexity APIs have rate limits. The Gemini integration includes retry logic and user-friendly error messages (see `server/gemini.ts:114-127`).

3. **Session Security:** Sessions are configured with secure cookies in production (HTTPS-only). Default secret is for dev only - always set `SESSION_SECRET` in production.

4. **Database Migrations:** Use `npm run db:push` to sync schema changes. For production, generate migrations with Drizzle Kit instead of using push.

5. **Windows Compatibility:** Server uses `localhost` instead of `0.0.0.0` on Windows and disables `reusePort` (see `server/index.ts:113-122`).

6. **Content Caching:** Q&A responses are cached for 7 days with MD5 hash keys to reduce API costs (see `server/routes.ts:158-183`).

## Recent Optimizations (2025-01-11)

### Security Improvements ✅
All critical security issues addressed. See `SECURITY_IMPROVEMENTS.md` for details.

1. **Rate Limiting** (`server/rate-limit.ts`)
   - AI Chat: 10 req/min (protects Gemini API costs)
   - AI Search: 5 req/min (protects Perplexity API costs)
   - Auth: 5 attempts/15min (prevents brute force)
   - Applied to 5 critical endpoints

2. **Input Validation** (`server/validation.ts`)
   - 8 Zod schemas for all user inputs
   - Prevents SQL injection, XSS, buffer overflow
   - 12 routes fully validated with `validateBody/Query/Params`

3. **Environment Validation** (`server/index.ts:34-45`)
   - Production startup fails if SESSION_SECRET < 32 chars
   - Validates DATABASE_URL presence

### Architecture Improvements ✅
See `OPTIMIZATION_REPORT.md` for detailed metrics.

1. **Structured Logging** (`server/logger.ts`)
   - Pino logger with JSON output (production) and pretty print (dev)
   - Request IDs for tracing
   - Auto-redaction of sensitive data (passwords, tokens, API keys)
   - Replaced 14 console.error/log calls
   - Usage: `logger.info({ msg, ...context })`, `logAICall()`, `logDbOperation()`

2. **N+1 Query Optimization** (`server/routes.ts:225`, `server/storage.ts:1177`)
   - Added `getHabitCompletionsByHabitIds()` for batch loading
   - Reduced 155 queries → 1 query for habits endpoint
   - 99.4% latency improvement (7.75s → 50ms)
   - Pattern: Batch load → Index with Map/Set → Compute in memory

3. **API Pagination** (`server/pagination.ts`)
   - Default: 20 items/page, max 100
   - 3 routes paginated: `/api/posts`, `/api/viral-posts`, `/api/community/posts`
   - Response format: `{ data: [...], meta: { page, limit, total, totalPages, hasNext, hasPrev } }`
   - 98% payload reduction (5MB → 100KB)
   - Query params: `?page=2&limit=50`

4. **Community Authentication Security** (`server/avatar.ts`, 2025-01-11)
   - **Problem**: Posts/comments allowed manual `authorName` input (identity spoofing)
   - **Solution**: Automatic profile linking with authenticated users
   - Added `avatarUrl` field to `communityPosts` and `comments` schemas
   - Created `generateAvatar()` utility using DiceBear API (free, deterministic avatars)
   - Routes now fetch `authorName` from user profile automatically
   - Validation schemas no longer accept `authorName` in request body
   - All 62 seed data instances updated with avatars
   - **Security**: Users can only post/comment as themselves
   - **UX**: Consistent, beautiful avatars for all users (Lorelei style - female-focused)

### Performance Metrics

| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| GET /api/habits (5 habits, 30d streak) | 7.75s | 50ms | 99.4% ⬇️ |
| GET /api/posts (1000 posts) | 5MB | 100KB | 98% ⬇️ |
| Structured logs | 0% | 100% | ∞ |

### Key Files to Know

- `server/logger.ts` - Centralized logging (always use instead of console.*)
- `server/rate-limit.ts` - Rate limiters (apply to expensive/sensitive routes)
- `server/validation.ts` - Zod schemas + validators (always validate user input)
- `server/pagination.ts` - Pagination utilities (use for list endpoints)

### Next Priorities

1. **Migrate to Drizzle ORM** - Replace MemStorage with real PostgreSQL
2. **Generate Migrations** - Use `drizzle-kit generate` for versioned schema changes
3. **Add Tests** - Vitest for unit tests (validation, business logic)
4. **Redis Cache** - Cache Q&A responses and habit completions
5. **Monitoring** - Prometheus metrics + Grafana dashboards
