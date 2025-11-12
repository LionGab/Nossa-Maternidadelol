# 🎯 Plano de Ação Completo - Nossa Maternidade
## Revisão e Otimização Integral do Monorepo

**Data:** 2025-01-11  
**Status:** 📋 Aguardando Validação  
**Prioridade:** 🔴 Crítico | 🟡 Médio | 🟢 Baixo

---

## 📊 Resumo Executivo

### Estado Atual
- ✅ **Já Implementado:** Logging estruturado, rate limiting, validação Zod, paginação, otimização N+1 queries
- ⚠️ **Necessita Melhoria:** Arquitetura modular, testes, performance frontend, segurança adicional
- ❌ **Faltando:** CI/CD completo, documentação de APIs, monitoramento, cache Redis

### Métricas Identificadas
- **Arquivos:** ~120 arquivos TypeScript
- **Linhas de código:** ~15.000+ linhas
- **Dependências:** 106 packages (29 dev)
- **Cobertura de testes:** ~7 arquivos de teste (insuficiente)
- **Type safety:** 4 ocorrências de `any` em routes.ts
- **Console.log:** 18 ocorrências (client: 17, server: 1)

---

## 🗂️ CATEGORIA 1: LIMPEZA E ORGANIZAÇÃO

### 1.1 Remover Arquivos Supérfluos e Build Artifacts

**Severidade:** 🟡 Médio  
**Impacto:** Reduz tamanho do repositório, acelera clones

#### Arquivos para Remover:
```bash
# Build artifacts
dist/
node_modules/.vite/
*.tsbuildinfo
*.log

# OS files
.DS_Store
Thumbs.db
*.swp
*.swo
*~

# IDE files (se não versionados)
.vscode/settings.json (se não compartilhado)
.idea/
*.iml
```

#### Comandos:
```bash
# Criar .gitignore completo se não existir
cat >> .gitignore << 'EOF'
# Build outputs
dist/
build/
*.tsbuildinfo
node_modules/.vite/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db
*.swp
*.swo
*~

# Environment
.env.local
.env.*.local
EOF

# Limpar arquivos existentes
find . -name "*.tsbuildinfo" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete
rm -rf dist/ node_modules/.vite/
```

#### Script de Limpeza Automática:
```json
// package.json - adicionar script
{
  "scripts": {
    "clean": "rm -rf dist node_modules/.vite *.tsbuildinfo",
    "clean:all": "npm run clean && rm -rf node_modules/.cache .turbo",
    "prebuild": "npm run clean"
  }
}
```

---

### 1.2 Analisar e Remover Dependências Não Utilizadas

**Severidade:** 🟡 Médio  
**Impacto:** Reduz bundle size, acelera instalação

#### Dependências Suspeitas (verificar uso):
```bash
# Verificar dependências não utilizadas
npx depcheck

# Verificar tamanho de dependências
npx bundle-phobia [package-name]

# Dependências para investigar:
# - @supabase/supabase-js (usado apenas em client?)
# - memorystore (usado?)
# - multer (usado?)
# - ws (usado?)
```

#### Comandos:
```bash
# Instalar depcheck
npm install --save-dev depcheck

# Rodar análise
npx depcheck --ignores="@types/*,esbuild,tsx,vite"

# Remover dependências não utilizadas (APÓS VALIDAÇÃO)
# npm uninstall [package-name]
```

---

### 1.3 Organizar Estrutura de Pastas

**Severidade:** 🟢 Baixo  
**Impacto:** Melhora manutenibilidade

#### Estrutura Proposta:
```
server/
├── routes/              # Dividir routes.ts em módulos
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── habits.routes.ts
│   ├── community.routes.ts
│   ├── ai.routes.ts
│   └── content.routes.ts
├── services/            # Lógica de negócio
│   ├── habits.service.ts
│   ├── gamification.service.ts
│   └── ai.service.ts
├── middleware/          # Middlewares reutilizáveis
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
└── utils/               # Utilitários
    ├── date.utils.ts
    ├── crypto.utils.ts
    └── cache.utils.ts
```

---

## 🏗️ CATEGORIA 2: ARQUITETURA E MODULARIZAÇÃO

### 2.1 Refatorar `server/routes.ts` (945 linhas → módulos)

**Severidade:** 🔴 Crítico  
**Impacto:** Manutenibilidade, testabilidade, escalabilidade

#### Problema Atual:
- Arquivo único com 945+ linhas
- Múltiplas responsabilidades misturadas
- Difícil de testar isoladamente
- Conflitos em PRs

#### Solução: Dividir em Módulos

**Estrutura:**
```typescript
// server/routes/index.ts
import { Express } from "express";
import { registerAuthRoutes } from "./auth.routes";
import { registerHabitsRoutes } from "./habits.routes";
import { registerCommunityRoutes } from "./community.routes";
import { registerAIRoutes } from "./ai.routes";
import { registerContentRoutes } from "./content.routes";

export function registerRoutes(app: Express): void {
  registerAuthRoutes(app);
  registerHabitsRoutes(app);
  registerCommunityRoutes(app);
  registerAIRoutes(app);
  registerContentRoutes(app);
}
```

**Exemplo: `server/routes/habits.routes.ts`**
```typescript
import { Express } from "express";
import { requireAuth } from "../auth";
import { validateBody, createHabitSchema, habitIdParamSchema } from "../validation";
import { habitsService } from "../services/habits.service";
import { logger } from "../logger";

export function registerHabitsRoutes(app: Express): void {
  // GET /api/habits
  app.get("/api/habits", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const habits = await habitsService.getHabitsWithStats(userId);
      res.json(habits);
    } catch (error) {
      logger.error({ err: error, msg: "Error fetching habits" });
      res.status(500).json({ error: "Erro ao carregar hábitos" });
    }
  });

  // POST /api/habits
  app.post("/api/habits", requireAuth, validateBody(createHabitSchema), async (req, res) => {
    try {
      const userId = req.user!.id;
      const habit = await habitsService.createHabit(userId, req.body);
      res.json(habit);
    } catch (error) {
      logger.error({ err: error, msg: "Error creating habit" });
      res.status(500).json({ error: "Erro ao criar hábito" });
    }
  });

  // ... outros endpoints
}
```

**Exemplo: `server/services/habits.service.ts`**
```typescript
import { storage } from "../storage";
import { cache, CacheKeys, CacheTTL } from "../cache";
import { GAMIFICATION, TIME } from "../constants";
import type { Habit, HabitCompletion } from "@shared/schema";

export class HabitsService {
  async getHabitsWithStats(userId: string) {
    const habits = await storage.getHabits(userId);
    if (habits.length === 0) return [];

    const today = new Date().toISOString().split("T")[0];
    const habitIds = habits.map((h) => h.id);

    // Cache check
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - TIME.DAYS_PER_YEAR);
    const startDateStr = startDate.toISOString().split("T")[0];
    const cacheKey = CacheKeys.habitCompletions(userId, startDateStr, today);
    
    let allCompletions = await cache.get<HabitCompletion[]>(cacheKey);
    if (!allCompletions) {
      allCompletions = await storage.getHabitCompletionsByHabitIds(
        habitIds,
        startDateStr,
        today
      );
      await cache.set(cacheKey, allCompletions, CacheTTL.HABIT_COMPLETIONS);
    }

    // Index completions
    const completionMap = new Map<string, Set<string>>();
    for (const completion of allCompletions) {
      if (!completionMap.has(completion.habitId)) {
        completionMap.set(completion.habitId, new Set());
      }
      completionMap.get(completion.habitId)!.add(completion.date);
    }

    // Calculate stats
    return habits.map((habit) => {
      const habitDates = completionMap.get(habit.id) || new Set();
      const completedToday = habitDates.has(today);
      
      let streak = 0;
      let checkDate = new Date(today);
      while (streak < GAMIFICATION.MAX_STREAK_DAYS) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (!habitDates.has(dateStr)) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      return { ...habit, completedToday, streak };
    });
  }

  async createHabit(userId: string, data: { title: string; emoji: string; color: string }) {
    // Validação de limite
    const existingHabits = await storage.getHabits(userId);
    if (existingHabits.length >= GAMIFICATION.MAX_HABITS) {
      throw new Error(`Limite de ${GAMIFICATION.MAX_HABITS} hábitos atingido`);
    }

    return await storage.createHabit({
      userId,
      ...data,
    });
  }
}

export const habitsService = new HabitsService();
```

#### Plano de Migração:
1. Criar estrutura de pastas `routes/` e `services/`
2. Extrair lógica de negócio para services
3. Dividir routes.ts em módulos por domínio
4. Manter compatibilidade durante migração
5. Remover routes.ts original após validação

---

### 2.2 Extrair Lógica Duplicada

**Severidade:** 🟡 Médio  
**Impacto:** Reduz bugs, facilita manutenção

#### Padrões Duplicados Identificados:

**1. Tratamento de Erros:**
```typescript
// ANTES (repetido 20+ vezes)
catch (error) {
  logger.error({ err: error, msg: "Error..." });
  res.status(500).json({ error: "Erro..." });
}

// DEPOIS (middleware centralizado)
// server/middleware/error.middleware.ts
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  logger.error({
    err,
    path: req.path,
    method: req.method,
    status,
    msg: "Request error",
  });
  
  res.status(status).json({ 
    error: status >= 500 ? "Erro interno do servidor" : message 
  });
}
```

**2. Validação de Ownership:**
```typescript
// ANTES (repetido)
if (session.userId !== userId) {
  return res.status(403).json({ error: "Não autorizado" });
}

// DEPOIS (middleware reutilizável)
// server/middleware/ownership.middleware.ts
export function validateOwnership<T extends { userId: string }>(
  getResource: (id: string) => Promise<T | null>
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const resourceId = req.params.id || req.params.sessionId || req.params.habitId;
    const resource = await getResource(resourceId);
    
    if (!resource) {
      return res.status(404).json({ error: "Recurso não encontrado" });
    }
    
    if (resource.userId !== req.user.id) {
      return res.status(403).json({ error: "Não autorizado" });
    }
    
    req.resource = resource;
    next();
  };
}
```

**3. Cache Pattern:**
```typescript
// ANTES (repetido)
const cacheKey = CacheKeys.xxx(...);
let data = await cache.get<T>(cacheKey);
if (!data) {
  data = await fetchData();
  await cache.set(cacheKey, data, CacheTTL.XXX);
}

// DEPOIS (helper)
// server/utils/cache.utils.ts
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await cache.get<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  await cache.set(key, data, ttl);
  return data;
}

// Uso:
const data = await withCache(
  CacheKeys.userStats(userId),
  () => storage.getUserStats(userId),
  CacheTTL.USER_STATS
);
```

---

### 2.3 Criar Camada de Serviços (Services Layer)

**Severidade:** 🔴 Crítico  
**Impacto:** Separação de responsabilidades, testabilidade

#### Estrutura Proposta:
```
server/services/
├── index.ts
├── habits.service.ts
├── gamification.service.ts
├── ai.service.ts
├── community.service.ts
└── content.service.ts
```

#### Exemplo: `server/services/gamification.service.ts`
```typescript
import { storage } from "../storage";
import { ACHIEVEMENTS, GAMIFICATION } from "../constants";
import type { UserStats, Achievement } from "@shared/schema";

export class GamificationService {
  /**
   * Calcula XP e nível do usuário
   */
  calculateLevel(xp: number): number {
    return Math.floor(xp / GAMIFICATION.XP_PER_LEVEL) + 1;
  }

  /**
   * Adiciona XP por completar hábito
   */
  async addXPForCompletion(userId: string): Promise<void> {
    const stats = await storage.getUserStats(userId);
    const newXP = stats.xp + GAMIFICATION.XP_PER_COMPLETION;
    const newLevel = this.calculateLevel(newXP);
    
    await storage.updateUserStats(userId, {
      xp: newXP,
      level: newLevel,
    });

    // Verificar achievements
    await this.checkAchievements(userId, newXP, stats.level, newLevel);
  }

  /**
   * Verifica e desbloqueia achievements
   */
  async checkAchievements(
    userId: string,
    xp: number,
    oldLevel: number,
    newLevel: number
  ): Promise<Achievement[]> {
    const unlocked: Achievement[] = [];
    const userAchievements = await storage.getUserAchievements(userId);
    const achievedIds = new Set(userAchievements.map((a) => a.achievementId));

    // Level achievements
    if (newLevel >= ACHIEVEMENTS.THRESHOLDS.LEVEL_5 && oldLevel < 5) {
      if (!achievedIds.has(ACHIEVEMENTS.LEVEL_5)) {
        await storage.createUserAchievement(userId, ACHIEVEMENTS.LEVEL_5);
        unlocked.push(await storage.getAchievement(ACHIEVEMENTS.LEVEL_5));
      }
    }
    // ... outros checks

    return unlocked;
  }
}

export const gamificationService = new GamificationService();
```

---

## ⚡ CATEGORIA 3: PERFORMANCE E OTIMIZAÇÃO

### 3.1 Otimizar React Query (Frontend)

**Severidade:** 🟡 Médio  
**Impacto:** Reduz requisições desnecessárias, melhora UX

#### Problema Atual:
```typescript
// client/src/lib/queryClient.ts
staleTime: Infinity,  // ❌ Nunca refaz requisição
refetchOnWindowFocus: false,
retry: false,
```

#### Solução: Configuração Inteligente por Tipo de Dado

```typescript
// client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: enhancedQueryFn,
      retry: (failureCount, error: any) => {
        // Não retry em erros 4xx (client errors)
        if (error?.message?.startsWith('4')) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos padrão
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
    },
  },
});

// Configurações específicas por query
export const queryConfigs = {
  // Dados que mudam raramente (posts, conteúdo)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  
  // Dados que mudam frequentemente (habits, stats)
  dynamic: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  
  // Dados em tempo real (mensagens AI)
  realtime: {
    staleTime: 0,
    refetchInterval: 2000, // 2 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  },
};

// Uso:
useQuery({
  queryKey: ['/api/habits'],
  ...queryConfigs.dynamic,
});
```

---

### 3.2 Implementar Lazy Loading e Code Splitting

**Severidade:** 🟡 Médio  
**Impacto:** Reduz bundle inicial, acelera first load

#### Implementação:

**1. Lazy Load de Páginas:**
```typescript
// client/src/App.tsx
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Home = lazy(() => import("@/pages/Home"));
const NathIA = lazy(() => import("@/pages/NathIA"));
const MaeValente = lazy(() => import("@/pages/MaeValente"));
const Habitos = lazy(() => import("@/pages/Habitos"));
const MundoNath = lazy(() => import("@/pages/MundoNath"));
const RefugioNath = lazy(() => import("@/pages/RefugioNath"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nathia" element={<NathIA />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

**2. Lazy Load de Componentes Pesados:**
```typescript
// client/src/pages/MundoNath.tsx
const VideoEmbedLoader = lazy(() => import("@/components/VideoEmbedLoader"));
const SocialMediaEmbed = lazy(() => import("react-social-media-embed"));

// Usar Suspense apenas onde necessário
<Suspense fallback={<Skeleton className="h-64 w-full" />}>
  <VideoEmbedLoader url={post.embedUrl} />
</Suspense>
```

**3. Otimizar Vite Config (já parcialmente feito):**
```typescript
// vite.config.ts - melhorar manual chunks
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    // Separar por vendor
    if (id.includes('react') || id.includes('react-dom')) {
      return 'react-vendor';
    }
    if (id.includes('@tanstack/react-query')) {
      return 'query-vendor';
    }
    if (id.includes('@radix-ui')) {
      return 'ui-vendor';
    }
    if (id.includes('lucide-react')) {
      return 'icons-vendor';
    }
    if (id.includes('recharts')) {
      return 'charts-vendor';
    }
    return 'vendor';
  }
  
  // Code split por feature
  if (id.includes('/pages/')) {
    const name = id.split('/pages/')[1].split('.')[0];
    return `page-${name}`;
  }
  
  if (id.includes('/components/')) {
    const name = id.split('/components/')[1].split('/')[0];
    if (['ui', 'landing'].includes(name)) {
      return `components-${name}`;
    }
  }
},
```

---

### 3.3 Otimizar Queries SQL/Drizzle

**Severidade:** 🔴 Crítico (quando migrar para Drizzle)  
**Impacto:** Performance de banco de dados

#### Índices Necessários:

```typescript
// shared/schema.ts - adicionar índices faltantes

// Habit completions - query frequente por habitId + date
export const habitCompletions = pgTable("habit_completions", {
  // ...
}, (table) => ({
  habitIdDateIdx: index("habit_completions_habit_id_date_idx")
    .on(table.habitId, table.date), // Composite index
  userIdDateIdx: index("habit_completions_user_id_date_idx")
    .on(table.userId, table.date),
}));

// AI messages - query por sessionId ordenado por createdAt
export const aiMessages = pgTable("ai_messages", {
  // ...
}, (table) => ({
  sessionIdCreatedAtIdx: index("ai_messages_session_id_created_at_idx")
    .on(table.sessionId, table.createdAt),
}));

// Community posts - query por type + createdAt (feed)
export const communityPosts = pgTable("community_posts", {
  // ...
}, (table) => ({
  typeCreatedAtIdx: index("community_posts_type_created_at_idx")
    .on(table.type, table.createdAt),
  userIdCreatedAtIdx: index("community_posts_user_id_created_at_idx")
    .on(table.userId, table.createdAt),
}));
```

#### Otimizar SELECTs:

```typescript
// ANTES (busca todos os campos)
const posts = await db.select().from(postsTable);

// DEPOIS (busca apenas campos necessários)
const posts = await db
  .select({
    id: postsTable.id,
    title: postsTable.title,
    thumbnailUrl: postsTable.thumbnailUrl,
    publishedAt: postsTable.publishedAt,
  })
  .from(postsTable)
  .where(eq(postsTable.category, category))
  .orderBy(desc(postsTable.publishedAt))
  .limit(limit)
  .offset(offset);
```

#### Batch Operations:

```typescript
// ANTES (N queries)
for (const habitId of habitIds) {
  await db.insert(habitCompletions).values({ habitId, date, userId });
}

// DEPOIS (1 query)
await db.insert(habitCompletions).values(
  habitIds.map(habitId => ({ habitId, date, userId }))
);
```

---

### 3.4 Implementar Cache Redis (Produção)

**Severidade:** 🟡 Médio  
**Impacto:** Reduz carga no banco, acelera respostas

#### Implementação:

**1. Instalar Redis:**
```bash
npm install redis @types/redis
```

**2. Atualizar `server/cache.ts`:**
```typescript
// Já existe estrutura básica, melhorar:
import { createClient } from "redis";
import { logger } from "./logger";

let redisClient: ReturnType<typeof createClient> | null = null;

async function initializeCache() {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      
      redisClient.on("error", (err) => {
        logger.error({ err, msg: "Redis client error" });
      });
      
      redisClient.on("connect", () => {
        logger.info({ msg: "Redis connected" });
      });
      
      await redisClient.connect();
      logger.info({ msg: "Redis cache initialized" });
    } catch (error) {
      logger.warn({ err: error, msg: "Failed to connect to Redis, using memory cache" });
      redisClient = null;
    }
  }
}

// Adicionar métodos úteis
export const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    if (!redisClient) return memoryCache.get<T>(key);
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },
  
  set: async (key: string, value: any, ttlSeconds: number): Promise<void> => {
    if (!redisClient) {
      return memoryCache.set(key, value, ttlSeconds);
    }
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  },
  
  del: async (key: string): Promise<void> => {
    if (!redisClient) return memoryCache.del(key);
    await redisClient.del(key);
  },
  
  exists: async (key: string): Promise<boolean> => {
    if (!redisClient) return memoryCache.exists(key);
    return (await redisClient.exists(key)) === 1;
  },
  
  // Novos métodos
  increment: async (key: string, by: number = 1): Promise<number> => {
    if (!redisClient) {
      const current = (await memoryCache.get<number>(key)) || 0;
      const newValue = current + by;
      await memoryCache.set(key, newValue, 3600);
      return newValue;
    }
    return await redisClient.incrBy(key, by);
  },
  
  getKeys: async (pattern: string): Promise<string[]> => {
    if (!redisClient) return [];
    return await redisClient.keys(pattern);
  },
  
  invalidatePattern: async (pattern: string): Promise<void> => {
    if (!redisClient) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  },
};
```

**3. Cache Strategy:**
```typescript
// Cache por camada:
// 1. Browser cache (via headers)
// 2. CDN cache (Vercel Edge)
// 3. Redis cache (API responses)
// 4. Database (source of truth)

// Exemplo: Cache de posts
const cachedPosts = await cache.get<Post[]>(CacheKeys.posts(category));
if (cachedPosts) {
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min browser
  return res.json(cachedPosts);
}

const posts = await storage.getPosts(category);
await cache.set(CacheKeys.posts(category), posts, CacheTTL.POSTS);
res.setHeader('Cache-Control', 'public, max-age=300');
res.json(posts);
```

---

## 🔒 CATEGORIA 4: SEGURANÇA

### 4.1 Eliminar Type Casts Inseguros (`any`)

**Severidade:** 🟡 Médio  
**Impacto:** Type safety, previne bugs

#### Ocorrências Encontradas:
```typescript
// server/routes.ts:93
const { page, limit } = req.query as any; // ❌

// server/routes.ts:392
let allCompletions = await cache.get<any[]>(cacheKey); // ❌

// server/routes.ts:649
let stats = await cache.get<any>(cacheKey); // ❌
```

#### Solução:

**1. Tipar req.query corretamente:**
```typescript
// server/types.ts
export interface PaginationQuery {
  page?: string;
  limit?: string;
  category?: string;
}

// server/routes.ts
app.get("/api/posts", validateQuery(paginationSchema), async (req, res) => {
  const { page, limit, category } = req.query as PaginationQuery;
  // TypeScript agora sabe os tipos
});
```

**2. Tipar cache generics:**
```typescript
// server/routes.ts
import type { HabitCompletion, UserStats } from "@shared/schema";

const allCompletions = await cache.get<HabitCompletion[]>(cacheKey);
const stats = await cache.get<UserStats>(cacheKey);
```

---

### 4.2 Fortalecer Validação de Inputs

**Severidade:** 🟡 Médio  
**Impacto:** Previne injection, XSS, buffer overflow

#### Melhorias:

**1. Sanitização de Strings:**
```typescript
// server/utils/sanitize.ts
import { z } from "zod";

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .replace(/[<>]/g, ''); // Remove < > para prevenir XSS básico
}

// Usar em schemas
export const createHabitSchema = z.object({
  title: z.string()
    .min(1)
    .max(50)
    .transform(sanitizeString), // Auto-sanitize
});
```

**2. Validação de UUIDs:**
```typescript
// Já existe, mas melhorar mensagens
export const uuidParamSchema = z.object({
  id: z.string().uuid("ID inválido. Deve ser um UUID válido."),
});
```

**3. Validação de Datas:**
```typescript
// server/validation.ts - adicionar
export const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida. Use formato YYYY-MM-DD"),
});
```

---

### 4.3 Implementar CORS Mais Restritivo

**Severidade:** 🟡 Médio  
**Impacto:** Previne CSRF, protege API

#### Melhorias:

```typescript
// server/index.ts
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : process.env.NODE_ENV === 'production'
    ? [] // ❌ Nenhuma origem em produção sem config
    : ['http://localhost:5000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Em produção, sempre requer origin
    if (process.env.NODE_ENV === 'production' && !origin) {
      return callback(new Error('CORS: Origin required in production'));
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin, msg: 'CORS blocked origin' });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 horas
}));
```

---

### 4.4 Adicionar Rate Limiting em Mais Endpoints

**Severidade:** 🟡 Médio  
**Impacto:** Previne abuso, protege recursos

#### Endpoints que Precisam Rate Limiting:

```typescript
// server/routes.ts

// Community posts (prevenir spam)
app.post("/api/community/posts", 
  requireAuth,
  generalApiLimiter, // Adicionar
  validateBody(createCommunityPostSchema),
  async (req, res) => { /* ... */ }
);

// Comments (prevenir spam)
app.post("/api/community/posts/:id/comments",
  requireAuth,
  generalApiLimiter, // Adicionar
  validateBody(createCommentSchema),
  async (req, res) => { /* ... */ }
);

// Habit completions (prevenir abuse)
app.post("/api/habits/:habitId/complete",
  requireAuth,
  generalApiLimiter, // Adicionar
  async (req, res) => { /* ... */ }
);
```

---

### 4.5 Implementar CSRF Protection

**Severidade:** 🟢 Baixo (se usar cookies)  
**Impacto:** Previne CSRF attacks

#### Implementação:

```bash
npm install csurf
npm install --save-dev @types/csurf
```

```typescript
// server/index.ts
import csrf from "csurf";

// Configurar CSRF apenas para rotas que modificam estado
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  }
});

// Aplicar em rotas POST/PUT/DELETE
app.post("/api/community/posts", 
  csrfProtection, // Adicionar
  requireAuth,
  // ...
);
```

**Nota:** Se usar token-based auth (JWT), CSRF não é necessário.

---

## 🎨 CATEGORIA 5: UX/UI E ACESSIBILIDADE

### 5.1 Implementar React.memo e useMemo/useCallback

**Severidade:** 🟡 Médio  
**Impacto:** Reduz re-renders, melhora performance

#### Componentes para Otimizar:

**1. `client/src/pages/NathIA.tsx`:**
```typescript
import { memo, useCallback, useMemo } from "react";

// Memoizar componente de mensagem
const MessageBubble = memo(({ message }: { message: AiMessage }) => {
  // ...
});

// Memoizar prompts sugeridos
const SUGGESTED_PROMPTS = [
  "Como lidar com o enjoo matinal?",
  // ...
] as const;

function NathIA() {
  // Memoizar handlers
  const handleSend = useCallback(() => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    const message = input.trim();
    setOptimisticMessage(message);
    sendMessageMutation.mutate(message);
  }, [input, sendMessageMutation]);

  const handlePromptClick = useCallback((prompt: string) => {
    if (sendMessageMutation.isPending) return;
    setOptimisticMessage(prompt);
    sendMessageMutation.mutate(prompt);
  }, [sendMessageMutation]);

  // Memoizar lista de mensagens
  const displayMessages = useMemo(() => {
    const msgs = [...messages];
    if (optimisticMessage) {
      msgs.push({
        id: 'optimistic',
        role: 'user',
        content: optimisticMessage,
        createdAt: new Date(),
      } as AiMessage);
    }
    return msgs;
  }, [messages, optimisticMessage]);

  return (
    // ...
  );
}

export default memo(NathIA);
```

**2. `client/src/pages/Habitos.tsx`:**
```typescript
// Memoizar cálculo de stats
const stats = useMemo(() => {
  return habits.reduce((acc, habit) => {
    acc.totalCompletions += habit.completions || 0;
    acc.totalStreak += habit.streak || 0;
    return acc;
  }, { totalCompletions: 0, totalStreak: 0 });
}, [habits]);
```

---

### 5.2 Melhorar Acessibilidade (WCAG 2.1 AA)

**Severidade:** 🔴 Crítico  
**Impacto:** Inclusão, compliance legal

#### Checklist:

**1. Adicionar ARIA Labels:**
```typescript
// client/src/pages/NathIA.tsx
<Textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Digite sua mensagem..."
  aria-label="Campo de mensagem para NathIA"
  aria-describedby="nathia-help-text"
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }}
/>

<span id="nathia-help-text" className="sr-only">
  Pressione Enter para enviar, Shift+Enter para nova linha
</span>
```

**2. Adicionar Focus Management:**
```typescript
// client/src/pages/NathIA.tsx
const inputRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  // Focar input após enviar mensagem
  if (!sendMessageMutation.isPending && inputRef.current) {
    inputRef.current.focus();
  }
}, [sendMessageMutation.isPending]);

<Textarea ref={inputRef} /* ... */ />
```

**3. Adicionar Skip Links:**
```typescript
// client/src/App.tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
  Pular para conteúdo principal
</a>

<main id="main-content">
  {/* ... */}
</main>
```

**4. Melhorar Contraste:**
```css
/* client/src/index.css - verificar contraste */
/* WCAG AA requer 4.5:1 para texto normal, 3:1 para texto grande */

/* Adicionar variáveis de contraste */
:root {
  --text-contrast-ratio: 4.5; /* Garantir mínimo */
}
```

**5. Adicionar Keyboard Navigation:**
```typescript
// Todos os botões/interativos devem ser focáveis via Tab
// Adicionar focus-visible styles
button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

---

### 5.3 Implementar Dark Mode Completo

**Severidade:** 🟢 Baixo (já existe parcialmente)  
**Impacto:** UX, economia de bateria

#### Verificações:

```typescript
// client/src/components/ThemeProvider.tsx
// Verificar se:
// 1. Persiste preferência no localStorage
// 2. Respeita prefers-color-scheme do sistema
// 3. Todos os componentes suportam dark mode
// 4. Imagens têm versões para dark mode (se necessário)
```

---

### 5.4 Adicionar Loading States e Error Boundaries

**Severidade:** 🟡 Médio  
**Impacto:** UX, resiliência

#### Implementação:

**1. Loading Skeletons:**
```typescript
// client/src/components/LoadingSkeleton.tsx
export function HabitsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

// Uso:
{isLoading ? <HabitsSkeleton /> : <HabitsList habits={habits} />}
```

**2. Error Boundaries por Rota:**
```typescript
// client/src/components/RouteErrorBoundary.tsx
export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={resetError}>Tentar novamente</Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## 🧪 CATEGORIA 6: TESTES E QA

### 6.1 Expandir Cobertura de Testes

**Severidade:** 🔴 Crítico  
**Impacto:** Confiança, prevenção de regressões

#### Estrutura de Testes Proposta:

```
tests/
├── server/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── habits.service.test.ts
│   │   │   ├── gamification.service.test.ts
│   │   │   └── ai.service.test.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.test.ts
│   │   │   └── validation.middleware.test.ts
│   │   └── utils/
│   │       ├── cache.utils.test.ts
│   │       └── sanitize.test.ts
│   ├── integration/
│   │   ├── routes/
│   │   │   ├── habits.routes.test.ts
│   │   │   ├── community.routes.test.ts
│   │   │   └── ai.routes.test.ts
│   │   └── storage/
│   │       └── drizzle-storage.test.ts
│   └── e2e/
│       └── api.test.ts
├── client/
│   ├── unit/
│   │   ├── components/
│   │   │   └── HabitCard.test.tsx
│   │   └── hooks/
│   │       └── use-auth.test.ts
│   └── integration/
│       └── pages/
│           └── Habitos.test.tsx
└── shared/
    └── schema.test.ts
```

#### Exemplo: `tests/server/unit/services/habits.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { HabitsService } from "../../../../server/services/habits.service";
import { storage } from "../../../../server/storage";
import { cache } from "../../../../server/cache";

vi.mock("../../../../server/storage");
vi.mock("../../../../server/cache");

describe("HabitsService", () => {
  let service: HabitsService;

  beforeEach(() => {
    service = new HabitsService();
    vi.clearAllMocks();
  });

  describe("getHabitsWithStats", () => {
    it("should return empty array when no habits", async () => {
      vi.mocked(storage.getHabits).mockResolvedValue([]);
      
      const result = await service.getHabitsWithStats("user-1");
      
      expect(result).toEqual([]);
      expect(storage.getHabits).toHaveBeenCalledWith("user-1");
    });

    it("should calculate streaks correctly", async () => {
      const habits = [
        { id: "habit-1", userId: "user-1", title: "Test", emoji: "🏃", color: "..." },
      ];
      const completions = [
        { habitId: "habit-1", date: "2025-01-11", userId: "user-1" },
        { habitId: "habit-1", date: "2025-01-10", userId: "user-1" },
        { habitId: "habit-1", date: "2025-01-09", userId: "user-1" },
      ];

      vi.mocked(storage.getHabits).mockResolvedValue(habits);
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(storage.getHabitCompletionsByHabitIds).mockResolvedValue(completions);
      vi.mocked(cache.set).mockResolvedValue();

      const result = await service.getHabitsWithStats("user-1");

      expect(result[0].streak).toBe(3);
      expect(result[0].completedToday).toBe(true);
    });
  });
});
```

#### Exemplo: `tests/client/unit/components/HabitCard.test.tsx`

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HabitCard } from "@/components/HabitCard";
import type { Habit } from "@shared/schema";

describe("HabitCard", () => {
  const mockHabit: Habit = {
    id: "habit-1",
    userId: "user-1",
    title: "Exercitar",
    emoji: "🏃",
    color: "from-blue-500 to-purple-500",
    createdAt: new Date(),
  };

  it("should render habit title and emoji", () => {
    render(<HabitCard habit={mockHabit} completedToday={false} streak={0} />);
    
    expect(screen.getByText("Exercitar")).toBeInTheDocument();
    expect(screen.getByText("🏃")).toBeInTheDocument();
  });

  it("should show streak when > 0", () => {
    render(<HabitCard habit={mockHabit} completedToday={true} streak={5} />);
    
    expect(screen.getByText(/5 dias/i)).toBeInTheDocument();
  });
});
```

#### Configuração Vitest:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "dist/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
```

#### Scripts:

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:server": "vitest run tests/server",
    "test:client": "vitest run tests/client",
  }
}
```

---

### 6.2 Adicionar Testes de Acessibilidade

**Severidade:** 🟡 Médio  
**Impacto:** Compliance WCAG

#### Implementação:

```bash
npm install --save-dev @testing-library/jest-dom @axe-core/react
```

```typescript
// tests/client/a11y/Habitos.a11y.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Habitos from "@/pages/Habitos";

expect.extend(toHaveNoViolations);

describe("Habitos - Acessibilidade", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<Habitos />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper heading hierarchy", () => {
    const { container } = render(<Habitos />);
    const headings = container.querySelectorAll("h1, h2, h3");
    // Verificar hierarquia
    expect(headings.length).toBeGreaterThan(0);
  });
});
```

---

## 🚀 CATEGORIA 7: DEVOPS E CI/CD

### 7.1 Melhorar Workflows GitHub Actions

**Severidade:** 🟡 Médio  
**Impacto:** Automação, qualidade

#### Workflow Completo:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm run check
      - run: pnpm run lint # Adicionar ESLint
      - run: pnpm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      
      - name: Run security audit
        run: pnpm audit --audit-level=moderate
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

#### Workflow de Deploy:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run database migrations
        run: |
          pnpm run db:push
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Health check
        run: |
          sleep 10
          curl -f https://nossa-maternidade.vercel.app/api/health || exit 1
```

---

### 7.2 Adicionar Builds Incrementais e Cache

**Severidade:** 🟢 Baixo  
**Impacto:** Acelera CI/CD

#### Configuração:

```yaml
# .github/workflows/ci.yml
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path: |
      node_modules
      .pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Cache build
  uses: actions/cache@v3
  with:
    path: dist
    key: ${{ runner.os }}-build-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-build-
```

---

### 7.3 Adicionar Preview Deploys para PRs

**Severidade:** 🟢 Baixo  
**Impacto:** Testes antes de merge

#### Implementação:

```yaml
# .github/workflows/preview.yml
name: Preview Deploy

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--yes'
      
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deploy: ${{ steps.deploy.outputs.preview-url }}`
            });
```

---

## 📚 CATEGORIA 8: DOCUMENTAÇÃO

### 8.1 Documentar APIs com OpenAPI/Swagger

**Severidade:** 🟡 Médio  
**Impacto:** Developer experience, integração

#### Implementação:

```bash
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

```typescript
// server/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nossa Maternidade API",
      version: "1.0.0",
      description: "API para plataforma de bem-estar materno",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
        },
      },
    },
  },
  apis: ["./server/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

// Usar em server/index.ts
import { swaggerSpec } from "./swagger";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

#### Exemplo de Documentação:

```typescript
/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Lista hábitos do usuário
 *     tags: [Habits]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Lista de hábitos com estatísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Habit'
 */
app.get("/api/habits", requireAuth, async (req, res) => {
  // ...
});
```

---

### 8.2 Adicionar JSDoc em Funções Públicas

**Severidade:** 🟢 Baixo  
**Impacto:** Developer experience, IDE autocomplete

#### Exemplo:

```typescript
/**
 * Calcula o nível do usuário baseado em XP
 * 
 * @param xp - Pontos de experiência do usuário
 * @returns Nível calculado (nível 1 = 0-99 XP, nível 2 = 100-199 XP, etc.)
 * 
 * @example
 * ```typescript
 * const level = calculateLevel(250); // Retorna 3
 * ```
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / GAMIFICATION.XP_PER_LEVEL) + 1;
}
```

---

### 8.3 Criar Guias de Contribuição

**Severidade:** 🟢 Baixo  
**Impacto:** Onboarding, qualidade de PRs

#### Arquivos:

1. **CONTRIBUTING.md:**
```markdown
# Guia de Contribuição

## Setup do Ambiente
1. Clone o repositório
2. Instale dependências: `npm install`
3. Configure `.env` baseado em `.env.example`
4. Rode migrations: `npm run db:push`
5. Inicie dev server: `npm run dev`

## Padrões de Código
- Use TypeScript strict mode
- Siga ESLint rules
- Escreva testes para novas features
- Documente funções públicas com JSDoc

## Processo de PR
1. Crie branch: `git checkout -b feature/nome-da-feature`
2. Faça commits descritivos
3. Rode testes: `npm test`
4. Abra PR com template preenchido
```

2. **ARCHITECTURE.md:**
```markdown
# Arquitetura do Projeto

## Visão Geral
Monorepo fullstack TypeScript com:
- Frontend: React + Vite
- Backend: Express + TypeScript
- Database: PostgreSQL (Neon)

## Estrutura de Pastas
[Detalhes da estrutura]

## Fluxo de Dados
[Diagramas e explicações]
```

---

## 📋 RESUMO DE PRIORIDADES

### 🔴 Crítico (Implementar Primeiro)
1. ✅ Refatorar `server/routes.ts` em módulos
2. ✅ Criar camada de serviços
3. ✅ Eliminar `any` types
4. ✅ Expandir cobertura de testes
5. ✅ Melhorar acessibilidade (WCAG)

### 🟡 Médio (Próximas Sprints)
6. Limpeza de arquivos e dependências
7. Otimizar React Query
8. Implementar lazy loading
9. Fortalecer validações
10. Adicionar rate limiting em mais endpoints
11. Implementar cache Redis
12. Documentar APIs

### 🟢 Baixo (Backlog)
13. Organizar estrutura de pastas
14. Melhorar dark mode
15. Adicionar CSRF protection
16. Builds incrementais CI/CD
17. Preview deploys
18. JSDoc completo

---

## 🎯 MÉTRICAS DE SUCESSO

### Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 500KB (gzipped)
- [ ] API response time P95 < 200ms

### Qualidade
- [ ] Cobertura de testes > 80%
- [ ] Zero `any` types
- [ ] Zero console.log em produção
- [ ] Zero vulnerabilidades críticas

### Segurança
- [ ] Todos os inputs validados
- [ ] Rate limiting em endpoints sensíveis
- [ ] CORS configurado corretamente
- [ ] Secrets não expostos

### Acessibilidade
- [ ] WCAG 2.1 AA compliance
- [ ] Lighthouse a11y score > 90
- [ ] Keyboard navigation funcional
- [ ] Screen reader friendly

---

## 📝 PRÓXIMOS PASSOS

1. **Revisar este plano** e priorizar itens
2. **Criar issues** no GitHub para cada categoria
3. **Estimar esforço** por item
4. **Criar roadmap** de sprints
5. **Começar implementação** pelos itens críticos

---

**Documento criado em:** 2025-01-11  
**Versão:** 1.0  
**Status:** 📋 Aguardando Validação
