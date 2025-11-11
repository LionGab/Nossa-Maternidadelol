# Nossa Maternidade / Mundo Nath

## Overview

Nossa Maternidade (also known as Mundo Nath) is a mobile-first maternal wellness application designed as a "refuge without judgment" for mothers and pregnant women. The app provides AI-powered support through NathIA (Gemini 2.0 Flash), curated content from influencer Nathália Valente, research-backed answers via Perplexity AI, and an addictive gamified habit tracking system inspired by world-class apps like Duolingo, Habitica, and Streaks. The platform operates on a subscription model (R$19.90/month) and targets Brazilian Portuguese-speaking mothers at various stages of their maternal journey.

The application features five core sections accessible via a bottom tab bar: Home (welcoming dashboard), NathIA (AI chat assistant), MundoNath (exclusive content from the influencer), MãeValente (research-based Q&A), and Hábitos (gamified habit tracking with XP, levels, streaks, and achievements). The design emphasizes maternal warmth with a minimalist aesthetic inspired by Claude.ai, using generous whitespace, serif typography for headings, and a soothing blue color palette (#6DA9E4, #DCEBFA, #FFF8F3) with pink accents (#FF8BA3).

## Recent Changes

**November 11, 2025 - Gamified Habit System Implementation**
- Completely redesigned Hábitos page with world-class gamification mechanics
- Implemented personalized habits with custom emojis and gradient colors
- Added comprehensive XP/level system with level-dependent progression (level * 100 formula)
- Integrated streak tracking with visual indicators
- Created 10 unlockable achievements system
- Added celebration animations and visual feedback for habit completions
- Implemented full CRUD API with automatic stats calculation and achievement unlocking
- All interactive elements equipped with data-testid attributes for automated testing
- System tested end-to-end with playwright verification

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**: React with TypeScript using Wouter for client-side routing. The application follows a mobile-first approach with responsive layouts optimized for touch interactions.

**State Management**: TanStack Query (React Query) for server state management with optimistic updates. No global state management library is used - component state and React Query cache serve as the primary state containers.

**UI Component System**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. Custom design tokens defined in `tailwind.config.ts` ensure consistent spacing, typography, and color usage. Components use the "new-york" style variant with custom border radius values and HSL-based color system for theme support.

**Styling Strategy**: Utility-first CSS with Tailwind, following design guidelines that specify serif fonts (Georgia) for headings and sans-serif (Open Sans, Inter, Quicksand) for body text. The design system uses a 4-based spacing scale (4, 6, 8, 12, 16, 20, 24 units) and implements light/dark mode theming through CSS custom properties.

**Design Tokens**: Custom color system using HSL values with alpha channel support, including distinct tokens for cards, popovers, sidebars, and button variants. Each color category includes foreground, background, and border variants for comprehensive theming.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running in ESM mode. The server handles API routes, serves the Vite-built frontend in production, and provides development middleware integration with Vite's HMR server.

**API Design**: RESTful API with route handlers organized in `server/routes.ts`. Endpoints follow a `/api/*` pattern for clear separation from frontend routes. The API supports session-based interactions for AI features and includes endpoints for content retrieval, habit tracking, favorites management, and Q&A caching.

**AI Integration Layer**: Modular AI service architecture with separate modules for different AI providers:
- **NathIA (Gemini 2.0 Flash)**: Primary conversational AI with custom system prompts emphasizing empathy and maternal support. Configured for low latency and cost-effectiveness with temperature 0.7 and 500 token limit.
- **Perplexity API**: Research-focused AI for the MãeValente feature using llama-3.1-sonar-small-128k-online model with citation support. Configured with temperature 0.2 for factual accuracy and limited to 800 tokens.

**Data Storage Strategy**: In-memory storage implementation (`server/storage.ts`) defining interfaces for profiles, subscriptions, posts, viral posts, tips, daily featured content, AI sessions/messages, Q&A cache, habits, habit completions, user stats, achievements, user achievements, and favorites. The storage layer is designed to be swapped for database implementations (Drizzle ORM schemas are defined but not actively used).

**Gamification System**: World-class habit tracking system inspired by Duolingo, Habitica, and Streaks, featuring:
- **XP & Levels**: Progressive leveling system where each level requires `level * 100` XP (e.g., Level 1→2 needs 100 XP, Level 2→3 needs 200 XP). Each habit completion awards +10 XP with visual feedback and celebration animations.
- **Streaks (Sequências)**: Daily streak tracking that increments when habits are completed on consecutive days. Streaks are preserved across habit sessions and reset after 24 hours of inactivity.
- **Achievements (Conquistas)**: 10 unlockable achievements that reward milestone behaviors (First Step, Consistent 7-day streak, Dedicated 30-day streak, Completionist 50 habits, Centurion 100 habits, Marathon 365 days, Power User 10+ habits, etc.). Achievements auto-unlock when conditions are met and display with celebratory UI.
- **Personalized Habits**: Users can create custom habits with unique emojis (⭐💪🧘‍♀️📚💧🌸🎯✨🔥💝🌿☀️) and gradient color schemes (Fogo, Roxo, Azul, Verde, Dourado, Rosa, Elétrico, Sunset).
- **Visual Feedback**: Completion animations, progress bars, badges, gradient backgrounds, and real-time stat updates create an addictive feedback loop designed to maximize user engagement and retention.

### External Dependencies

**Database**: Drizzle ORM configured for PostgreSQL via `@neondatabase/serverless` driver. Database schema defined in `shared/schema.ts` includes tables for profiles, subscriptions, posts, viral posts, tips, daily featured content, AI sessions, AI messages, Q&A cache, saved Q&As, habits, habit entries, and favorites. Row-Level Security (RLS) and pg_cron capabilities are mentioned in documentation but not implemented in code.

**AI Services**:
- **Google Gemini AI** (`@google/genai` v1.29.0): Chat completion API for NathIA assistant
- **Perplexity AI**: HTTP-based API integration for research queries with online search capabilities
- **Additional AI Keys Available**: Claude (Anthropic), OpenAI, and ElevenLabs API keys configured in environment variables but not actively integrated

**UI Component Libraries**:
- Radix UI primitives (20+ component packages) for accessible, unstyled UI components
- React Social Media Embed for TikTok and Instagram content display
- Embla Carousel for content carousels
- Recharts for data visualization

**Development Tools**:
- Vite as build tool and development server with React plugin
- TSX for TypeScript execution in development
- ESBuild for production server bundling
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal) for enhanced development experience

**Styling & Utilities**:
- Tailwind CSS with PostCSS and Autoprefixer
- Class Variance Authority (CVA) for component variant management
- CLSX and Tailwind Merge for conditional class composition
- Date-fns for date manipulation

**Form & Validation**:
- React Hook Form for form state management
- Zod for schema validation
- Drizzle-Zod for database schema-to-Zod conversion
- @hookform/resolvers for integrating validation libraries

**Session Management**: Connect-pg-simple for PostgreSQL session storage (configured but implementation details not visible in provided code)

**Build & Deployment**: Application builds to `dist/public` for frontend assets and `dist/index.js` for server bundle. Environment variables managed through `.env.local` with separate client-exposed (`EXPO_PUBLIC_*`) and server-only variables.