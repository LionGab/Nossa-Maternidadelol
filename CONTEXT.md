# Contexto Rápido - Nossa Maternidade

> Documentação otimizada para Claude Max ($100) - Use quando precisar de contexto profundo do projeto

## Resumo Executivo

**Nossa Maternidade** é uma plataforma fullstack TypeScript para bem-estar materno criada por Nathália Valente. Stack: React (Vite) + Express.js + Drizzle ORM + Neon PostgreSQL. Foco em AI assistants, tracking de hábitos gamificado, comunidade e conteúdo educativo.

## Arquitetura em 30 Segundos

```
Monorepo TypeScript:
├── client/     → React + Vite + Wouter + TanStack Query + shadcn/ui
├── server/     → Express + Passport + Drizzle (preparado) + Storage in-memory (atual)
└── shared/     → Schemas Drizzle + Zod (fonte única de verdade)
```

**Estado Atual**: Storage in-memory (reseta no restart). Migração para Drizzle PostgreSQL planejada.

## Decisões Arquiteturais Críticas

### 1. Type Safety Cross-Stack
- **Padrão**: Sempre importar tipos de `@shared/schema`
- **Por quê**: Type safety entre frontend/backend sem duplicação
- **Arquivo-chave**: `shared/schema.ts` (20+ tabelas)

### 2. Validação em Duas Camadas
- **Zod schemas** em `server/validation.ts` para inputs HTTP
- **Drizzle schemas** em `shared/schema.ts` para DB
- **Padrão**: `validateBody/Query/Params` em TODAS as rotas

### 3. Autenticação Baseada em Sessão
- **Passport.js** com Local Strategy (email + password)
- **Scrypt** para hash de senhas (Node.js built-in)
- **Middleware**: `requireAuth` → acessa `req.user!.id`
- **Segurança**: Session secret >= 32 chars em produção

### 4. AI Integrations Modulares
- **NathIA** (`server/gemini.ts`): Gemini 2.5 Flash, temperatura 0.7, 500 tokens
- **Mãe Valente** (`server/perplexity.ts`): Perplexity llama-3.1-sonar-small, temperatura 0.2, 800 tokens
- **Rate Limiting**: 10 req/min (chat), 5 req/min (search)
- **Cache**: Q&A responses por 7 dias (MD5 hash keys)

### 5. Gamificação Inspirada em Duolingo
- **XP**: +10 por hábito completado
- **Level**: `Math.floor(xp / 100) + 1`
- **Streaks**: Rastreados em `userStats.currentStreak`
- **Achievements**: 10 conquistas auto-desbloqueáveis (veja `server/routes.ts:345-371`)

### 6. Performance Otimizada (2025-01-11)
- **N+1 Fix**: Batch loading com `getHabitCompletionsByHabitIds()` → 155 queries → 1 query
- **Pagination**: 3 rotas paginadas (default 20, max 100)
- **Logging**: Pino com redaction automático de secrets
- **Métricas**: 99.4% melhoria em `/api/habits` (7.75s → 50ms)

## Padrões de Código Críticos

### Backend (`server/`)

```typescript
// ✅ SEMPRE fazer assim:
import { validateBody, requireAuth } from "./validation";
import { logger } from "./logger";
import { aiChatLimiter } from "./rate-limit";

app.post("/api/endpoint", 
  requireAuth,                    // 1. Auth primeiro
  aiChatLimiter,                  // 2. Rate limit se necessário
  validateBody(mySchema),         // 3. Validação
  async (req, res) => {
    const userId = req.user!.id;  // 4. User ID do Passport
    logger.info({ msg: "...", userId });
    res.json({ data: result });   // 5. Resposta padronizada
  }
);
```

**Arquivos-chave**:
- `server/routes.ts` - Rotas principais (678 linhas)
- `server/validation.ts` - 8 schemas Zod
- `server/logger.ts` - Pino logger (sempre use ao invés de console.*)
- `server/rate-limit.ts` - Rate limiters para AI/auth
- `server/pagination.ts` - Utilitários de paginação

### Frontend (`client/`)

```typescript
// ✅ SEMPRE fazer assim:
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";  // shadcn/ui
import type { Post } from "@shared/schema";   // Tipos compartilhados

export default function MyPage() {
  const { data } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });
  // ...
}
```

**Arquivos-chave**:
- `client/src/pages/` - Páginas principais (rotas)
- `client/src/components/ui/` - Componentes shadcn/ui
- `client/src/lib/queryClient.ts` - Config TanStack Query

### Schemas (`shared/`)

```typescript
// ✅ Padrão Drizzle + Zod:
export const posts = pgTable("posts", { /* ... */ });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true });
export type Post = typeof posts.$inferSelect;
```

**Arquivo-chave**: `shared/schema.ts` (433 linhas, 20+ tabelas)

## Troubleshooting Comum

### Problema: Storage reseta no restart
**Causa**: Usando `server/storage.ts` (in-memory Maps)  
**Solução**: Migrar para Drizzle ORM (`server/db.ts` já preparado)

### Problema: Rate limit em AI endpoints
**Causa**: Rate limiting muito restritivo  
**Solução**: Ajustar em `server/rate-limit.ts` (atual: 10/min chat, 5/min search)

### Problema: Type errors entre client/server
**Causa**: Importando tipos locais ao invés de `@shared/schema`  
**Solução**: Sempre importar de `@shared/schema`

### Problema: N+1 queries lentas
**Causa**: Loops com queries individuais  
**Solução**: Usar batch loading (veja `server/storage.ts:1177`)

### Problema: Build falha no Windows
**Causa**: Scripts usando comandos Unix  
**Solução**: Usar `cross-env` (já configurado) e `localhost` ao invés de `0.0.0.0`

## Referências Rápidas

### Estrutura de Rotas API
```
GET  /api/daily-featured          → Conteúdo do dia
GET  /api/posts?page=1&limit=20   → Posts paginados
GET  /api/habits                  → Hábitos do usuário (completions batch-loaded)
POST /api/ai/chat                 → NathIA (rate-limited)
POST /api/ai/search                → Mãe Valente (rate-limited)
GET  /api/community/posts          → Posts da comunidade (paginados)
```

### Variáveis de Ambiente
```bash
DATABASE_URL       # Neon PostgreSQL (obrigatório)
GEMINI_API_KEY     # Google Gemini (obrigatório)
PERPLEXITY_API_KEY # Perplexity AI (obrigatório)
SESSION_SECRET     # >= 32 chars em produção (obrigatório)
NODE_ENV           # development | production
```

### Comandos Essenciais
```bash
npm run dev        # Dev server (localhost:5000)
npm run build      # Build produção
npm run check      # Type check
npm run db:push    # Push schema para DB
npm run dev:clean  # Limpar cache e reiniciar
```

## Prioridades do Projeto

1. **Migrar storage in-memory → Drizzle PostgreSQL** (crítico)
2. **Gerar migrations versionadas** (ao invés de `db:push`)
3. **Adicionar testes** (Vitest para unit tests)
4. **Redis cache** (Q&A responses + habit completions)
5. **Monitoring** (Prometheus + Grafana)

## Quando Escalar para Claude Max

Use Claude Max ($100) quando:
- 🔥 Arquitetura complexa ou decisões de design
- 🔥 Refatorações grandes (ex: migração storage)
- 🔥 Otimizações de performance profundas
- 🔥 Planejamento de features grandes
- 🔥 Bugs difíceis após 2-3 tentativas no Cursor

Use Cursor ($20) para:
- ✅ Edições rápidas e refatorações simples
- ✅ Correções de bugs pequenos
- ✅ Ajustes de UI/styling
- ✅ Completar código enquanto digita

## Arquivos Mais Importantes

1. `shared/schema.ts` - Schemas Drizzle + Zod (fonte única de verdade)
2. `server/routes.ts` - Rotas principais da API
3. `server/storage.ts` - Interface de storage (in-memory atual)
4. `server/db.ts` - Drizzle ORM (preparado para migração)
5. `server/validation.ts` - Schemas Zod para validação
6. `server/logger.ts` - Sistema de logging estruturado
7. `CLAUDE.md` - Documentação completa do projeto
8. `.cursorrules` - Regras para Cursor seguir padrões

---

**Última atualização**: 2025-01-11  
**Versão**: 1.0.0  
**Stack**: TypeScript + React + Express + Drizzle + Neon PostgreSQL

