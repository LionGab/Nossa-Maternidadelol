# Arquitetura do Sistema

## Visão Geral

Nossa Maternidade é uma aplicação fullstack TypeScript organizada como monorepo com três diretórios principais:

- **`client/`** - Frontend React com Vite
- **`server/`** - Backend Express.js com TypeScript
- **`shared/`** - Tipos e schemas compartilhados (Zod + Drizzle)

## Backend Architecture

### Estrutura Modular

```
server/
├── index.ts              # Entry point do servidor
├── routes/               # Rotas modularizadas
│   ├── index.ts          # Registro central de rotas
│   ├── content.routes.ts # Posts, viral posts, favorites
│   ├── ai.routes.ts      # NathIA, MãeValente, agents
│   ├── habits.routes.ts  # Hábitos e gamificação
│   ├── community.routes.ts # RefúgioNath (posts, comments)
│   └── upload.routes.ts   # Upload de arquivos
├── services/             # Lógica de negócio
│   ├── habits.service.ts
│   ├── gamification.service.ts
│   ├── ai-session.service.ts
│   └── content.service.ts
├── middleware/           # Middlewares reutilizáveis
│   ├── ownership.middleware.ts
│   └── error.middleware.ts
├── storage/              # Camada de dados
│   ├── index.ts          # Factory (MemStorage/DrizzleStorage)
│   ├── types.ts          # Interface IStorage
│   ├── mem-storage.ts    # Implementação in-memory (dev)
│   └── drizzle-storage.ts # Implementação PostgreSQL (prod)
├── agents/               # Sistema de agentes AI
├── cache.ts             # Cache Redis/Memory
├── validation.ts        # Schemas Zod
├── rate-limit.ts        # Rate limiters
└── logger.ts            # Logging estruturado (Pino)
```

### Fluxo de Requisição

1. **Request** → Express middleware (helmet, cors, compression)
2. **Auth** → `requireAuth` middleware valida token Supabase
3. **Rate Limit** → Rate limiter específico por endpoint
4. **Validation** → Zod schema validation (body/query/params)
5. **Route Handler** → Chama service layer
6. **Service** → Lógica de negócio + storage operations
7. **Storage** → MemStorage (dev) ou DrizzleStorage (prod)
8. **Response** → JSON response ou error handler

### Services Layer

A camada de services encapsula lógica de negócio:

- **HabitsService**: Cálculo de streaks, stats, completions
- **GamificationService**: XP, levels, achievements
- **AISessionService**: Gerenciamento de sessões AI
- **ContentService**: Featured content, posts

### Storage Layer

Interface `IStorage` permite trocar implementações:

- **MemStorage**: Map-based, in-memory (desenvolvimento)
- **DrizzleStorage**: PostgreSQL via Drizzle ORM (produção)

## Frontend Architecture

### Estrutura

```
client/
├── src/
│   ├── pages/           # Páginas principais
│   ├── components/      # Componentes React
│   ├── lib/              # Utilitários
│   │   ├── queryClient.ts # React Query config
│   │   ├── auth.ts       # Autenticação
│   │   └── logger.ts     # Client-side logging
│   └── App.tsx           # Root component
├── public/
│   ├── sw.js            # Service Worker (PWA)
│   └── manifest.json    # PWA manifest
└── index.html
```

### State Management

- **TanStack Query**: Server state (cache, refetch, mutations)
- **React Hooks**: Local component state
- **localStorage**: Auth tokens, user preferences

### React Query Configuration

Configurações por tipo de dado:

- **static**: 30min staleTime (posts, conteúdo)
- **dynamic**: 1min staleTime (habits, stats)
- **realtime**: 0 staleTime, 2s refetchInterval (AI messages)

## Database Schema

Schema centralizado em `shared/schema.ts`:

- **Auth**: users, profiles, subscriptions
- **Content**: posts, viralPosts, tips, dailyFeatured
- **AI**: aiSessions, aiMessages, qaCache, savedQa
- **Habits**: habits, habitCompletions, userStats, achievements
- **Community**: communityPosts, comments, reactions, reports
- **Favorites**: favorites

## Caching Strategy

### Redis Cache (Produção)

- Q&A responses: 7 days TTL
- Habit completions: 1 hour TTL
- User stats: 30 minutes TTL

### Memory Cache (Desenvolvimento)

Fallback automático quando Redis não disponível.

## Security

- **Helmet**: Security headers
- **CORS**: Configurado por origem
- **Rate Limiting**: Por endpoint (AI: 10/min, Auth: 5/15min)
- **Zod Validation**: Todos os inputs validados
- **Supabase Auth**: JWT tokens, RLS policies

## Performance Optimizations

- **N+1 Query Fix**: Batch loading de completions
- **Pagination**: 20 items/page padrão, max 100
- **Code Splitting**: Vendor chunks + page chunks
- **Lazy Loading**: Páginas carregadas sob demanda
- **Cache**: Redis para dados frequentes

## Deployment

- **Vercel**: Frontend + Serverless Functions
- **Neon**: PostgreSQL (serverless)
- **Supabase**: Auth + Storage
- **Redis**: Upstash (opcional)

## Monitoring

- **Pino Logger**: Structured logging (JSON)
- **Prometheus Metrics**: HTTP metrics (opcional)
- **Error Tracking**: Sentry (planejado)
