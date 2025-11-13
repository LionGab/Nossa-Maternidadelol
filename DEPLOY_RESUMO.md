# 🚀 Resumo Executivo - Deploy em Produção
## Nossa Maternidade

---

## 📌 Visão Geral

**Objetivo:** Colocar o projeto "Nossa Maternidade" no ar em produção

**Plataforma:** Vercel (serverless, grátis, deploy automático)

**Domínio:** www.nossamaternidade.com.br

**Tempo Estimado:** 3-4 horas (primeira vez)

**Custo Mensal:** ~$10-20 (APIs) + R$ 40/ano (domínio)

---

## 🎯 Passos Rápidos (TL;DR)

```bash
# 1. Verificar se está pronto
npm run pre-deploy

# 2. Criar banco de dados
# → https://console.neon.tech (criar projeto "nossa-maternidade")

# 3. Deploy na Vercel
# → https://vercel.com/new (importar repositório GitHub)
# → Adicionar variáveis de ambiente (DATABASE_URL, SESSION_SECRET, etc)

# 4. Rodar migrations
npm run db:push

# 5. Configurar domínio
# → Vercel: adicionar nossamaternidade.com.br
# → Registro.br: configurar DNS (A record + CNAME)

# 6. Validar
# → Acessar https://www.nossamaternidade.com.br
# → Testar login, chat, hábitos
```

---

## 📚 Documentação Disponível

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **DEPLOY_CHECKLIST.md** | Checklist passo a passo | Durante o deploy (marcar itens) |
| **PLANO_DEPLOY_PRODUCAO.md** | Guia completo detalhado | Referência completa, troubleshooting |
| **DEPLOYMENT.md** | Documentação original | Informações gerais de deploy |
| **scripts/pre-deploy-check.js** | Validação automática | Antes de fazer deploy |

---

## ⚡ 6 Fases do Deploy

### FASE 0: Pré-requisitos (15 min)
- [ ] Criar contas: Vercel, Neon, Gemini, Perplexity
- [ ] Obter API keys
- [ ] Executar: `npm run pre-deploy`

### FASE 1: Database Setup (20 min)
- [ ] Criar banco Neon PostgreSQL
- [ ] Copiar connection string
- [ ] Salvar em .env.production (local)

### FASE 2: Variáveis de Ambiente (10 min)
- [ ] DATABASE_URL
- [ ] SESSION_SECRET (gerar: `openssl rand -base64 32`)
- [ ] GEMINI_API_KEY
- [ ] PERPLEXITY_API_KEY
- [ ] NODE_ENV=production

### FASE 3: Deploy Vercel (30 min)
- [ ] Conectar repositório GitHub
- [ ] Configurar build (npm run build)
- [ ] Adicionar variáveis de ambiente
- [ ] Executar deploy

### FASE 4: Migrations (10 min)
- [ ] Configurar DATABASE_URL local
- [ ] Executar: `npm run db:push`
- [ ] Verificar tabelas criadas

### FASE 5: Domínio (60 min)
- [ ] Adicionar domínio na Vercel
- [ ] Configurar DNS no Registro.br
- [ ] Aguardar propagação (1-48h)
- [ ] Verificar SSL ativo

### FASE 6: Validação (30 min)
- [ ] Health checks (curl endpoints)
- [ ] Smoke tests (navegador)
- [ ] Verificar logs (vercel logs)
- [ ] Configurar monitoramento

---

## 🔐 Variáveis de Ambiente Obrigatórias

Adicionar na Vercel (Project Settings → Environment Variables):

```bash
DATABASE_URL              = postgresql://...
SESSION_SECRET            = [openssl rand -base64 32]
GEMINI_API_KEY           = AIzaSy...
PERPLEXITY_API_KEY       = pplx-...
NODE_ENV                 = production
EXPO_PUBLIC_ENABLE_AI_FEATURES = true
EXPO_PUBLIC_ENABLE_GAMIFICATION = true
```

**Onde obter API keys:**
- Gemini: https://aistudio.google.com/app/apikey
- Perplexity: https://www.perplexity.ai/settings/api
- Neon: https://console.neon.tech

---

## 🌐 Configuração DNS

**Registro.br → Painel DNS:**

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | `76.76.19.19` |
| CNAME | www | `cname.vercel-dns.com.` |
| TXT | @ | `[valor da Vercel]` |

**Verificar propagação:**
```bash
dig nossamaternidade.com.br +short
# Deve retornar: 76.76.19.19
```

---

## ✅ Validação de Sucesso

### Health Checks
```bash
curl https://www.nossamaternidade.com.br/api/auth/status
# Esperado: HTTP/2 200
```

### Smoke Tests (Navegador)
- [ ] Página inicial carrega
- [ ] Cadastro/login funciona
- [ ] Dashboard aparece
- [ ] NathIA (chat) responde
- [ ] Hábitos podem ser criados
- [ ] Console sem erros

---

## 🔧 GitHub Secrets (CI/CD)

**Settings → Secrets and variables → Actions:**

```bash
DATABASE_URL
SESSION_SECRET
GEMINI_API_KEY
PERPLEXITY_API_KEY
VERCEL_TOKEN              # https://vercel.com/account/tokens
VERCEL_ORG_ID             # Dashboard → Settings → General
VERCEL_PROJECT_ID         # Project Settings → General
```

---

## 📊 Monitoramento

### Vercel Analytics
✅ Ativo automaticamente após deploy

### Sentry (Errors)
1. Criar conta: https://sentry.io
2. Criar projeto: nossa-maternidade
3. Adicionar na Vercel: `EXPO_PUBLIC_SENTRY_DSN`

### UptimeRobot (Uptime)
1. Criar conta: https://uptimerobot.com
2. Monitor URL: https://www.nossamaternidade.com.br/api/auth/status
3. Interval: 5 minutes

---

## 🚨 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Deploy falha | `vercel logs` |
| DATABASE_URL error | Verificar variável na Vercel |
| 500 error | `npm run db:push` |
| DNS não funciona | Aguardar 1-48h |
| SSL não ativa | Re-adicionar domínio |

**Guia completo:** PLANO_DEPLOY_PRODUCAO.md (seção Troubleshooting)

---

## 📈 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Uptime | > 99.9% |
| Response Time | < 200ms |
| Error Rate | < 0.1% |
| Performance Score | > 90 |

---

## 💰 Custos Estimados

### Grátis (Tier Inicial)
- Vercel Hobby: $0 (100GB bandwidth/mês)
- Neon Free: $0 (0.5GB storage)
- Total: **$0/mês**

### Com Uso Real (Estimado)
- Vercel Hobby: $0
- Neon Free: $0
- Gemini API: ~$5-10/mês
- Perplexity API: ~$5-10/mês
- Domínio: R$ 40/ano (~R$ 3/mês)
- **Total: ~$10-20/mês**

### Escala (100k+ usuários)
- Vercel Pro: $20/mês
- Neon Scale: ~$20/mês
- APIs: ~$50-100/mês
- **Total: ~$90-140/mês**

---

## 🎯 Próximos Passos (Pós-Deploy)

### Imediato (Semana 1)
- [ ] Divulgar URL
- [ ] Coletar feedback inicial
- [ ] Monitorar erros (Sentry)
- [ ] Ajustar baseado em uso

### Curto Prazo (Mês 1)
- [ ] Implementar analytics (Google Analytics)
- [ ] Configurar backup automático
- [ ] Otimizar performance (se necessário)
- [ ] Criar documentação de usuário

### Médio Prazo (Mês 2-3)
- [ ] Redis cache (Upstash)
- [ ] PWA (Service Worker)
- [ ] SEO (sitemap, meta tags)
- [ ] A/B testing

---

## 📞 Suporte

**Problemas?**
1. Consultar: PLANO_DEPLOY_PRODUCAO.md
2. Logs: `vercel logs --follow`
3. GitHub Issues: https://github.com/LionGab/Nossa-Maternidadelol/issues

**Documentação Oficial:**
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
- Drizzle: https://orm.drizzle.team

---

## ✨ Comandos Úteis

```bash
# Validação pré-deploy
npm run pre-deploy

# Build local
npm run build

# Type check
npm run check

# Rodar migrations
npm run db:push

# Gerar SESSION_SECRET
npm run generate:session-secret

# Logs de produção
vercel logs --follow

# Deploy manual
vercel --prod

# Rollback
vercel rollback [deployment-url]
```

---

## 🎊 Status Atual

**Código:** ✅ Pronto (estável, otimizado, testado)

**Infraestrutura:** ⚠️ Pendente (necessita configuração)

**Deploy:** ❌ Não executado

**Próximo passo:** Executar FASE 0 (Pré-requisitos)

---

**Para começar agora:**

```bash
npm run pre-deploy
```

**Depois siga:** DEPLOY_CHECKLIST.md (marque cada item)

**Dúvidas?** PLANO_DEPLOY_PRODUCAO.md (guia completo)

---

**Boa sorte com o deploy! 🚀**
