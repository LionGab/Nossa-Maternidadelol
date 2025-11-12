# 🚀 Status do Deploy no Vercel

**Data:** 2025-01-12  
**Status:** ✅ Configuração Pronta para Deploy

---

## ✅ O que foi feito

### 1. Configuração do Vercel (`vercel.json`)
- ✅ Atualizado para estrutura moderna do Vercel
- ✅ Configurado `buildCommand`: `npm run build`
- ✅ Configurado `outputDirectory`: `dist/public`
- ✅ Rewrites configurados para `/api/*` → `/api` (serverless function)
- ✅ Rewrites configurados para SPA (todas as rotas → `/index.html`)
- ✅ Headers de segurança adicionados

### 2. Serverless Function (`api/index.ts`)
- ✅ Express app configurado para Vercel
- ✅ CORS atualizado para incluir domínios:
  - `https://www.nossamaternidade.com.br`
  - `https://nossamaternidade.com.br`
  - `https://nossa-maternidadelol.vercel.app`
- ✅ Validação de variáveis de ambiente (SESSION_SECRET, DATABASE_URL)
- ✅ Rotas assíncronas inicializadas corretamente
- ✅ Error handling configurado

### 3. Scripts Úteis
- ✅ Criado `scripts/generate-session-secret.js`
- ✅ Adicionado `npm run generate:session-secret` ao package.json

---

## 📋 Próximos Passos

### 1. Gerar SESSION_SECRET

```bash
npm run generate:session-secret
```

Copie o valor gerado e configure no Vercel Dashboard.

### 2. Configurar Variáveis de Ambiente no Vercel

Acesse: **Vercel Dashboard → Project Settings → Environment Variables**

Configure todas as variáveis listadas em `DEPLOY_VERCEL.md`:

**Obrigatórias:**
- `NODE_ENV=production`
- `PORT=3000`
- `SESSION_SECRET` (gerar com `npm run generate:session-secret`)
- `DATABASE_URL` (do Supabase)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `PERPLEXITY_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Opcional:**
- `FRONTEND_URL` (se quiser restringir CORS)

### 3. Importar Projeto no Vercel

1. Acesse https://vercel.com/new
2. Selecione o repositório: `LionGab/Nossa-Maternidadelol`
3. O Vercel detectará automaticamente:
   - Framework: Vite
   - Build Command: `npm run build` (do vercel.json)
   - Output Directory: `dist/public` (do vercel.json)
4. Clique em "Deploy"

### 4. Configurar Domínio

1. Vercel Dashboard → Settings → Domains
2. Adicione: `www.nossamaternidade.com.br`
3. Configure DNS conforme instruções do Vercel
4. Aguarde propagação (pode levar até 48h)

### 5. Verificar Deploy

Após o deploy, teste:

```bash
# Health check
curl https://www.nossamaternidade.com.br/api/health

# Teste de registro
curl -X POST https://www.nossamaternidade.com.br/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Teste",
    "stage": "pregnant"
  }'
```

---

## 🔍 Checklist de Verificação

Antes de fazer deploy, verifique:

- [ ] Código commitado e pushed no GitHub
- [ ] `SESSION_SECRET` gerado (32+ caracteres)
- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] `DATABASE_URL` válida (teste conexão)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` correta
- [ ] Build local funciona: `npm run build`
- [ ] Type check passa: `npm run check`

---

## 🐛 Troubleshooting

### Erro: "Internal Server Error"
- Verifique logs no Vercel Dashboard → Deployments → Latest → Runtime Logs
- Confirme que todas as variáveis de ambiente estão configuradas
- Verifique se `SESSION_SECRET` tem 32+ caracteres

### Erro: "Build Failed"
- Teste build local: `npm run build`
- Verifique TypeScript errors: `npm run check`
- Confirme que todas as dependências estão no `package.json`

### Erro: "CORS Error"
- Verifique `FRONTEND_URL` no Vercel
- Confirme que o domínio está na lista de allowed origins em `api/index.ts`

### API não funciona mas frontend carrega
- Verifique se `api/index.ts` está sendo detectado pelo Vercel
- Confirme que o rewrite `/api/(.*)` → `/api` está no `vercel.json`
- Verifique logs da serverless function no Vercel Dashboard

---

## 📊 Estrutura do Deploy

```
Vercel
├── Frontend (Static)
│   ├── Build: `npm run build` (Vite)
│   ├── Output: `dist/public/`
│   └── Serve: Static files + SPA routing
│
└── Backend (Serverless)
    ├── Function: `api/index.ts`
    ├── Routes: `/api/*` → `api/index.ts`
    └── Runtime: Node.js 20+
```

---

## 🔐 Segurança

- ✅ Helmet configurado (security headers)
- ✅ CORS restrito a domínios permitidos
- ✅ SESSION_SECRET validado (min 32 chars)
- ✅ Cookies seguros (secure, httpOnly, sameSite)
- ✅ Trust proxy configurado para Vercel

---

## 📝 Notas Importantes

1. **Sessions em Serverless**: O código atual usa MemoryStore para sessions, que não persiste entre invocações serverless. Para produção multi-instance, considere usar Redis ou Supabase Auth.

2. **Cold Starts**: A primeira requisição após inatividade pode ter latência maior (cold start). Isso é normal em serverless.

3. **Timeout**: Vercel serverless functions têm timeout de 10s (Hobby) ou 60s (Pro). Para operações longas (ex: AI), considere usar streaming ou background jobs.

4. **Logs**: Logs estão configurados com Pino. Verifique no Vercel Dashboard → Deployments → Runtime Logs.

---

**Pronto para deploy!** 🚀

Siga os passos acima e o site estará no ar em minutos.

