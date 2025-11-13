# 🚀 Deploy Rápido - Vercel (15 minutos)

**Status:** ✅ Projeto pronto para deploy em produção

## 📋 Checklist Pré-Deploy

- [x] TypeScript compila sem erros (`npm run check`)
- [x] Build funciona (`npm run build`) - 7.25s
- [x] Health checks implementados (`/health`, `/health/ready`, `/health/integrations`)
- [x] Variáveis de ambiente documentadas (ver abaixo)
- [x] Commit criado e pronto para push

## 🎯 Deploy em 3 Passos

### Passo 1: Push para Repositório (1 min)

```bash
git push origin main
```

**Importante:** Se o Vercel já está conectado ao repositório, o deploy iniciará automaticamente após o push.

### Passo 2: Configurar Variáveis no Vercel (10 min)

Acesse: https://vercel.com/dashboard → Seu Projeto → **Settings** → **Environment Variables**

**Adicione as seguintes variáveis** (marque Production, Preview e Development):

#### Obrigatórias

| Nome | Valor | Observação |
|------|-------|------------|
| `GEMINI_API_KEY` | `AIzaSyBKBrBAZDzsxErgpezItOayUzRGUAy4oNg` | Google Gemini (NathIA chat) |
| `PERPLEXITY_API_KEY` | `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` | Perplexity AI (Mãe Valente search) |
| `SESSION_SECRET` | `48x0j7E+uD9rVz7f0kiWhmG6N5AJMIn2z5+he7HYzjg=` | Session encryption (32+ chars) |
| `NODE_ENV` | `production` | Fixo |

#### Supabase (API REST - não PostgreSQL ainda)

| Nome | Valor | Observação |
|------|-------|------------|
| `SUPABASE_URL` | `https://mnszbkeuerjcevjvdqme.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkxNjc4MSwiZXhwIjoyMDc3NDkyNzgxfQ.zOb5c5HhJhOF3-tWAkfo9HxKoUpA2JbsKFS939IPnd4` | Service role key |
| `VITE_SUPABASE_URL` | `https://mnszbkeuerjcevjvdqme.supabase.co` | Frontend URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueo` | Anon public key |

#### Opcionais (adicionar depois)

| Nome | Valor | Quando Adicionar |
|------|-------|------------------|
| `DATABASE_URL` | `postgresql://postgres.mnszbkeuerjcevjvdqme:qmbDYwmQzDWzkOmO@aws-0-us-east-1.pooler.supabase.com:6543/postgres` | Após reativar Supabase PostgreSQL |
| `OPENAI_API_KEY` | `(já configurado localmente)` | Se precisar usar OpenAI |
| `CLAUDE_API_KEY` | `(já configurado localmente)` | Se precisar usar Claude |
| `EXPO_PUBLIC_SENTRY_DSN` | `https://7c54483e2021e1b7bae427e8940d6992@o4510299490746368.ingest.us.sentry.io/4510317278134272` | Para error tracking |

**⚠️ IMPORTANTE:**
- Não adicione `DATABASE_URL` ainda (Supabase PostgreSQL pausado)
- O app funcionará com MemStorage (dados em memória)
- Para persistência, reative o Supabase depois do deploy

### Passo 3: Validar Deploy (4 min)

Após o deploy completar no Vercel (~2-3 min), teste:

#### 1. Health Checks

```bash
# URL do seu deploy
DEPLOY_URL=https://seu-projeto.vercel.app

# Status básico
curl $DEPLOY_URL/health
# Esperado: {"status":"ok","timestamp":"...","version":"1.0.0"}

# Readiness check
curl $DEPLOY_URL/health/ready
# Esperado: {"status":"healthy","checks":{...},"timestamp":"..."}

# Integrações
curl $DEPLOY_URL/health/integrations
# Esperado: {"database":false,"supabase":true,"gemini":true,"perplexity":true,...}
```

#### 2. Testes Manuais

Acesse: `https://seu-projeto.vercel.app`

- [ ] Página inicial carrega
- [ ] **Registrar/Login** funciona
- [ ] **Dashboard** exibe conteúdo
- [ ] **NathIA** (chat) responde (testa Gemini API)
- [ ] **Mãe Valente** (search) funciona (testa Perplexity API)
- [ ] **Hábitos** podem ser criados
- [ ] **Mundo Nath** exibe posts
- [ ] **Refúgio Nath** (community) carrega

## 📊 Métricas Esperadas

### Performance
- **Build Time:** ~7-10s (Vite + esbuild)
- **Bundle Size:**
  - Backend: ~182kb
  - Frontend: ~480kb (inicial), lazy chunks menores
- **Health Check Response:** <50ms

### Funcionalidades
- ✅ AI Chat (NathIA) - Gemini 2.5 Flash
- ✅ AI Search (Mãe Valente) - Perplexity
- ✅ Habit tracking com gamificação (XP, streaks, achievements)
- ✅ Community posts, comments, reactions
- ✅ Educational content (Mundo Nath)
- ⏸️ Database persistence (MemStorage temporário)

## 🔧 Troubleshooting

### Build falha no Vercel

**Erro:** `Type errors` ou `Module not found`

**Solução:**
1. Verifique logs completos no Vercel
2. Teste localmente: `npm run build`
3. Confirme `NODE_ENV=production` nas variáveis

### AI endpoints retornam 500

**Erro:** `Error calling Gemini/Perplexity API`

**Solução:**
1. Verifique API keys no Vercel (Settings → Environment Variables)
2. Teste `/health/integrations` - deve mostrar `gemini:true`, `perplexity:true`
3. Redeploy após adicionar/corrigir keys

### Health check retorna "degraded"

**Possíveis causas:**
- `storage: false` → Normal (MemStorage sempre healthy, erro seria em queries)
- `gemini: false` → Falta GEMINI_API_KEY
- `perplexity: false` → Falta PERPLEXITY_API_KEY

**Solução:** Adicione as keys faltantes e redeploy

### Dados não persistem entre deploys

**Esperado:** MemStorage (dados em memória) reseta a cada deploy.

**Solução definitiva:**
1. Acesse: https://supabase.com/dashboard/project/mnszbkeuerjcevjvdqme
2. Reative o projeto (clique em qualquer página, aguarde 10-30s)
3. Adicione `DATABASE_URL` no Vercel:
   ```
   postgresql://postgres.mnszbkeuerjcevjvdqme:qmbDYwmQzDWzkOmO@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. Redeploy ou aguarde próximo deploy automático

## 📚 Próximos Passos Pós-Deploy

### Curto Prazo (Esta Semana)
1. ✅ Validar todos os endpoints manualmente
2. ⏸️ Reativar Supabase PostgreSQL
3. ⏸️ Aplicar schema no banco (`npm run db:push` localmente)
4. ⏸️ Adicionar `DATABASE_URL` no Vercel

### Médio Prazo (1-2 Semanas)
1. Configurar monitoring (Vercel Analytics + Sentry)
2. Criar buckets Supabase Storage (avatars, content)
3. Implementar testes E2E básicos
4. Documentar APIs (Swagger/OpenAPI)

### Longo Prazo (1-2 Meses)
1. Code splitting otimizado (reduzir chunk React de 480kb)
2. Implementar PWA (Service Worker)
3. Redis cache (Upstash) para Q&A responses
4. Testes automatizados (40-50% coverage)

## 🎉 Deploy Completo!

**URL de Produção:** `https://seu-projeto.vercel.app`

**Logs:** https://vercel.com/dashboard → Functions → Logs

**Monitoring:** https://vercel.com/dashboard → Analytics

---

**Última Atualização:** 2025-01-13
**Build Status:** ✅ Deploy-ready
**Database:** ⏸️ MemStorage (Supabase pausado)
