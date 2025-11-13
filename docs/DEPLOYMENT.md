# Guia de Deploy

## Pré-requisitos

- Node.js 20+
- Conta Vercel
- Conta Neon (PostgreSQL)
- Conta Supabase (Auth + Storage)
- Conta Upstash (Redis, opcional)

## Variáveis de Ambiente

Configure no Vercel Dashboard:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# AI APIs
GEMINI_API_KEY=your-gemini-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key

# Session
SESSION_SECRET=your-random-secret-32-chars-min

# Redis (opcional)
REDIS_URL=redis://default:password@host:6379

# Environment
NODE_ENV=production
PORT=5000
```

## Deploy no Vercel

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via GitHub Actions

O workflow `.github/workflows/deploy.yml` faz deploy automático ao fazer push em `main`.

## Database Setup

### 1. Criar banco no Neon

1. Acesse [Neon Console](https://console.neon.tech)
2. Crie novo projeto
3. Copie connection string → `DATABASE_URL`

### 2. Aplicar Schema

```bash
npm run db:push
```

Ou gerar migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Supabase Setup

### 1. Criar Projeto

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Crie novo projeto
3. Copie URL e keys → variáveis de ambiente

### 2. Configurar Storage Buckets

Crie buckets no Supabase Storage:

- `avatars` (public)
- `content` (public)

### 3. Configurar RLS Policies

Configure Row Level Security policies conforme necessário.

## Redis Setup (Opcional)

### Upstash

1. Crie database no [Upstash Console](https://console.upstash.com)
2. Copie Redis URL → `REDIS_URL`

**Nota:** Sem Redis, o sistema usa memory cache (não persistente).

## Build e Teste Local

```bash
# Instalar dependências
npm install

# Build
npm run build

# Teste produção local
npm start
```

## Monitoramento

### Logs

Logs estruturados (JSON) disponíveis no Vercel Dashboard.

### Métricas

Configure Prometheus metrics (opcional):

```bash
ENABLE_METRICS=true
```

Acesse `/metrics` endpoint.

## Troubleshooting

### Erro: DATABASE_URL não configurada

Verifique se a variável está configurada no Vercel Dashboard.

### Erro: Supabase Auth não funciona

Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

### Build falha

Verifique logs no Vercel Dashboard → Deployments → Build Logs.

### Performance lenta

- Habilite Redis cache (`REDIS_URL`)
- Verifique queries N+1 nos logs
- Use pagination em listas grandes

## CI/CD

Workflows GitHub Actions:

- **CI**: Lint, type check, tests, build
- **Deploy**: Deploy automático em `main`
- **Preview**: Deploy preview em PRs
- **Lighthouse**: Audit de performance

## Rollback

No Vercel Dashboard:

1. Vá em Deployments
2. Encontre deployment anterior
3. Clique em "..." → "Promote to Production"
