# 🎯 Plano de Ação Completo - Nossa Maternidade

**Data:** 2025-01-13
**Versão:** 2.0 (Revisada e Realista)
**Baseado em:** ANALISE_PROFUNDA_LINHA_POR_LINHA.md v2.0

---

## 📊 Visão Geral

Este plano corrige **1 bug crítico** e implementa **melhorias incrementais** priorizadas por ROI. Não há problemas arquiteturais críticos - o projeto já está bem estruturado.

### Esforço Total Estimado

| Fase | Prioridade | Esforço | Timeline | Resultado |
|------|------------|---------|----------|-----------|
| **Fase 0: Hotfix** | 🔴 CRÍTICA | 30 min | Hoje | Bug de streak corrigido |
| **Fase 1: Foundation** | 🟡 ALTA | 8-10h | 1-2 semanas | Testes básicos + error handling |
| **Fase 2: Quality** | 🟢 MÉDIA | 6-8h | 2-3 semanas | Constants + type safety |
| **Fase 3: Scale** | ⚪ BAIXA | 10-12h | 1-2 meses | Modularização (se necessário) |

**Total:** 24-30 horas (~1-2 horas/dia por 3 semanas)

---

## 🚨 FASE 0: Hotfix Crítico

**Prazo:** Hoje (30 minutos)
**Responsável:** Dev lead

### 0.1 Corrigir Bug de Mutação de Date

**Problema:** `server/routes.ts:425` - mutação de Date no cálculo de streak

**Passos:**

```bash
# 1. Criar branch de hotfix
git checkout -b hotfix/streak-date-mutation

# 2. Abrir arquivo
# Editar server/routes.ts linha 420-426
```

**Código Atual:**
```typescript
let checkDate = new Date(today);
while (streak < GAMIFICATION.MAX_STREAK_DAYS) {
  const dateStr = checkDate.toISOString().split("T")[0];
  if (!habitDates.has(dateStr)) break;
  streak++;
  checkDate.setDate(checkDate.getDate() - 1); // ⚠️ MUTAÇÃO
}
```

**Código Corrigido:**
```typescript
let checkDate = new Date(today);
while (streak < GAMIFICATION.MAX_STREAK_DAYS) {
  const dateStr = checkDate.toISOString().split("T")[0];
  if (!habitDates.has(dateStr)) break;
  streak++;
  // Criar nova instância ao invés de mutar
  checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
}
```

**Validação:**

```bash
# 3. Testar manualmente
npm run dev
# Abrir app → Hábitos → Completar hábito por 3 dias seguidos
# Verificar se streak = 3

# 4. Typecheck
npm run check

# 5. Build
npm run build
```

**Rollback:**
```bash
# Se algo der errado:
git checkout main server/routes.ts
```

**Commit:**
```bash
git add server/routes.ts
git commit -m "fix: corrigir mutação de Date no cálculo de streak

- Substituir setDate() por criação de nova instância
- Previne comportamento inesperado em limites de mês
- Refs: ANALISE_PROFUNDA_LINHA_POR_LINHA.md #1"

git push -u origin hotfix/streak-date-mutation
```

**Critérios de Sucesso:**
- [ ] Streak calcula corretamente através de mudanças de mês
- [ ] `npm run check` passa sem erros
- [ ] `npm run build` completa com sucesso
- [ ] Testes manuais confirmam streak correto

---

## 🏗️ FASE 1: Foundation

**Prazo:** 1-2 semanas
**Esforço:** 8-10 horas (~1h/dia)
**Objetivo:** Melhorar confiabilidade e manutenibilidade do core

### 1.1 Melhorar Error Handling (2h)

**Arquivo:** `server/error-handler.ts` (novo)

**Implementação:**

```typescript
// server/error-handler.ts
import { logger } from "./logger";
import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error com contexto completo
  logger.error({
    err,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    msg: "Unhandled error"
  });

  // Se resposta já foi enviada, delegar para Express
  if (res.headersSent) {
    return next(err);
  }

  // Determinar status code e mensagem
  let statusCode = 500;
  let message = "Erro interno do servidor";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Dados inválidos";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Não autorizado";
  }

  // Enviar resposta
  res.status(statusCode).json({
    error: process.env.NODE_ENV === "production" ? message : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**Integração em `server/index.ts`:**

```typescript
import { errorHandler } from "./error-handler";

// ... depois de todas as rotas
app.use(errorHandler);
```

**Uso em rotas:**

```typescript
import { asyncHandler, AppError } from "./error-handler";

app.get("/api/habits", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const habits = await storage.getHabits(userId);

  if (!habits) {
    throw new AppError(404, "Hábitos não encontrados");
  }

  res.json(habits);
}));
```

**Validação:**
```bash
# Testar com erro forçado
curl -X GET http://localhost:5000/api/habits
# Verificar response 401 e log estruturado

npm run check
npm run build
```

**Critérios de Sucesso:**
- [ ] Erros não tratados são logados com contexto completo
- [ ] Stack traces não vazam em produção
- [ ] `asyncHandler` elimina try-catch repetitivo
- [ ] 500 errors retornam mensagem genérica em prod

---

### 1.2 Testes Unitários - Fase 1 (6-8h)

**Objetivo:** 40-50% coverage nos módulos críticos

**Estrutura:**

```bash
# Criar estrutura de testes
mkdir -p tests/unit/server/{services,validation}
mkdir -p tests/fixtures
```

**Arquivo:** `tests/unit/server/validation.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import {
  nathiaChatSchema,
  createHabitSchema,
  createCommunityPostSchema,
  maeValenteSearchSchema,
} from "@/server/validation";

describe("Validation Schemas", () => {
  describe("nathiaChatSchema", () => {
    it("should validate valid message", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Como lidar com ansiedade na gestação?",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty message", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        message: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUID", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "not-a-uuid",
        message: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject message > 2000 chars", () => {
      const result = nathiaChatSchema.safeParse({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        message: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createHabitSchema", () => {
    it("should validate valid habit", () => {
      const result = createHabitSchema.safeParse({
        title: "Meditar 10 min",
        emoji: "🧘‍♀️",
        color: "from-purple-400 to-pink-400",
      });
      expect(result.success).toBe(true);
    });

    it("should reject title > 50 chars", () => {
      const result = createHabitSchema.safeParse({
        title: "a".repeat(51),
        emoji: "🧘‍♀️",
        color: "from-purple-400 to-pink-400",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty emoji", () => {
      const result = createHabitSchema.safeParse({
        title: "Meditar",
        emoji: "",
        color: "from-purple-400 to-pink-400",
      });
      expect(result.success).toBe(false);
    });
  });

  // ... mais 6 schemas (saveQaSchema, createCommunityPostSchema, etc.)
});
```

**Arquivo:** `tests/unit/server/services/streak-calculator.test.ts`

```typescript
import { describe, it, expect } from "vitest";

// Extrair função de streak para service
function calculateStreak(completionDates: Set<string>, today: string): number {
  let streak = 0;
  let checkDate = new Date(today);

  while (streak < 365) { // MAX_STREAK_DAYS
    const dateStr = checkDate.toISOString().split("T")[0];
    if (!completionDates.has(dateStr)) break;
    streak++;
    checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
  }

  return streak;
}

describe("calculateStreak", () => {
  const today = "2025-01-13";

  it("should return 0 for no completions", () => {
    const result = calculateStreak(new Set(), today);
    expect(result).toBe(0);
  });

  it("should return 1 for only today", () => {
    const result = calculateStreak(new Set([today]), today);
    expect(result).toBe(1);
  });

  it("should calculate 3-day streak", () => {
    const dates = new Set([
      "2025-01-13", // today
      "2025-01-12", // yesterday
      "2025-01-11", // 2 days ago
    ]);
    const result = calculateStreak(dates, today);
    expect(result).toBe(3);
  });

  it("should stop at first gap", () => {
    const dates = new Set([
      "2025-01-13", // today
      "2025-01-11", // 2 days ago (gap!)
      "2025-01-10",
    ]);
    const result = calculateStreak(dates, today);
    expect(result).toBe(1); // Only today
  });

  it("should handle month boundaries", () => {
    const dates = new Set([
      "2025-03-01", // today (month boundary)
      "2025-02-28", // yesterday (Feb has 28 days in 2025)
      "2025-02-27",
    ]);
    const result = calculateStreak(dates, "2025-03-01");
    expect(result).toBe(3);
  });

  it("should handle year boundaries", () => {
    const dates = new Set([
      "2025-01-01", // New Year
      "2024-12-31", // Last day of previous year
      "2024-12-30",
    ]);
    const result = calculateStreak(dates, "2025-01-01");
    expect(result).toBe(3);
  });
});
```

**Executar:**

```bash
# Rodar testes
npm run test

# Coverage report
npm run test:coverage

# Watch mode (desenvolvimento)
npm run test:watch
```

**Critérios de Sucesso:**
- [ ] 40-50% coverage total
- [ ] 100% coverage em validation schemas
- [ ] 100% coverage em calculateStreak
- [ ] Todos os testes passam
- [ ] CI integrado e passando

---

## 🎨 FASE 2: Quality

**Prazo:** 2-3 semanas
**Esforço:** 6-8 horas (~30 min/dia)
**Objetivo:** Melhorar manutenibilidade e DX

### 2.1 Adicionar Constantes (2-3h)

**Arquivo:** `server/constants.ts` (adicionar ao existente)

```typescript
// === HTTP STATUS CODES ===
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// === ERROR MESSAGES ===
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: "Email ou senha incorretos.",
  EMAIL_ALREADY_EXISTS: "Este email já está cadastrado.",
  UNAUTHORIZED: "Você precisa estar logado.",
  SESSION_EXPIRED: "Sua sessão expirou. Faça login novamente.",

  // Validation
  INVALID_INPUT: "Dados inválidos.",
  MISSING_REQUIRED_FIELD: "Campo obrigatório não preenchido.",

  // Rate Limiting
  TOO_MANY_REQUESTS: "Muitas requisições. Tente novamente em alguns minutos.",
  TOO_MANY_AI_REQUESTS: "Muitas mensagens enviadas. Aguarde 1 minuto.",

  // Resources
  NOT_FOUND: "Recurso não encontrado.",
  HABIT_NOT_FOUND: "Hábito não encontrado.",
  POST_NOT_FOUND: "Post não encontrado.",

  // Generic
  INTERNAL_ERROR: "Erro interno do servidor. Tente novamente mais tarde.",
  DATABASE_ERROR: "Erro ao acessar banco de dados.",
} as const;

// === SUCCESS MESSAGES ===
export const SUCCESS_MESSAGES = {
  HABIT_CREATED: "Hábito criado com sucesso!",
  HABIT_COMPLETED: "Hábito concluído! +10 XP 🎉",
  HABIT_DELETED: "Hábito excluído.",
  POST_CREATED: "Post publicado com sucesso!",
  COMMENT_CREATED: "Comentário adicionado!",
  PROFILE_UPDATED: "Perfil atualizado com sucesso!",
} as const;
```

**Migração Gradual:**

```bash
# Substituir em lote (usar find-replace do editor)
# Exemplo: res.status(400) → res.status(HTTP_STATUS.BAD_REQUEST)

# Testar após cada arquivo migrado
npm run check
npm run build
npm run test
```

**Critérios de Sucesso:**
- [ ] HTTP_STATUS usado em 100% das respostas
- [ ] ERROR_MESSAGES usado em 80%+ dos erros
- [ ] Nenhuma regressão funcional
- [ ] CI passando

---

### 2.2 Refatorar Casting Redundante de `any` (3-4h)

**Estratégia:** Substituir `as any` por tipos inferidos do Zod

**Exemplo:**

```typescript
// Antes:
import { nathiaChatSchema } from "./validation";

app.post("/api/nathia/chat", validateBody(nathiaChatSchema), async (req, res) => {
  const data = req.body as any; // ⚠️ Redundante
  await storage.createAiMessage(data);
});

// Depois:
import { nathiaChatSchema } from "./validation";
import { z } from "zod";

type NathiaChatInput = z.infer<typeof nathiaChatSchema>;

app.post("/api/nathia/chat", validateBody(nathiaChatSchema), async (req, res) => {
  const data = req.body as NathiaChatInput; // ✅ Type-safe
  await storage.createAiMessage(data);
});
```

**Processo:**

```bash
# 1. Criar arquivo de tipos
# shared/api-types.ts
import { z } from "zod";
import * as schemas from "@/server/validation";

export type NathiaChatInput = z.infer<typeof schemas.nathiaChatSchema>;
export type CreateHabitInput = z.infer<typeof schemas.createHabitSchema>;
export type CreatePostInput = z.infer<typeof schemas.createCommunityPostSchema>;
// ... etc (8 tipos)

# 2. Substituir gradualmente (1 arquivo por vez)
# 3. Testar após cada mudança
npm run check
```

**Estimativa:** ~30 minutos por arquivo × 8 arquivos = 4 horas

**Critérios de Sucesso:**
- [ ] Reduzir `as any` de 43 → <10
- [ ] `npm run check` passa sem novos erros
- [ ] Autocomplete funciona corretamente no editor

---

### 2.3 Condicionar console.log Client-Side (1h)

**Objetivo:** Reduzir logs em produção

**Arquivos:**
- `client/src/register-sw.ts` (7 logs)
- `client/src/lib/auth.ts` (4 logs)
- `client/src/lib/supabase.ts` (3 logs)

**Estratégia:**

```typescript
// Criar helper
// client/src/lib/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  warn: (...args: any[]) => isDev && console.warn(...args),
  error: (...args: any[]) => console.error(...args), // Manter errors em prod
};

// Uso em register-sw.ts
import { logger } from "./lib/logger";

logger.log('[PWA] Service Worker registrado');
```

**Critérios de Sucesso:**
- [ ] Produção: 0 logs informativos, apenas errors
- [ ] Dev: todos os logs funcionam
- [ ] Build size não aumenta

---

## 🚀 FASE 3: Scale (Opcional)

**Prazo:** 1-2 meses (quando necessário)
**Esforço:** 10-12 horas
**Trigger:** Time cresce para 2+ devs OU routes.ts > 1500 linhas

### 3.1 Modularizar Routes (10-12h)

**Condições para Iniciar:**
- [ ] Time tem 2+ desenvolvedores ativos
- [ ] Conflitos de merge frequentes em `routes.ts`
- [ ] `routes.ts` ultrapassou 1500 linhas
- [ ] Onboarding de novos devs está lento

**Estrutura Proposta:**

```bash
server/
├── routes/
│   ├── index.ts              # Registrador principal
│   ├── content.routes.ts     # Featured, posts, viral posts, tips
│   ├── ai.routes.ts          # NathIA, MãeValente, agents
│   ├── habits.routes.ts      # Habits, completions, stats
│   ├── community.routes.ts   # Community posts, comments, reactions
│   └── profile.routes.ts     # Profile, favorites, subscriptions
```

**Implementação Incremental:**

```typescript
// Passo 1: Criar routes/habits.routes.ts
import type { Express } from "express";
import { requireAuth } from "../auth";
import { storage } from "../storage";

export function registerHabitsRoutes(app: Express): void {
  app.get("/api/habits", requireAuth, async (req, res) => {
    // ... mover lógica de routes.ts
  });

  app.post("/api/habits/:id/complete", requireAuth, async (req, res) => {
    // ... mover lógica
  });
  // ... etc
}

// Passo 2: Atualizar routes/index.ts
import { registerHabitsRoutes } from "./habits.routes";

export function registerRoutes(app: Express): void {
  registerHabitsRoutes(app);
  // ... outras rotas
}

// Passo 3: Testar
npm run check
npm run build
npm run test

// Passo 4: Repetir para cada módulo
```

**Migração Incremental (1 módulo por dia):**
- Dia 1: habits.routes.ts
- Dia 2: community.routes.ts
- Dia 3: ai.routes.ts
- Dia 4: content.routes.ts
- Dia 5: profile.routes.ts

**Rollback:**
```bash
# Se algo quebrar, reverter arquivo específico
git checkout main server/routes/habits.routes.ts
git checkout main server/routes.ts
```

**Critérios de Sucesso:**
- [ ] Nenhuma regressão funcional
- [ ] Todos os testes passam
- [ ] CI/CD funciona normalmente
- [ ] Desenvolvedores relatam melhor DX

---

## 📅 Timeline Completo

### Semana 1
- **Dia 1 (30 min):** ✅ Hotfix - Bug de streak
- **Dia 2 (2h):** Error handler
- **Dia 3-5 (6h):** Testes unitários

### Semana 2-3
- **Dia 8-10 (3h):** Adicionar constantes
- **Dia 11-14 (4h):** Refatorar `any` casting
- **Dia 15 (1h):** Condicionar console.log

### Opcional (Mês 2+)
- **Quando necessário:** Modularização

---

## ✅ Critérios de Sucesso Globais

### Métricas Quantitativas
- [ ] 0 bugs críticos em produção
- [ ] 40-50% test coverage
- [ ] 100% das respostas usam HTTP_STATUS
- [ ] <10 ocorrências de `as any`
- [ ] 0 console.log informativos em prod build
- [ ] CI/CD passa em 100% das PRs

### Métricas Qualitativas
- [ ] Onboarding de novos devs < 4 horas
- [ ] Desenvolvedores reportam melhor DX
- [ ] Erros são debugáveis via logs estruturados
- [ ] Code reviews são mais rápidos

---

## 🔄 Processo de Rollback

Para cada mudança, antes de commitar:

```bash
# 1. Backup do arquivo original
cp server/routes.ts server/routes.ts.backup

# 2. Fazer mudança

# 3. Testar
npm run check
npm run build
npm run test
npm run dev # Teste manual

# 4. Se tudo OK, commit
git add server/routes.ts
git commit -m "..."

# 5. Se algo falhar, rollback
git checkout HEAD server/routes.ts
# ou
cp server/routes.ts.backup server/routes.ts
```

Para rollback de deploy:

```bash
# Vercel: Rollback via dashboard
# Ou via CLI:
vercel rollback <deployment-url>

# Git: Revert commit
git revert <commit-hash>
git push origin main
```

---

## 🧪 Validação de Cada Fase

### Checklist Pré-Commit
- [ ] `npm run check` passa (typecheck)
- [ ] `npm run build` completa (build)
- [ ] `npm run test` passa (testes)
- [ ] Teste manual no browser (smoke test)

### Checklist Pré-Deploy
- [ ] Todos os checks da CI passam
- [ ] Code review aprovado
- [ ] Staging deploy testado
- [ ] Rollback plan documentado

### Checklist Pós-Deploy
- [ ] Monitorar logs por 1 hora
- [ ] Verificar métricas (latência, erros)
- [ ] Smoke test em produção
- [ ] Comunicar time

---

## 📞 Comunicação e Handoff

### Documentação Necessária
- [ ] Atualizar CLAUDE.md com mudanças
- [ ] Atualizar README se aplicável
- [ ] Criar migration guide se breaking change
- [ ] Adicionar entry no CHANGELOG

### Handoff para Time
- [ ] Demo das mudanças (15 min)
- [ ] Q&A session
- [ ] Compartilhar este plano
- [ ] Pair programming na primeira PR

---

## 🎓 Lições Aprendidas

### Princípios deste Plano

1. ✅ **Incremental > Big Bang** - 1 mudança por vez
2. ✅ **ROI > Purismo** - Priorizar impacto real
3. ✅ **Test > Hope** - Validar antes de commitar
4. ✅ **Rollback Ready** - Sempre ter plano B
5. ✅ **Realista > Ambicioso** - Escopo executável

### Anti-Patterns Evitados

- ❌ "Vamos refatorar tudo de uma vez"
- ❌ "Precisamos de 100% coverage"
- ❌ "Modularizar porque é best practice"
- ❌ "Mudar tudo sem testes"
- ❌ "Deploy Friday afternoon"

---

## 📚 Referências

- **Análise Técnica:** `ANALISE_PROFUNDA_LINHA_POR_LINHA.md`
- **Otimizações Anteriores:** `OPTIMIZATION_REPORT.md`
- **Segurança:** `SECURITY_IMPROVEMENTS.md`
- **Guia do Projeto:** `CLAUDE.md`

---

**Última Atualização:** 2025-01-13
**Owner:** Dev Lead
**Revisão:** A cada 2 semanas

---

## 🚀 Quick Start

Para começar HOJE:

```bash
# 1. Criar branch
git checkout -b hotfix/streak-date-mutation

# 2. Corrigir bug (server/routes.ts:425)
# Trocar: checkDate.setDate(checkDate.getDate() - 1)
# Por: checkDate = new Date(checkDate.getTime() - 24*60*60*1000)

# 3. Validar
npm run check && npm run build

# 4. Commit
git add server/routes.ts
git commit -m "fix: corrigir mutação de Date no cálculo de streak"

# 5. Push
git push -u origin hotfix/streak-date-mutation

# 6. Abrir PR
gh pr create --title "Fix: Streak date mutation bug" --body "Refs: ANALISE_PROFUNDA_LINHA_POR_LINHA.md #1"
```

**Próximo passo:** Ver Fase 1 após merge do hotfix.
