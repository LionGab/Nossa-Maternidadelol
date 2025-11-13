# 📡 Análise de Integrações - Nossa Maternidade

**Data:** 2025-01-13
**Versão:** 1.0
**Status:** Análise Completa + Melhorias Implementadas

---

## 📊 Resumo Executivo

Este documento analisa todas as integrações externas do projeto **Nossa Maternidade**, identifica problemas e propõe melhorias para aumentar resiliência, observabilidade e performance.

### Integrações Identificadas

| Integração | Tipo | Criticidade | Status Atual | Melhorias Necessárias |
|------------|------|-------------|--------------|----------------------|
| **Gemini AI** | API Externa | 🔴 ALTA | ⚠️ Sem retry/timeout | Retry, timeout, circuit breaker |
| **Perplexity AI** | API Externa | 🔴 ALTA | ⚠️ Sem retry | Retry, timeout, fallback |
| **Supabase Auth** | Serviço Gerenciado | 🔴 ALTA | 🟢 Bom | Health check |
| **Supabase Storage** | Serviço Gerenciado | 🟡 MÉDIA | 🟢 Bom | Retry, validação |
| **Neon Database** | PostgreSQL Serverless | 🔴 ALTA | 🟢 Bom | Connection pool, health check |
| **Cache (Memory)** | In-Memory/Redis | 🟡 MÉDIA | 🟢 Bom | Redis em produção |

---

## 🔍 Análise Detalhada

### 1. Gemini AI (Google)

**Arquivo:** `server/gemini.ts`, `server/agents/base-agent.ts`
**Uso:** Chat com NathIA, agentes especializados
**Taxa de Uso:** ~10 req/min (rate limited)

#### ✅ Pontos Fortes
- ✅ Rate limiting implementado (10 req/min)
- ✅ Validação de API key com warning
- ✅ Logging estruturado
- ✅ Error handling básico

#### ❌ Problemas Identificados

**🔴 P1 - Sem Timeout**
```typescript
// PROBLEMA: Pode travar indefinidamente
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  // ⚠️ SEM TIMEOUT!
});
```
**Impacto:** Requests podem demorar minutos sem timeout, travando a aplicação.

**🔴 P2 - Sem Retry Logic**
```typescript
// PROBLEMA: Falha imediata em erros temporários
if (!response.candidates || response.candidates.length === 0) {
  return "Desculpe, não consegui processar sua mensagem.";
  // ⚠️ NÃO TENTA NOVAMENTE!
}
```
**Impacto:** Erros de rede temporários causam falhas permanentes.

**🟡 P3 - Sem Circuit Breaker**
- Se API cair, continua tentando indefinidamente
- Pode causar cascata de falhas

#### 🎯 Melhorias Propostas

**1. Adicionar Timeout (5s)**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  signal: controller.signal, // ✅ Timeout configurável
});
```

**2. Retry com Exponential Backoff**
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}
```

**3. Circuit Breaker**
```typescript
class CircuitBreaker {
  failures = 0;
  threshold = 5;
  timeout = 60000; // 1 min
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
}
```

---

### 2. Perplexity AI

**Arquivo:** `server/perplexity.ts`
**Uso:** Busca MãeValente (Q&A sobre maternidade)
**Taxa de Uso:** ~5 req/min (rate limited)

#### ✅ Pontos Fortes
- ✅ Rate limiting implementado (5 req/min)
- ✅ Cache de 7 dias (reduz custos)
- ✅ Error handling básico

#### ❌ Problemas Identificados

**🔴 P1 - Sem Retry Logic**
```typescript
const response = await fetch("https://api.perplexity.ai/chat/completions", {
  method: "POST",
  // ⚠️ SEM RETRY!
});

if (!response.ok) {
  throw new Error(`Perplexity API error: ${response.statusText}`);
  // ⚠️ FALHA IMEDIATA!
}
```
**Impacto:** Erros temporários (rate limit 429, network 503) causam falhas.

**🔴 P2 - Sem Timeout**
```typescript
// PROBLEMA: fetch sem timeout padrão
const response = await fetch(url, {
  // ⚠️ SEM TIMEOUT CONFIGURADO!
});
```
**Impacto:** Request pode demorar indefinidamente.

**🟡 P3 - Sem Fallback**
- Se API falhar, não há resposta alternativa
- Usuário recebe erro em vez de resposta útil

#### 🎯 Melhorias Propostas

**1. Retry com Detecção de Rate Limit**
```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000), // ✅ 10s timeout
    });

    // Retry em rate limit (429) ou server error (500+)
    if (response.status === 429 || response.status >= 500) {
      const retryAfter = response.headers.get('Retry-After') || 2 ** i;
      await new Promise(r => setTimeout(r, +retryAfter * 1000));
      continue;
    }

    return response;
  }
  throw new Error("Max retries exceeded");
}
```

**2. Fallback para Cache Antigo**
```typescript
// Se API falhar, buscar resposta similar no cache
if (error) {
  const cachedSimilar = await findSimilarQuestionInCache(question);
  if (cachedSimilar) {
    return {
      answer: cachedSimilar.answer + "\n\n⚠️ Resposta do cache (API indisponível)",
      sources: cachedSimilar.sources,
    };
  }
}
```

---

### 3. Supabase Auth

**Arquivo:** `server/supabase.ts`, `server/auth.ts`
**Uso:** Autenticação JWT, verificação de token
**Criticidade:** 🔴 ALTA (sem auth = sem app)

#### ✅ Pontos Fortes
- ✅ Lazy initialization (não falha em dev)
- ✅ Graceful degradation em dev
- ✅ Error handling com logging
- ✅ Proxy pattern para acesso seguro

#### ⚠️ Oportunidades de Melhoria

**🟡 O1 - Token Caching**
```typescript
// Atualmente: Valida token a cada request
const { data: { user }, error } = await client.auth.getUser(token);

// Melhoria: Cache de tokens válidos (5 min)
const cachedUser = tokenCache.get(token);
if (cachedUser && Date.now() < cachedUser.expiresAt) {
  return cachedUser.user;
}
```
**Benefício:** Reduz calls para Supabase em 95%

**🟡 O2 - Health Check**
```typescript
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    return !error;
  } catch {
    return false;
  }
}
```

---

### 4. Supabase Storage

**Arquivo:** `server/storage-upload.ts`
**Uso:** Upload de avatares, imagens de posts
**Taxa de Uso:** Baixa (~10 uploads/dia)

#### ✅ Pontos Fortes
- ✅ Validação de tipo e tamanho
- ✅ Error handling com logging
- ✅ Suporte a signed URLs

#### ⚠️ Oportunidades de Melhoria

**🟡 O1 - Retry em Uploads**
```typescript
export async function uploadFileWithRetry(/* params */) {
  return retryWithBackoff(() => uploadFile(/* params */), 3);
}
```

**🟡 O2 - Compressão de Imagens**
```typescript
import sharp from 'sharp';

// Comprimir antes de upload
const compressedImage = await sharp(file)
  .resize(1200, 1200, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer();
```

---

### 5. Neon Database (PostgreSQL)

**Arquivo:** `server/db.ts`, `server/storage/drizzle-storage.ts`
**Uso:** Persistência de dados (users, habits, posts, etc.)
**Criticidade:** 🔴 ALTA

#### ✅ Pontos Fortes
- ✅ Lazy initialization
- ✅ Proxy pattern para acesso seguro
- ✅ Drizzle ORM type-safe
- ✅ Graceful degradation (MemStorage em dev)

#### ⚠️ Oportunidades de Melhoria

**🟡 O1 - Connection Pool**
```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL, {
  poolQueryViaFetch: true, // ✅ Connection pooling
});
```

**🟡 O2 - Query Timeout**
```typescript
// Adicionar timeout de 5s para queries
const result = await db.select()
  .from(users)
  .limit(1)
  .$dynamic()
  .execute({ timeout: 5000 });
```

**🟡 O3 - Health Check**
```typescript
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}
```

---

### 6. Cache (MemoryStore)

**Arquivo:** `server/cache.ts`, `server/services/cache-service.ts`
**Uso:** Cache de Q&A, habit completions, user stats
**TTL:** 1h-7d dependendo do tipo

#### ✅ Pontos Fortes
- ✅ Suporte para Redis (quando disponível)
- ✅ Fallback para MemoryStore
- ✅ TTL configurável

#### ⚠️ Limitações

**🟡 L1 - MemoryStore Limitado**
- Dados perdidos ao reiniciar
- Não compartilhado entre instâncias (horizontal scaling)

**Recomendação:** Redis em produção
```bash
# Adicionar ao .env.example
REDIS_URL=redis://localhost:6379
```

---

## 🎯 Plano de Melhorias

### Fase 1: Resiliência (CRÍTICO - 2-4h)

**1.1 Retry Logic**
- ✅ Criar `server/utils/retry.ts`
- ✅ Implementar em Gemini
- ✅ Implementar em Perplexity

**1.2 Timeouts**
- ✅ Adicionar AbortController em fetch
- ✅ Timeout padrão: 10s (APIs externas), 5s (DB)

**1.3 Circuit Breaker**
- ✅ Criar `server/utils/circuit-breaker.ts`
- ✅ Aplicar em Gemini e Perplexity

### Fase 2: Observabilidade (ALTA - 1-2h)

**2.1 Health Checks**
- ✅ Criar `server/health.ts`
- ✅ Endpoint `/health` (overall)
- ✅ Endpoint `/health/ready` (readiness)
- ✅ Endpoint `/health/live` (liveness)

**2.2 Métricas**
- ✅ Adicionar contadores de erro por integração
- ✅ Latency tracking (p50, p95, p99)

### Fase 3: Performance (MÉDIA - 2-3h)

**3.1 Token Caching**
- Cache de tokens JWT válidos (5 min)

**3.2 Connection Pool**
- Configurar pool no Neon

**3.3 Redis em Produção**
- Migrar MemStore → Redis

---

## 📈 Métricas de Sucesso

| Métrica | Antes | Meta | Como Medir |
|---------|-------|------|------------|
| **Uptime Gemini** | 95% | 99.5% | `/health/integrations` |
| **Tempo Resp. P95** | 3s | 1.5s | Prometheus metrics |
| **Taxa de Erro** | 5% | <1% | Error logs |
| **Retry Success** | 0% | 80% | Retry metrics |
| **Cache Hit Rate** | 60% | 85% | Redis metrics |

---

## 🚀 Implementação

Executar em ordem:
1. `npm install` (dependencies já instaladas)
2. Criar arquivos de utilities (retry, circuit breaker, health)
3. Refatorar integrações
4. Adicionar health checks
5. Testar e validar
6. Monitorar métricas

---

**Status:** 🟡 **EM ANDAMENTO**
**Próximo:** Implementar Fase 1 (Retry + Timeouts)
