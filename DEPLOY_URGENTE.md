# 🚀 Deploy Urgente - Guia Passo a Passo

Este guia te leva do zero até o deploy em produção no Vercel em **45-60 minutos**.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [Neon](https://neon.tech) (gratuita)
- Conta no [Supabase](https://supabase.com) (gratuita)
- API Keys:
  - [Google Gemini](https://aistudio.google.com/app/apikey)
  - [Perplexity AI](https://www.perplexity.ai/settings/api)

---

## Passo 1: Configurar Neon PostgreSQL (15 min)

### 1.1 Criar Projeto

1. Acesse [Neon Console](https://console.neon.tech)
2. Clique em **"Create Project"**
3. Escolha um nome (ex: `nossa-maternidade-prod`)
4. Selecione região mais próxima (ex: `us-east-1`)
5. Clique em **"Create Project"**

### 1.2 Obter Connection String

1. No dashboard do projeto, vá em **"Connection Details"**
2. Copie a **Connection String** (formato: `postgresql://user:pass@host/dbname`)
3. **IMPORTANTE:** Adicione `?sslmode=require` no final se não tiver

### 1.3 Aplicar Schema

No terminal do projeto:

```bash
# Adicionar DATABASE_URL ao .env
echo "DATABASE_URL=postgresql://..." >> .env

# Aplicar schema
npm run deploy:setup-db
```

Ou manualmente:

```bash
npm run db:push
```

**Verificar:** No Neon Dashboard → SQL Editor, execute:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deve listar ~20 tabelas (users, profiles, habits, posts, etc).

---

## Passo 2: Configurar Supabase (10 min)

### 2.1 Criar Projeto

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Clique em **"New Project"**
3. Escolha organização (ou crie uma)
4. Preencha:
   - **Name:** `nossa-maternidade`
   - **Database Password:** (anote esta senha!)
   - **Region:** Mais próxima
5. Clique em **"Create new project"**
6. Aguarde ~2 minutos para provisionamento

### 2.2 Obter Credenciais

1. No dashboard, vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY` (opcional, para frontend)

### 2.3 Configurar Storage Buckets

1. Vá em **Storage** no menu lateral
2. Clique em **"New bucket"**
3. Criar bucket `avatars`:
   - **Name:** `avatars`
   - **Public bucket:** ✅ (marcar)
   - Clique em **"Create bucket"**
4. Criar bucket `content`:
   - **Name:** `content`
   - **Public bucket:** ✅ (marcar)
   - Clique em **"Create bucket"**

---

## Passo 3: Gerar SESSION_SECRET (2 min)

```bash
npm run generate:session-secret
```

Copie o valor gerado (será usado no próximo passo).

---

## Passo 4: Configurar Variáveis no Vercel (10 min)

### 4.1 Conectar Repositório (se ainda não conectado)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New"** → **"Project"**
3. Importe seu repositório GitHub
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

### 4.2 Adicionar Variáveis de Ambiente

No projeto Vercel → **Settings** → **Environment Variables**, adicione:

#### Obrigatórias (Production):

| Nome | Valor | Onde Obter |
|------|-------|------------|
| `DATABASE_URL` | `postgresql://...` | Neon Dashboard → Connection Details |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API (service_role) |
| `GEMINI_API_KEY` | `AIza...` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `PERPLEXITY_API_KEY` | `pplx-...` | [Perplexity Settings](https://www.perplexity.ai/settings/api) |
| `SESSION_SECRET` | `(valor gerado)` | `npm run generate:session-secret` |
| `NODE_ENV` | `production` | Fixo |

#### Opcionais (Frontend):

| Nome | Valor | Onde Obter |
|------|-------|------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Mesmo que SUPABASE_URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API (anon) |

**IMPORTANTE:** 
- Marque todas como **Production**, **Preview** e **Development**
- `SESSION_SECRET` deve ter **mínimo 32 caracteres**

---

## Passo 5: Validar Configuração (5 min)

```bash
# Verificar TypeScript
npm run check

# Verificar checklist pré-deploy
npm run deploy:checklist
```

O checklist deve mostrar ✅ em todas as variáveis obrigatórias.

---

## Passo 6: Build Local (5 min)

```bash
# Limpar builds anteriores
npm run clean

# Build
npm run build

# Verificar se build funcionou
ls -la dist/
# Deve ter: dist/index.js e dist/public/
```

Se o build falhar, verifique os logs e corrija os erros.

---

## Passo 7: Deploy no Vercel (5 min)

### Opção A: Via CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Login
vercel login

# Deploy produção
vercel --prod
```

### Opção B: Via GitHub (Recomendado)

1. Faça commit e push:
   ```bash
   git add .
   git commit -m "feat: preparar para deploy"
   git push origin main
   ```

2. O Vercel fará deploy automático (se configurado)

3. Acompanhe em: Vercel Dashboard → Deployments

---

## Passo 8: Validação Pós-Deploy (10 min)

### 8.1 Health Check

Acesse: `https://seu-projeto.vercel.app/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 8.2 Verificar Logs

1. Vercel Dashboard → Deployments → Último deploy
2. Clique em **"View Function Logs"**
3. Verifique se não há erros críticos

### 8.3 Testar Endpoints

```bash
# Health check detalhado
curl https://seu-projeto.vercel.app/health/ready

# Integrations check
curl https://seu-projeto.vercel.app/health/integrations
```

### 8.4 Testar Frontend

1. Acesse `https://seu-projeto.vercel.app`
2. Teste:
   - ✅ Página inicial carrega
   - ✅ Login/Registro funciona
   - ✅ Dashboard carrega
   - ✅ NathIA (chat AI) funciona
   - ✅ Mãe Valente (search) funciona

---

## 🐛 Troubleshooting

### Build falha no Vercel

**Sintoma:** Build error nos logs

**Solução:**
1. Verifique logs completos no Vercel Dashboard
2. Execute `npm run build` localmente para reproduzir
3. Verifique se todas as dependências estão em `package.json`
4. Verifique se `NODE_ENV=production` está configurado

### Erro: DATABASE_URL não funciona

**Sintoma:** Erro de conexão com banco

**Solução:**
1. Verifique formato: deve começar com `postgresql://`
2. Verifique se adicionou `?sslmode=require` se necessário
3. Teste connection string no Neon Dashboard → SQL Editor
4. Verifique se IP não está bloqueado (Neon permite todos por padrão)

### Erro: Sessions não persistem

**Sintoma:** Usuário deslogado após refresh

**Solução:**
- Em produção multi-instance, sessions em memória não funcionam
- **Workaround temporário:** Funciona para MVP, mas considere Redis/Upstash depois
- Sessions funcionam por request no Vercel serverless

### Erro: CORS

**Sintoma:** Erro "Not allowed by CORS" no browser

**Solução:**
1. Adicione `FRONTEND_URL` no Vercel com seu domínio
2. Ou edite `api/index.ts` linha 34-40 para adicionar seu domínio

### Erro: AI endpoints não funcionam

**Sintoma:** Erro 500 em `/api/ai/*`

**Solução:**
1. Verifique `GEMINI_API_KEY` e `PERPLEXITY_API_KEY` no Vercel
2. Verifique logs no Vercel Dashboard
3. Teste API keys diretamente nas plataformas

---

## ✅ Checklist Final

Antes de considerar deploy completo:

- [ ] Neon database criado e schema aplicado
- [ ] Supabase configurado com buckets `avatars` e `content`
- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] `npm run deploy:checklist` passa sem erros
- [ ] Build local funciona (`npm run build`)
- [ ] Deploy realizado no Vercel
- [ ] Health check responde OK (`/health`)
- [ ] Login/registro funcionando
- [ ] AI endpoints funcionando (NathIA, Mãe Valente)
- [ ] Logs sem erros críticos
- [ ] Frontend carrega corretamente

---

## 📞 Próximos Passos Após Deploy

1. **Configurar Domínio Customizado** (opcional)
   - Vercel Dashboard → Settings → Domains
   - Adicionar `nossamaternidade.com.br`

2. **Monitoramento**
   - Configurar alertas no Vercel
   - Adicionar Sentry para error tracking (opcional)

3. **Otimizações Futuras**
   - Migrar sessions para Redis (Upstash)
   - Adicionar CDN para assets
   - Implementar cache strategy mais agressiva

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique logs no Vercel Dashboard
2. Execute `npm run deploy:checklist` localmente
3. Teste build local: `npm run build`
4. Verifique documentação:
   - [Vercel Docs](https://vercel.com/docs)
   - [Neon Docs](https://neon.tech/docs)
   - [Supabase Docs](https://supabase.com/docs)

---

**Tempo Total Estimado: 45-60 minutos**

Boa sorte com o deploy! 🚀

