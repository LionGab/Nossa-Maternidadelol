# Plano de Integração: Projeto Web (Next.js) → App Mobile

**Data**: 2025-11-10
**Status**: 🚀 PRONTO PARA IMPLEMENTAÇÃO
**Prioridade**: CRÍTICA

---

## 📊 RESUMO EXECUTIVO

O projeto Next.js web baixado contém **16 rotas API** com features avançadas que podem ser integradas ao seu app mobile como **Supabase Edge Functions** (Deno). Estas features adicionam:

- ✅ **Triagem de DPP** (Depressão Pós-Parto) com múltiplas IAs
- ✅ **Multi-AI Chat Strategy** (Claude + GPT-4 + Perplexity)
- ✅ **Gamification Manager** (levantada do sistema)
- ✅ **Sentiment Analysis Avançada**
- ✅ **Semantic Search** com Memory Management
- ✅ **Postpartum Screening** (EPDS/DSM-5)

**Estimado**: 40-60 horas de implementação
**Impacto**: Transforma app de MVP para **produção profissional de saúde**

---

## 🏗️ ARQUITETURA SUGERIDA

```
App Mobile (React Native)
    ↓
Supabase Client SDK
    ↓
Edge Functions (Deno) ← [Migrar de Next.js]
    ↓
PostgreSQL + pgvector
    ↓
AI Services (Claude, Gemini, Perplexity)
```

**Mudança**: Em vez de Next.js running em Vercel, usar Supabase Edge Functions (mais barato, integrado, serverless).

---

## 📋 FEATURES A INTEGRAR (PRIORIZADO)

### 🔴 CRÍTICO (Implementar Primeira)

#### 1. **Postpartum Depression Screening (DPP)**

- **Arquivo Web**: `app/api/multi-ai/postpartum-screening/route.ts`
- **Tecnologia**: Claude Sonnet 4 + Gemini 2.0 Flash
- **O que faz**:
  - Coleta histórico de sentiment analysis e conversas
  - Claude faz análise psicológica profunda (EPDS + DSM-5)
  - Gemini identifica padrões temporais
  - Gera score de risco (0-30)
  - Cria alertas se risco > 13 ou necessita profissional

- **Implementação Mobile**:

  ```typescript
  // supabase/functions/postpartum-screening/index.ts
  // Similar ao route.ts, mas em Deno
  ```

- **Benefícios**:
  - ⚠️ Detecção automática de DPP
  - 🚑 Alerta para profissional se necessário
  - 📊 Triagem baseada em escala validada (EPDS)

- **Prioridade**: 🔴 MÁXIMA (saúde mental crítica)

---

#### 2. **Multi-AI Chat Strategy**

- **Arquivo Web**: `app/api/multi-ai/chat/route.ts` + `components/multi-ai-chat.tsx`
- **Tecnologia**:
  - **Modo Empático**: Claude Sonnet 4 (suporte emocional)
  - **Modo Geral**: GPT-4 (conversação)
  - **Modo Pesquisa**: Perplexity (busca com fontes)

- **O que faz**:
  - Oferece 3 modos de IA especializados
  - Contextualiza com dados da usuária (fase, análise emocional)
  - Streaming de respostas em tempo real

- **Implementação Mobile**:
  - Integrar com seu `NathiaChat.tsx` existente
  - Adicionar botão para escolher modo (já tem Design System)
  - Usar Gemini como default (mais barato), Claude como premium

- **Prioridade**: 🟡 ALTA (melhora qualidade chat)

---

#### 3. **Sentiment Analysis Avançada**

- **Arquivo Web**: `app/api/multi-ai/sentiment/route.ts`
- **Tecnologia**: Claude + Gemini (análise combinada)
- **O que faz**:
  - Analisa respostas do onboarding/questionário
  - Identifica sinais de alerta (DPP, ansiedade, burnout)
  - Gera recomendações personalizadas
  - Nível de risco automático

- **Implementação Mobile**:
  - Após Onboarding 5 Steps → Chamar análise sentimento
  - Salvar no banco para trending histórico

- **Prioridade**: 🟡 ALTA (base para DPP screening)

---

### 🟡 IMPORTANTE (Implementar Segunda)

#### 4. **Semantic Search + Memory Management**

- **Arquivo Web**: `app/api/mcp/semantic-search/route.ts` + `lib/mcp/memory-manager.ts`
- **O que faz**:
  - Busca semântica em histórico de conversas
  - Memory context para IA (não precisa repetir contexto)
  - Filtra por threshold de similaridade (70%)

- **Prioridade**: 🟡 MÉDIA (melhora qualidade conversas)

---

#### 5. **Gamification Manager**

- **Arquivo Web**: `lib/gamification/gamification-manager.ts`
- **O que faz**:

  ```typescript
  // Gerencia:
  // - Pontos por atividade (check_in: 10, journal: 20, etc)
  // - Levels automáticos
  // - Streaks com multiplicadores
  // - Achievements desbloqueáveis
  // - Challenges semanais
  ```

- **Use**: Copie direto para seu projeto mobile (TypeScript puro)

- **Prioridade**: 🟡 MÉDIA (seu HabitsScreen já tem lógica base)

---

### 🟢 NICE-TO-HAVE (Implementar Terceira)

#### 6. **Conversational Onboarding**

- **Arquivo**: `app/api/mcp/conversational-onboarding/route.ts`
- **O que faz**: Onboarding via chat em vez de formulário
- **Prioridade**: Verde (boa UX mas não crítico)

#### 7. **Recipe Generation**

- **Arquivo**: `app/api/generate-recipes/route.ts`
- **O que faz**: Gera receitas saudáveis personalizadas
- **Prioridade**: Verde (feature extra)

#### 8. **Maternal News Curation**

- **Arquivo**: `app/api/maternal-news/route.ts`
- **O que faz**: Notícias sobre maternidade personalizadas
- **Prioridade**: Verde (complementa MãeValente)

---

## 🔧 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Setup (2h)

- [ ] Criar pasta `supabase/functions/postpartum-screening`
- [ ] Criar pasta `supabase/functions/sentiment-analysis`
- [ ] Setup de env vars (ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY)
- [ ] Deploy funciona localmente com `supabase functions serve`

### Fase 2: Postpartum Screening (8h)

- [ ] Migrar `postpartum-screening/route.ts` → Deno
- [ ] Testar com dados fake
- [ ] Integrar no mobile (novo botão em ProfileScreen)
- [ ] Criar tabelas no Supabase (`postpartum_screenings`, `health_alerts`)

### Fase 3: Multi-AI Chat (6h)

- [ ] Integrar "modo empático" existente no NathiaChat
- [ ] Adicionar botão para trocar modo (Claude vs Gemini)
- [ ] Testar streaming de respostas

### Fase 4: Sentiment Analysis (4h)

- [ ] Migrar para Edge Function
- [ ] Chamar após Onboarding 5 Steps
- [ ] Visualizar análise no HomeScreen

### Fase 5: Gamification Manager (4h)

- [ ] Copiar TypeScript direto (reutilizável)
- [ ] Integrar com seu HabitsScreen
- [ ] Testar pontos/levels/streaks

### Fase 6: Testing & Polish (4h)

- [ ] Testes E2E do fluxo completo
- [ ] Validação de segurança (RLS, input validation)
- [ ] Performance tuning

---

## 📊 ARQUIVO ANTES VS DEPOIS

### ❌ ANTES (Projeto Atual)

```
NathiaChat.tsx
  ├─ Gemini 2.0 Flash + Memory
  ├─ Moderação 3 camadas
  └─ Sem análise de sentimento integrada

HomeScreen.tsx
  ├─ DailyInsightCard (não integrada)
  └─ Sem detecção de DPP

HabitsScreen.tsx
  ├─ Gamificação backend
  └─ UI não otimizada
```

### ✅ DEPOIS (Com Integrações)

```
NathiaChat.tsx
  ├─ 3 Modos: Empático (Claude) | Geral (GPT) | Pesquisa (Perplexity)
  ├─ Semantic memory search
  ├─ Sentiment analysis inline
  └─ Moderação + detecção DPP automática

HomeScreen.tsx
  ├─ DailyInsightCard ✅ integrada
  ├─ Health Alerts (DPP warning)
  ├─ Sentiment trends (gráfico)
  └─ Recomendações personalizadas

HabitsScreen.tsx
  ├─ GamificationManager ✅ integrada
  ├─ Points/Levels/Streaks UI
  ├─ Weekly Challenges
  └─ Achievement animations
```

---

## 🔐 SEGURANÇA & COMPLIANCE

### ✅ Já Implementado

- RLS em todas as tabelas
- Input validation
- Encryption de dados sensíveis
- Audit logging

### ⚠️ Adicionar

- [ ] LGPD compliance (dados sensíveis de saúde)
- [ ] Consent forms para análise emocional
- [ ] Data retention policy (histórico DPP)
- [ ] Emergency contact list (se risco alto)

---

## 💰 CUSTOS API (Estimado/Mês)

| IA Service          | Uso Est.            | Custo          |
| ------------------- | ------------------- | -------------- |
| **Gemini**          | 10k chats           | $0 (free tier) |
| **Claude Sonnet 4** | 5k DPP screenings   | $80            |
| **GPT-4**           | 3k chats modo geral | $150           |
| **Perplexity**      | 2k buscas           | $40            |
| **Supabase**        | Edge Func + Storage | $25            |
| **Total**           | -                   | **~$295/mês**  |

_Obs: Gemini é gratuito com 30k requisições/mês. Considerar usar apenas Gemini + Claude para reduzir custos._

---

## 📚 ARQUIVOS A MIGRAR

```
FROM Web (Next.js) → TO Mobile (Supabase Edge Functions)

app/api/multi-ai/postpartum-screening/route.ts
  → supabase/functions/postpartum-screening/index.ts

app/api/multi-ai/sentiment/route.ts
  → supabase/functions/sentiment-analysis/index.ts

app/api/multi-ai/chat/route.ts
  → supabase/functions/multi-ai-chat/index.ts (complementa nathia-chat)

app/api/mcp/semantic-search/route.ts
  → supabase/functions/semantic-search/index.ts

lib/gamification/gamification-manager.ts
  → src/lib/gamification/gamification-manager.ts (cópia direta TS)

lib/mcp/memory-manager.ts
  → src/lib/mcp/memory-manager.ts (cópia direta TS)

components/multi-ai-chat.tsx
  → Integrar logica no NathiaChat.tsx (UI já existe)
```

---

## 🎯 NEXT STEPS

### Imediatamente:

1. ✅ Analisar este documento
2. ✅ Revisão de custo-benefício
3. ✅ Priorizar features (DPP é crítica)

### Semana 1:

- [ ] Setup das Edge Functions
- [ ] Testes locais com `supabase functions serve`
- [ ] Deploy da DPP screening (CRÍTICO)

### Semana 2:

- [ ] Multi-AI Chat integration
- [ ] Sentiment Analysis
- [ ] Gamification Manager

### Semana 3:

- [ ] Testing completo
- [ ] Validação com psicólogos (DPP é sensível!)
- [ ] Go live

---

## 🚀 CONCLUSÃO

Este projeto web tem **ouro puro** para seu app. Principalmente:

1. **DPP Screening** - Transforma seu app em ferramenta de triagem de saúde mental
2. **Multi-AI Strategy** - Oferece opções de IA especializadas
3. **Sentiment Analysis** - Base para detecção de risco automática

**Investimento**: 40-60h de dev
**Retorno**: App vai de MVP para **Plataforma de Saúde Mental Validada**

---

_Documento gerado por Claude Code - 2025-11-10_
