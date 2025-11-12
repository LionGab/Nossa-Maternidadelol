# 🚀 Deploy no Vercel - www.nossamaternidade.com.br

**Status:** ✅ Código commitado no GitHub
**Branch:** main
**Commit:** 085afb2

---

## 📋 Pré-requisitos

- [x] Código commitado no GitHub
- [x] Conta no Vercel (https://vercel.com)
- [x] Conta no Supabase (https://supabase.com)
- [ ] Domínio www.nossamaternidade.com.br configurado

---

## 🔧 Passo 1: Configurar Projeto no Vercel

### 1.1 Importar do GitHub

1. Acesse https://vercel.com/new
2. Selecione o repositório: `LionGab/Nossa-Maternidadelol`
3. **Framework Preset:** Vite
4. **Root Directory:** `.` (raiz do projeto) ⚠️ **IMPORTANTE: NÃO use o domínio aqui!**
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist/public`
7. **Install Command:** `npm install`

### ⚠️ Erro Comum: Root Directory Incorreto

Se você ver o erro:
```
The specified Root Directory "www.nossamaternidade.com.br" does not exist.
```

**Solução:**
1. Vercel Dashboard → **Settings** → **General**
2. Na seção **Root Directory**, mude para: `.` (ponto) ou deixe **vazio**
3. **NÃO** coloque o domínio no Root Directory - isso é apenas para o código!
4. O domínio deve ser configurado em **Settings** → **Domains** (seção separada)

### 1.2 Configurar Build Settings

No Vercel Dashboard → Settings → General:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "nodeVersion": "20.x"
}
```

**⚠️ IMPORTANTE - Versão do Node.js:**

1. Vercel Dashboard → **Settings** → **General**
2. Na seção **Node.js Version**, selecione: **20.x**
3. Isso garante que o build e as serverless functions usem Node.js 20
4. O `package.json` já especifica `"node": ">=20.0.0"`, mas o Vercel precisa da configuração explícita

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

Acesse: Vercel Dashboard → Settings → Environment Variables

### Variáveis OBRIGATÓRIAS (Produção):

```bash
# Node.js
NODE_ENV=production
PORT=3000

# Supabase Auth (Backend)
SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkxNjc4MSwiZXhwIjoyMDc3NDkyNzgxfQ.LXhcF_2J9bvqMVOqK3RWyZkHYp9vLbWxFu0VyI5zVbI
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueoe

# Database
DATABASE_URL=postgresql://postgres.mnszbkeuerjcevjvdqme:Primelion123%40@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# AI APIs
GEMINI_API_KEY=AIzaSyBKBrBAZDzsxErgpezItOayUzRGUAy4oNg
PERPLEXITY_API_KEY=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

# Session Security (GERAR NOVO EM PRODUÇÃO!)
SESSION_SECRET=TROCAR_POR_SECRET_SEGURO_EM_PRODUCAO_MIN_32_CHARS

# Frontend (Vite - prefixo VITE_)
VITE_SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueoe
```

### ⚠️ IMPORTANTE - Gerar SESSION_SECRET seguro:

**Opção 1 - Script npm (Recomendado):**
```bash
npm run generate:session-secret
```

**Opção 2 - OpenSSL:**
```bash
openssl rand -base64 32
```

Copie o resultado e cole em `SESSION_SECRET` no Vercel Dashboard.

### Configuração no Vercel:

Para cada variável:
1. Clique em "Add New"
2. Cole o nome (ex: `NODE_ENV`)
3. Cole o valor (ex: `production`)
4. Selecione: **Production, Preview, Development** (todas)
5. Clique em "Save"

---

## 🌐 Passo 3: Configurar Domínio Customizado

### 3.1 Adicionar Domínio no Vercel

1. Acesse: Vercel Dashboard → Settings → Domains
2. Clique em "Add Domain"
3. Digite: `www.nossamaternidade.com.br`
4. Clique em "Add"

### 3.2 Configurar DNS

O Vercel irá mostrar os registros DNS necessários. Configure no seu provedor de domínio:

**Tipo A (se usar apex domain):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Tipo CNAME (para www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 3.3 Redirecionar Apex → www (Opcional)

Se quiser redirecionar `nossamaternidade.com.br` → `www.nossamaternidade.com.br`:

1. Adicione `nossamaternidade.com.br` no Vercel
2. Configure para redirecionar para `www.nossamaternidade.com.br`

---

## 📦 Passo 4: Fazer Deploy

### 4.1 Deploy Automático (Recomendado)

O Vercel faz deploy automático a cada push no GitHub:

```bash
git add .
git commit -m "chore: Configurar para produção"
git push origin main
```

O Vercel detecta automaticamente e faz deploy.

### 4.2 Deploy Manual via CLI

Se preferir, use a CLI do Vercel:

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ✅ Passo 5: Verificar Deploy

### 5.1 Checklist Pós-Deploy

Acesse: https://www.nossamaternidade.com.br (ou URL temporária do Vercel)

- [ ] Site carrega corretamente
- [ ] Certificado SSL ativo (https)
- [ ] Registro funciona (`/api/auth/register`)
- [ ] Login funciona (`/api/auth/login`)
- [ ] NathIA responde (testar chat)
- [ ] Hábitos salvam corretamente
- [ ] Mundo Nath carrega posts
- [ ] Refúgio Nath carrega comunidade

### 5.2 Testar Endpoints

```bash
# Health check
curl https://www.nossamaternidade.com.br/api/health

# Register
curl -X POST https://www.nossamaternidade.com.br/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Teste",
    "stage": "pregnant"
  }'

# Login
curl -X POST https://www.nossamaternidade.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

---

## 🐛 Troubleshooting

### Erro: "Internal Server Error"

**Causa:** Variáveis de ambiente faltando

**Solução:**
1. Verifique todas as variáveis em Settings → Environment Variables
2. Redeploy: Deployments → Latest → ... → Redeploy

### Erro: "Build Failed"

**Causa:** TypeScript errors ou dependências faltando

**Solução:**
1. Verifique os logs em Deployments → Latest
2. Teste localmente: `npm run build`
3. Corrija erros e faça novo push

### Erro: "Supabase Auth Failed"

**Causa:** `SUPABASE_SERVICE_ROLE_KEY` incorreta

**Solução:**
1. Obtenha a key correta em: Supabase Dashboard → Settings → API
2. Copie "service_role" key (NÃO "anon" key)
3. Atualize no Vercel e redeploy

### Erro: "Domain not verified"

**Causa:** DNS não propagado

**Solução:**
1. Aguarde propagação (pode levar até 48h)
2. Verifique DNS: https://dnschecker.org
3. Teste com: `dig www.nossamaternidade.com.br`

### Site carrega mas API não funciona

**Causa:** `vercel.json` configurado incorretamente

**Solução:**
1. Verifique se `vercel.json` tem as rotas corretas
2. Adicione:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Via CLI
vercel logs --follow

# Via Dashboard
Vercel Dashboard → Deployments → Latest → Runtime Logs
```

### Analytics

- Vercel Analytics: Dashboard → Analytics
- Supabase Usage: Supabase Dashboard → Settings → Usage

---

## 🔄 Rollback (se necessário)

Se algo der errado:

1. Acesse: Deployments
2. Encontre o deploy anterior que funcionava
3. Clique em "..." → "Promote to Production"

---

## 📝 Checklist Final

- [ ] Código commitado e pushed no GitHub
- [ ] Projeto importado no Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] `SESSION_SECRET` gerado com `openssl rand -base64 32`
- [ ] Deploy bem-sucedido
- [ ] Domínio configurado (DNS propagado)
- [ ] SSL ativo (https)
- [ ] Endpoints de API funcionando
- [ ] Frontend carregando
- [ ] Autenticação funcionando
- [ ] Features principais testadas

---

## 🆘 Suporte

**Documentação:**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Vite: https://vitejs.dev/guide/

**Se precisar de ajuda:**
1. Verifique logs no Vercel Dashboard
2. Teste endpoints com curl
3. Verifique variáveis de ambiente
4. Consulte docs oficiais

---

**Deploy criado por:** Claude Code
**Data:** 2025-01-12
