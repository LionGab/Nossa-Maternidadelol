# 🚀 Plano de Ação - Deploy em Produção
## Nossa Maternidade

**Data:** 2025-01-13
**Status Atual:** Projeto pronto para deploy (código estável, workflows configurados)
**Plataforma Escolhida:** Vercel (já configurado)
**Domínio Alvo:** www.nossamaternidade.com.br

---

## 📊 Status Atual do Projeto

### ✅ O que já está pronto:
- [x] Código completo e funcional (frontend React + backend Express)
- [x] Configuração do Vercel (`vercel.json` + `api/index.ts`)
- [x] GitHub Actions (CI/CD completo com 9 workflows)
- [x] Scripts de build otimizados (`npm run build`)
- [x] Segurança implementada (rate limiting, validation, helmet)
- [x] Logging estruturado (Pino)
- [x] Otimizações de performance (N+1 resolvido, paginação)
- [x] Schema de banco de dados definido (Drizzle ORM)
- [x] Testes configurados (Vitest)

### ⚠️ O que precisa ser feito:
- [ ] Criar/configurar banco de dados PostgreSQL em produção
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Executar deploy inicial
- [ ] Rodar migrations no banco de produção
- [ ] Configurar DNS do domínio
- [ ] Validar aplicação em produção
- [ ] Configurar monitoramento

---

## 🎯 Plano de Execução (6 Fases)

### **FASE 0: Pré-requisitos (15 min)**
Garantir que temos todos os acessos e contas necessárias.

#### Checklist:
- [ ] **Conta GitHub** com acesso ao repositório `LionGab/Nossa-Maternidadelol`
- [ ] **Conta Vercel** criada (https://vercel.com/signup)
- [ ] **Conta Neon** ou **Supabase** para PostgreSQL (grátis)
- [ ] **API Keys** obtidas:
  - [ ] Gemini API (https://aistudio.google.com/app/apikey)
  - [ ] Perplexity API (https://www.perplexity.ai/settings/api)
- [ ] **Acesso ao domínio** nossamaternidade.com.br (Registro.br)
- [ ] **Git instalado** localmente
- [ ] **Node.js >= 20.0.0** instalado

---

### **FASE 1: Setup do Banco de Dados (20 min)**

#### Opção A: Neon PostgreSQL (Recomendado)

**Por quê?**
- ✅ Serverless (escala automaticamente)
- ✅ 0.5GB grátis permanentemente
- ✅ Branching de database (perfeito para PRs)
- ✅ Baixa latência global

**Passos:**

```bash
# 1. Criar conta em Neon
# Acesse: https://console.neon.tech/signup
# Login com GitHub (mais rápido)

# 2. Criar novo projeto
# Nome: nossa-maternidade
# Região: US East (Ohio) - boa latência para Brasil
# PostgreSQL version: 16 (latest)

# 3. Copiar connection string
# Dashboard → Connection Details → Connection String
# Exemplo: postgresql://user:password@ep-name.us-east-2.aws.neon.tech/neondb?sslmode=require

# 4. Salvar em .env.production (NÃO COMMITAR!)
DATABASE_URL="postgresql://[COPIAR_AQUI]"
```

**Connection string estará neste formato:**
```
postgresql://neondb_owner:AbcXyz123@ep-aged-frost-a1b2c3d4.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Opção B: Supabase PostgreSQL

```bash
# 1. Acesse: https://supabase.com/dashboard
# 2. Create New Project → nossa-maternidade
# 3. Region: East US (us-east-1)
# 4. Database Password: [gerar senha forte]
# 5. Settings → Database → Connection String → URI
# 6. Copiar e adicionar em .env.production
```

**⚠️ Importante:**
- Neon é melhor para serverless (sem idle time)
- Supabase oferece mais recursos (auth, storage, realtime)
- Para este projeto, **Neon é recomendado** (mais leve)

---

### **FASE 2: Configurar Variáveis de Ambiente Localmente (10 min)**

```bash
# 1. Criar arquivo .env.production na raiz do projeto
# (Este arquivo NÃO deve ser commitado - já está no .gitignore)

# 2. Copiar conteúdo do .env.example
cp .env.example .env.production

# 3. Preencher variáveis obrigatórias:
```

**Arquivo .env.production (modelo):**
```bash
# ============================================
# PRODUCTION ENVIRONMENT
# ============================================

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Session Security (GERAR NOVO!)
SESSION_SECRET="[EXECUTAR: openssl rand -base64 32]"

# AI APIs (obter chaves nos links abaixo)
GEMINI_API_KEY="AIzaSy..."
PERPLEXITY_API_KEY="pplx-..."

# Supabase (opcional - se usar Supabase em vez de Neon)
EXPO_PUBLIC_SUPABASE_URL="https://mnszbkeuerjcevjvdqme.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."

# Environment
NODE_ENV=production

# Features (habilitar na produção)
EXPO_PUBLIC_ENABLE_AI_FEATURES=true
EXPO_PUBLIC_ENABLE_GAMIFICATION=true
EXPO_PUBLIC_ENABLE_ANALYTICS=false
```

**Gerar SESSION_SECRET:**
```bash
# Execute este comando e copie o resultado:
openssl rand -base64 32

# Ou use o script do projeto:
npm run generate:session-secret
```

**Onde obter API Keys:**

| Serviço | URL | Documentação |
|---------|-----|--------------|
| **Gemini** | https://aistudio.google.com/app/apikey | Free tier: 60 req/min |
| **Perplexity** | https://www.perplexity.ai/settings/api | $5 de crédito grátis |
| **Neon** (opcional) | https://console.neon.tech/app/settings/api-keys | Para database branching |

---

### **FASE 3: Deploy na Vercel (30 min)**

#### 3.1. Conectar Repositório GitHub

```bash
# 1. Acesse https://vercel.com/new
# 2. Clique em "Import Git Repository"
# 3. Selecione: LionGab/Nossa-Maternidadelol
# 4. Authorize Vercel no GitHub (se solicitado)
```

#### 3.2. Configurar Projeto

**Framework Preset:** Other (Vercel detectará automaticamente)

**Build Settings:**
```bash
Build Command:    npm run build
Output Directory: dist/public
Install Command:  npm install
```

**Root Directory:** `.` (raiz do projeto)

#### 3.3. Adicionar Variáveis de Ambiente na Vercel

**⚠️ CRÍTICO: Todas as variáveis devem ser adicionadas ANTES do primeiro deploy!**

**Caminho:** Project Settings → Environment Variables

**Adicionar uma por uma:**

```bash
# OBRIGATÓRIAS (Produção):
DATABASE_URL              = postgresql://user:password@...
SESSION_SECRET            = [resultado do openssl rand -base64 32]
GEMINI_API_KEY           = AIzaSy...
PERPLEXITY_API_KEY       = pplx-...
NODE_ENV                 = production

# FEATURES:
EXPO_PUBLIC_ENABLE_AI_FEATURES      = true
EXPO_PUBLIC_ENABLE_GAMIFICATION     = true
EXPO_PUBLIC_ENABLE_ANALYTICS        = false

# SUPABASE (se usar Supabase em vez de Neon):
EXPO_PUBLIC_SUPABASE_URL            = https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY       = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY           = eyJhbGci...
VITE_SUPABASE_URL                   = https://mnszbkeuerjcevjvdqme.supabase.co
VITE_SUPABASE_ANON_KEY              = eyJhbGci...
```

**Scope das variáveis:**
- Production ✅
- Preview ✅ (opcional, pode usar variáveis diferentes)
- Development ❌ (não necessário)

#### 3.4. Executar Deploy

```bash
# Opção 1: Via Dashboard Vercel
# Clique em "Deploy" após configurar variáveis

# Opção 2: Via CLI (mais controle)
npm install -g vercel
vercel login
vercel --prod
```

**O que acontece durante o deploy:**
1. Vercel clona o repositório
2. Instala dependências (`npm install`)
3. Executa `npm run build`:
   - Vite compila o React (client → dist/public)
   - esbuild compila o Express (server → dist/index.js)
4. Configura serverless functions (api/index.ts)
5. Deploy na edge network global
6. Gera URL temporária: `https://nossa-maternidadelol-xxx.vercel.app`

**Tempo estimado:** 2-4 minutos

---

### **FASE 4: Rodar Migrations no Banco de Produção (10 min)**

**⚠️ IMPORTANTE: Só executar APÓS deploy bem-sucedido!**

#### 4.1. Configurar DATABASE_URL localmente

```bash
# Adicionar DATABASE_URL de produção no .env.production
# (mesmo valor usado na Vercel)

# Exemplo .env.production:
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### 4.2. Executar Migrations

```bash
# Opção 1: Push direto (desenvolvimento/primeira vez)
npm run db:push

# Opção 2: Migrations versionadas (produção ideal)
npm run db:generate  # Gera SQL migration files
npm run db:migrate   # Aplica migrations

# Verificar sucesso:
# ✅ Deve exibir: "Pushing schema changes to database..."
# ✅ Sem erros de conexão
# ✅ Tabelas criadas no Neon/Supabase Dashboard
```

#### 4.3. Verificar Schema no Database

**Neon:**
```bash
# Acesse: https://console.neon.tech
# → Seu projeto → Tables
# Deve listar ~20 tabelas: users, profiles, habits, posts, etc.
```

**Supabase:**
```bash
# Acesse: https://supabase.com/dashboard
# → Table Editor
# Verificar se todas as tabelas foram criadas
```

#### 4.4. (Opcional) Popular com Dados de Exemplo

```bash
# Se quiser dados iniciais (seed):
# Criar arquivo: db/seed.ts

import { db } from './server/db';
import { users, profiles, habits } from '@shared/schema';

async function seed() {
  // Criar usuário admin
  await db.insert(users).values({
    email: 'admin@nossamaternidade.com.br',
    // ... outros dados
  });

  console.log('✅ Seed completo!');
}

seed();
```

```bash
# Executar:
NODE_ENV=production npx tsx db/seed.ts
```

---

### **FASE 5: Configurar Domínio Personalizado (60 min)**

#### 5.1. Adicionar Domínio na Vercel

```bash
# 1. Acesse: https://vercel.com/dashboard
# 2. Selecione seu projeto → Settings → Domains
# 3. Clique em "Add Domain"
# 4. Digite: nossamaternidade.com.br
# 5. Clique em "Add"
# 6. Repita para: www.nossamaternidade.com.br
```

**Vercel vai solicitar configurar DNS. Copiar valores exibidos!**

#### 5.2. Configurar DNS no Registro.br

**Login em:** https://registro.br/login

**Navegue:** Painel de Controle → DNS → Adicionar Registros

**Configuração DNS completa:**

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| **A** | @ | `76.76.19.19` | 3600 |
| **CNAME** | www | `cname.vercel-dns.com.` | 3600 |
| **TXT** | @ | `[valor fornecido pela Vercel]` | 3600 |

**Exemplo de registro TXT (verificação):**
```
TXT @ "vercel-verification=abc123xyz456"
```

**⚠️ Atenção:**
- O ponto final `.` no CNAME é obrigatório
- Use `@` para apontar o domínio raiz (sem www)
- Remova registros antigos conflitantes (outros A/CNAME)

#### 5.3. Aguardar Propagação DNS

```bash
# Tempo: 5 minutos a 48 horas (média: 1-2 horas)

# Verificar propagação:
# Comando 1: Verificar A record
dig nossamaternidade.com.br +short
# Esperado: 76.76.19.19

# Comando 2: Verificar CNAME
dig www.nossamaternidade.com.br +short
# Esperado: cname.vercel-dns.com.

# Comando 3: Ferramenta online
# https://dnschecker.org/#A/nossamaternidade.com.br
```

#### 5.4. Verificar SSL/HTTPS

**Vercel configura SSL automaticamente após DNS propagar!**

```bash
# Após 10-30 minutos de DNS configurado:
# 1. Acesse: https://www.nossamaternidade.com.br
# 2. Verificar cadeado verde no navegador
# 3. Certificado válido (Let's Encrypt via Vercel)

# Se SSL não ativar:
# - Aguardar mais tempo (até 1 hora)
# - Verificar DNS novamente
# - Remover/readicionar domínio na Vercel
```

---

### **FASE 6: Validação e Monitoramento (30 min)**

#### 6.1. Health Checks

```bash
# 1. Endpoint de autenticação
curl -I https://www.nossamaternidade.com.br/api/auth/status
# Esperado: HTTP/2 200

# 2. Frontend carrega
curl -I https://www.nossamaternidade.com.br
# Esperado: HTTP/2 200, Content-Type: text/html

# 3. API responde
curl https://www.nossamaternidade.com.br/api/habits
# Esperado: {"error": "Unauthorized"} (sem login)
# OU {"data": [...]} (se tiver seed)
```

#### 6.2. Smoke Tests Manuais

**Abrir no navegador:** https://www.nossamaternidade.com.br

Testar fluxo completo:
- [ ] Página inicial carrega corretamente
- [ ] Formulário de cadastro funciona
- [ ] Login funciona
- [ ] Dashboard carrega após login
- [ ] NathIA (chat) responde
- [ ] Hábitos podem ser criados
- [ ] Comunidade carrega posts
- [ ] Sem erros no console do navegador (F12)

#### 6.3. Verificar Logs de Produção

```bash
# Vercel Dashboard:
# https://vercel.com/dashboard → Projeto → Logs

# Ou via CLI:
vercel logs --follow

# Buscar por:
# ❌ "ERROR" (não deve haver erros críticos)
# ✅ "Server started" (backend inicializou)
# ✅ Requisições 200 OK
```

#### 6.4. Configurar Monitoramento

**Opção 1: Vercel Analytics (gratuito)**
```bash
# Já ativo automaticamente!
# Acesse: Projeto → Analytics
# Métricas: Web Vitals, Performance Score, etc.
```

**Opção 2: Sentry (Error Tracking)**
```bash
# 1. Criar conta: https://sentry.io/signup
# 2. Criar projeto: nossa-maternidade
# 3. Copiar DSN
# 4. Adicionar na Vercel:
#    Environment Variables → EXPO_PUBLIC_SENTRY_DSN
# 5. Já está configurado no código (.env.example)
```

**Opção 3: UptimeRobot (Monitoring 24/7)**
```bash
# 1. Criar conta: https://uptimerobot.com
# 2. Add New Monitor:
#    Type: HTTPS
#    URL: https://www.nossamaternidade.com.br/api/auth/status
#    Interval: 5 minutes
#    Alert Contacts: [seu email]
# 3. Receber notificação se site cair
```

#### 6.5. Performance Audit

```bash
# Lighthouse (automatizado via GitHub Actions)
# Workflow já configurado: .github/workflows/lighthouse.yml

# Ou executar manualmente:
npx lighthouse https://www.nossamaternidade.com.br --view

# Metas:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 90
```

---

## 🔐 Configurar GitHub Secrets (Para CI/CD Automático)

**⚠️ Necessário para GitHub Actions funcionar!**

### Passo a Passo

```bash
# 1. Acesse: https://github.com/LionGab/Nossa-Maternidadelol/settings/secrets/actions
# 2. Clique em "New repository secret"
# 3. Adicionar um por um:
```

### Secrets Obrigatórios

| Nome | Valor | Como Obter |
|------|-------|-----------|
| **DATABASE_URL** | `postgresql://...` | Copiar da Neon/Supabase |
| **SESSION_SECRET** | `[32+ chars]` | `openssl rand -base64 32` |
| **GEMINI_API_KEY** | `AIzaSy...` | https://aistudio.google.com/app/apikey |
| **PERPLEXITY_API_KEY** | `pplx-...` | https://www.perplexity.ai/settings/api |
| **VERCEL_TOKEN** | `vercel_token...` | https://vercel.com/account/tokens |
| **VERCEL_ORG_ID** | `team_xxx` | Vercel Dashboard → Settings → General |
| **VERCEL_PROJECT_ID** | `prj_xxx` | Project Settings → General |

### Secrets Opcionais (Recursos Avançados)

| Nome | Valor | Benefício |
|------|-------|-----------|
| **NEON_API_KEY** | `neon_api_key...` | Database branching para PRs |
| **NEON_PROJECT_ID** | `proj_xxx` | Automação de migrations |

### Variables (Não-Secretas)

```bash
# Adicionar em: Settings → Secrets and variables → Actions → Variables
```

| Nome | Valor |
|------|-------|
| **NODE_VERSION** | `20.18.0` |
| **NPM_VERSION** | `10.0.0` |

---

## 📋 Checklist Final

### Antes do Deploy
- [ ] Código commitado e pushed para `main`
- [ ] `npm run check` passa sem erros
- [ ] `npm run build` completa com sucesso
- [ ] `.env.production` criado e preenchido (local)
- [ ] Banco de dados criado (Neon ou Supabase)
- [ ] API Keys obtidas (Gemini, Perplexity)
- [ ] SESSION_SECRET gerado (32+ chars)

### Durante o Deploy
- [ ] Repositório conectado na Vercel
- [ ] Variáveis de ambiente adicionadas na Vercel
- [ ] Deploy executado e bem-sucedido
- [ ] URL temporária acessível (xxx.vercel.app)
- [ ] Migrations executadas no banco

### Após o Deploy
- [ ] Domínio adicionado na Vercel
- [ ] DNS configurado no Registro.br
- [ ] SSL ativo (HTTPS funcionando)
- [ ] Health checks passando
- [ ] Smoke tests manuais completos
- [ ] Monitoramento configurado
- [ ] GitHub Secrets adicionados
- [ ] GitHub Actions executando sem erros

### Validação Final
- [ ] Site acessível em https://www.nossamaternidade.com.br
- [ ] Login/cadastro funcionando
- [ ] Chat AI (NathIA) respondendo
- [ ] Hábitos sendo salvos
- [ ] Comunidade carregando
- [ ] Sem erros no console do navegador
- [ ] Logs de produção sem erros críticos
- [ ] Performance > 90 (Lighthouse)

---

## 🚨 Troubleshooting

### Problema: Deploy falha com erro "Cannot find module"

**Solução:**
```bash
# 1. Verificar se todas as dependências estão em package.json
npm install

# 2. Limpar cache e rebuildar
npm run dev:clean

# 3. Re-deploy
vercel --prod
```

### Problema: "DATABASE_URL not defined"

**Solução:**
```bash
# 1. Verificar variável na Vercel:
#    Project Settings → Environment Variables → DATABASE_URL
# 2. Garantir que está no escopo "Production"
# 3. Re-deploy para aplicar mudanças
```

### Problema: 500 Internal Server Error

**Solução:**
```bash
# 1. Verificar logs:
vercel logs --follow

# 2. Buscar stack trace do erro
# 3. Verificar se migrations foram executadas:
npm run db:push

# 4. Verificar SESSION_SECRET (deve ter 32+ chars):
echo $SESSION_SECRET | wc -c  # Deve ser > 32
```

### Problema: DNS não propaga

**Solução:**
```bash
# 1. Verificar configuração no Registro.br
# 2. Usar ferramenta de diagnóstico:
dig nossamaternidade.com.br

# 3. Se após 48h não funcionar:
# - Remover e re-adicionar domínio na Vercel
# - Verificar nameservers estão corretos
# - Limpar cache DNS local: ipconfig /flushdns (Windows)
```

### Problema: SSL não ativa

**Solução:**
```bash
# 1. Aguardar 1 hora após DNS propagar
# 2. Verificar no Vercel:
#    Domains → [seu domínio] → Status deve ser "Valid"
# 3. Forçar renovação:
#    - Remover domínio
#    - Aguardar 5 min
#    - Re-adicionar domínio
```

### Problema: GitHub Actions falhando

**Solução:**
```bash
# 1. Verificar todos os secrets estão adicionados:
#    Settings → Secrets and variables → Actions
# 2. Secrets devem corresponder EXATAMENTE aos nomes:
#    DATABASE_URL, VERCEL_TOKEN, etc.
# 3. Re-run workflow manualmente:
#    Actions → [workflow] → Re-run jobs
```

---

## 📞 Suporte e Recursos

### Documentação Oficial

| Serviço | Documentação | Suporte |
|---------|--------------|---------|
| **Vercel** | https://vercel.com/docs | https://vercel.com/support |
| **Neon** | https://neon.tech/docs | https://neon.tech/docs/introduction |
| **Drizzle ORM** | https://orm.drizzle.team | https://discord.gg/drizzle |
| **React** | https://react.dev | https://react.dev/community |
| **Express** | https://expressjs.com | https://expressjs.com/en/resources/community.html |

### Comunidades

- **GitHub Issues:** https://github.com/LionGab/Nossa-Maternidadelol/issues
- **Vercel Community:** https://github.com/vercel/vercel/discussions
- **React Discord:** https://discord.gg/react

---

## 🎉 Próximos Passos (Pós-Deploy)

### Fase 7: Otimizações (Opcional)

1. **Configurar CDN para Assets**
   - Imagens → Cloudinary ou Vercel Image Optimization
   - Fonts → Google Fonts com preconnect

2. **Implementar Caching**
   - Redis (Upstash) para Q&A cache
   - Service Worker para PWA

3. **Melhorar SEO**
   - Adicionar sitemap.xml
   - Configurar Open Graph tags
   - Submeter para Google Search Console

4. **Analytics Avançado**
   - Google Analytics 4
   - Mixpanel para eventos de usuário
   - Hotjar para heatmaps

5. **Backup Automático**
   - Neon Branching para snapshots diários
   - Export automático de dados críticos

---

## 📊 Métricas de Sucesso

Após deploy, monitorar:

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Uptime** | > 99.9% | UptimeRobot |
| **Response Time** | < 200ms | Vercel Analytics |
| **Error Rate** | < 0.1% | Sentry |
| **Performance Score** | > 90 | Lighthouse CI |
| **Database Latency** | < 50ms | Neon Dashboard |
| **Build Time** | < 3min | GitHub Actions |

---

## ✅ Resumo Executivo

**Tempo Total Estimado:** 3-4 horas (primeira vez)

**Custo Mensal (Estimado):**
- Vercel: $0 (Hobby Plan - até 100GB bandwidth)
- Neon: $0 (Free Tier - 0.5GB storage)
- Domínio: R$ 40/ano (Registro.br)
- APIs (Gemini + Perplexity): ~$10-20/mês (depende do uso)

**Total:** ~$10-20/mês + R$ 40/ano

**Escalabilidade:**
- Suporta até 100k req/mês no free tier
- Upgrade para Vercel Pro ($20/mês) se necessário
- Neon escala automaticamente (paga por uso)

**Manutenção:**
- Deploy automático via GitHub (push to main)
- Migrations automáticas (GitHub Actions)
- Monitoramento 24/7 (UptimeRobot)
- Zero downtime deployments (Vercel)

---

**🎯 Boa sorte com o deploy!**

Se encontrar problemas, consulte:
1. Seção de Troubleshooting acima
2. GitHub Issues do projeto
3. Documentação oficial (links na seção Suporte)
