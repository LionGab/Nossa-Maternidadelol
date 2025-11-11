# 🚀 Deployment Guide - Nossa Maternidade

## 🌐 Configuração do Domínio: nossamaternidade.com.br

### Opção 1: Vercel (Recomendado) ⭐

#### Por que Vercel?
- ✅ Deploy automático do GitHub
- ✅ HTTPS/SSL grátis
- ✅ CDN global (baixa latência no Brasil)
- ✅ Serverless functions
- ✅ 100% grátis para projetos pessoais

#### Setup Rápido

**1. Instalar Vercel CLI**
```bash
npm install -g vercel
```

**2. Login**
```bash
vercel login
```

**3. Deploy**
```bash
vercel --prod
```

**4. Configurar Domínio**
- Acesse https://vercel.com/dashboard
- Vá em Settings → Domains
- Adicione: `www.nossamaternidade.com.br` e `nossamaternidade.com.br`

**5. Configurar DNS no Registro.br**

Login em https://registro.br → Painel de DNS:

```
Tipo  | Nome | Valor
------|------|----------------------------------
CNAME | www  | cname.vercel-dns.com
A     | @    | 76.76.19.19
AAAA  | @    | 2606:4700:4700::1111 (opcional)
```

**Tempo de propagação:** 24-48 horas

---

### Opção 2: Render

#### Setup
```bash
# 1. Criar conta em https://render.com
# 2. Conectar GitHub repo
# 3. Configurar:
```

**Build Command:** `npm run build`
**Start Command:** `npm start`

**DNS:**
```
CNAME | www  | yourapp.onrender.com
A     | @    | 216.24.57.1
```

---

## 🔐 Configuração de Secrets

### GitHub Secrets (para CI/CD)

Vá em: **Settings → Secrets and variables → Actions**

#### Obrigatórios:
```bash
DATABASE_URL          # PostgreSQL connection string (Neon)
SESSION_SECRET        # openssl rand -base64 32
GEMINI_API_KEY       # Google AI Studio
PERPLEXITY_API_KEY   # Perplexity API
```

#### Para Deploy (Vercel):
```bash
VERCEL_TOKEN         # https://vercel.com/account/tokens
VERCEL_ORG_ID        # Dashboard → Settings → General
VERCEL_PROJECT_ID    # Project Settings → General
```

#### Para Deploy (Render):
```bash
RENDER_API_KEY       # Account Settings → API Keys
RENDER_SERVICE_ID    # Service Settings → Service ID
```

---

## 🗄️ Database Setup (Neon PostgreSQL)

### 1. Criar Database
```bash
# Acesse https://neon.tech (grátis)
# Crie um novo projeto: nossa-maternidade
# Copie a connection string
```

### 2. Configurar Variáveis de Ambiente
```bash
# .env.production (não commitar!)
DATABASE_URL="postgresql://user:password@host.neon.tech/nossa_maternidade?sslmode=require"
NODE_ENV=production
SESSION_SECRET=<gerar com: openssl rand -base64 32>
```

### 3. Rodar Migrations
```bash
npm run db:push
```

---

## 📦 Build e Deploy

### Build Local
```bash
npm install
npm run build
npm start
```

### Deploy Automático (GitHub Actions)

**Trigger de Deploy:**
- Push para `main` → deploy automático
- Pull Request → preview deployment

**Workflow:**
1. CI roda (typecheck, build, security)
2. Se CI passar → Deploy para produção
3. Migrations rodam automaticamente
4. Health check valida deploy

---

## 🔍 Monitoramento

### Logs em Produção
```bash
# Vercel
vercel logs

# Render
render logs
```

### Health Check Endpoint
```bash
curl https://www.nossamaternidade.com.br/api/auth/status
# Deve retornar: {"authenticated": false}
```

---

## 🚨 Troubleshooting

### Build Falha
```bash
# Verificar TypeScript
npm run check

# Limpar cache
rm -rf node_modules dist .output
npm install
npm run build
```

### SSL Errors
- Vercel/Render configuram SSL automaticamente
- Aguarde 5-10 minutos após configurar DNS
- Force HTTPS no vercel.json

### Database Connection Errors
```bash
# Testar conexão
node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect()"
```

---

## 📊 Performance

### Cache Headers (configurado)
- Static assets: 1 year
- API responses: no-cache
- Images: 30 days

### CDN (Vercel Edge)
- Latência < 50ms no Brasil
- 70+ edge locations

---

## 🔄 Rollback

### Vercel
```bash
# Listar deploys
vercel ls

# Rollback para deploy anterior
vercel rollback <deployment-url>
```

### Render
- Dashboard → Deploys → Rollback button

---

## ✅ Checklist Pré-Deploy

**Segurança:**
- [ ] `SESSION_SECRET` gerado (32+ chars)
- [ ] `.env` não está no git
- [ ] Rate limiting ativo
- [ ] HTTPS enforced

**Performance:**
- [ ] Build passa sem erros
- [ ] TypeScript check passa
- [ ] Database migrations testadas
- [ ] Logs estruturados (Pino)

**Monitoring:**
- [ ] Health check endpoint funcional
- [ ] Error tracking configurado
- [ ] Logs de produção acessíveis

---

## 📞 Suporte

**Vercel:** https://vercel.com/support
**Render:** https://render.com/docs
**Neon:** https://neon.tech/docs

**Issues:** https://github.com/LionGab/Nossa-Maternidadelol/issues
