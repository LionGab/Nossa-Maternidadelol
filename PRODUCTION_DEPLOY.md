# 🚀 Deploy para Produção - Checklist Completo

## ✅ Pré-requisitos

### 1. Database (Neon PostgreSQL)

**Criar database:**
1. Acesse https://neon.tech
2. Crie novo projeto: `nossa-maternidade`
3. Copie a connection string (formato: `postgresql://user:pass@host.neon.tech/db?sslmode=require`)

### 2. Variáveis de Ambiente no Vercel

**Acesse:** https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

**Adicione estas variáveis (Production):**

| Variável | Como Obter | Exemplo |
|----------|------------|---------|
| `DATABASE_URL` | Neon Dashboard → Connection String | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `SESSION_SECRET` | Gerar: `openssl rand -base64 32` | `tagJfJhijweBxJi/lfWQVwvfAM4+gRK6g1Q10V32X9s=` |
| `GEMINI_API_KEY` | Google AI Studio → API Key | `AIzaSyC9YVWRmnGyGu4c9y7g-mNkkipDqb5JBZg` |
| `PERPLEXITY_API_KEY` | Perplexity Dashboard → API Key | `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` |
| `NODE_ENV` | Fixo | `production` |

**⚠️ IMPORTANTE:**
- Todas devem estar marcadas para **Production**
- `SESSION_SECRET` deve ter **mínimo 32 caracteres**
- `DATABASE_URL` deve incluir `?sslmode=require`

### 3. Rodar Migrations no Database

**Após configurar DATABASE_URL:**

```bash
# Local (com DATABASE_URL no .env)
npm run db:push
```

Ou via Neon Dashboard:
1. Acesse Neon Dashboard → SQL Editor
2. Execute o schema de `shared/schema.ts` (ou use Drizzle Studio)

---

## 📦 Deploy no Vercel

### Opção 1: Deploy via CLI (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy produção
vercel --prod
```

### Opção 2: Deploy via GitHub (Automático)

1. **Conectar repositório:**
   - Vercel Dashboard → Add New Project
   - Importe do GitHub
   - Configure build: `npm run vercel-build`

2. **Push para main:**
   ```bash
   git push origin main
   ```
   - Deploy automático será triggerado

---

## 🔍 Verificação Pós-Deploy

### 1. Health Check

```bash
curl https://seu-projeto.vercel.app/api/auth/status
# Deve retornar: {"authenticated": false}
```

### 2. Testar Funcionalidades

- ✅ Landing page carrega
- ✅ Login/Registro funciona
- ✅ Dashboard carrega (ou auto-login demo)
- ✅ NathIA responde (chat IA)
- ✅ Mãe Valente busca funciona
- ✅ Comunidade carrega posts
- ✅ Hábitos funcionam

### 3. Verificar Logs

```bash
# Via Vercel CLI
vercel logs

# Ou via Dashboard
# Vercel Dashboard → Deployments → [Último Deploy] → Logs
```

---

## 🚨 Troubleshooting

### Erro: "SESSION_SECRET é obrigatório"

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicione `SESSION_SECRET` com valor de 32+ caracteres
3. Marque para **Production**
4. Faça redeploy

### Erro: "DATABASE_URL é obrigatório"

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicione `DATABASE_URL` com connection string do Neon
3. Marque para **Production**
4. Faça redeploy

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se `DATABASE_URL` está correta
2. Verifique se database existe no Neon
3. Verifique se migrations foram rodadas: `npm run db:push`
4. Teste conexão localmente primeiro

### Build Falha

**Solução:**
```bash
# Testar build localmente
npm run build

# Se falhar, verificar:
npm run check  # TypeScript errors
```

### Sessões não persistem (multi-instance)

**Problema:** Vercel usa múltiplas instâncias serverless, MemoryStore não compartilha sessões.

**Solução Temporária:** OK para MVP, mas considere:
- Redis (Upstash) para sessões compartilhadas
- Ou usar JWT tokens ao invés de sessões

---

## 📊 Monitoramento

### Logs em Produção

```bash
# Vercel CLI
vercel logs --follow

# Ou Dashboard
# Vercel → Deployments → [Deploy] → Logs
```

### Métricas

- **Vercel Dashboard** → Analytics
- **Neon Dashboard** → Metrics (queries, connections)

---

## 🔄 Rollback

### Se algo der errado:

```bash
# Listar deploys
vercel ls

# Rollback para deploy anterior
vercel rollback <deployment-url>
```

Ou via Dashboard:
- Vercel → Deployments → [Deploy Anterior] → Promote to Production

---

## ✅ Checklist Final

Antes de considerar produção "pronta":

- [ ] Todas variáveis de ambiente configuradas no Vercel
- [ ] Database criado e migrations rodadas
- [ ] Build passa sem erros
- [ ] Health check retorna 200
- [ ] Login/Registro funcionando
- [ ] AI integrations (NathIA, Mãe Valente) funcionando
- [ ] Comunidade carrega posts
- [ ] Hábitos funcionam
- [ ] Logs sem erros críticos
- [ ] HTTPS/SSL ativo (automático no Vercel)

---

## 🎯 Próximos Passos (Opcional)

1. **Configurar domínio custom:**
   - Vercel Dashboard → Settings → Domains
   - Adicionar: `nossamaternidade.com.br`
   - Configurar DNS no Registro.br

2. **Melhorar sessões:**
   - Migrar para Redis (Upstash) para sessões compartilhadas
   - Ou implementar JWT tokens

3. **Monitoring:**
   - Integrar Sentry para error tracking
   - Configurar alertas no Vercel

4. **Performance:**
   - Habilitar Edge Caching
   - Otimizar bundle size

---

**Última atualização:** 2025-01-11
**Status:** ✅ Pronto para produção após configurar variáveis de ambiente

