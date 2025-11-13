# ✅ Checklist Rápido de Deploy
## Nossa Maternidade → Produção

**Use este checklist enquanto executa o deploy. Marque cada item conforme completa.**

---

## 🎯 PRÉ-DEPLOY (15 min)

### Contas e Acessos
- [ ] Conta Vercel criada (https://vercel.com/signup)
- [ ] Conta Neon criada (https://console.neon.tech/signup) **OU** Supabase
- [ ] Acesso ao GitHub repo `LionGab/Nossa-Maternidadelol`
- [ ] Acesso ao domínio no Registro.br

### API Keys Obtidas
- [ ] Gemini API Key → https://aistudio.google.com/app/apikey
- [ ] Perplexity API Key → https://www.perplexity.ai/settings/api
- [ ] SESSION_SECRET gerado → `openssl rand -base64 32`

---

## 🗄️ DATABASE SETUP (20 min)

### Opção A: Neon (Recomendado)
- [ ] Projeto criado: `nossa-maternidade`
- [ ] Região: US East (Ohio)
- [ ] Connection string copiada
- [ ] Testada localmente: `npm run db:push`

### Opção B: Supabase
- [ ] Projeto criado: `nossa-maternidade`
- [ ] Região: East US
- [ ] Connection string copiada
- [ ] Service role key copiada

---

## 🚀 VERCEL DEPLOY (30 min)

### 1. Conectar Repositório
- [ ] Importar `LionGab/Nossa-Maternidadelol` na Vercel
- [ ] Framework: Other
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist/public`

### 2. Variáveis de Ambiente (Production)

**Copiar/colar cada uma no Vercel:**

```bash
DATABASE_URL              = [cole aqui sua connection string]
SESSION_SECRET            = [cole resultado do openssl rand -base64 32]
GEMINI_API_KEY           = [cole sua Gemini API key]
PERPLEXITY_API_KEY       = [cole sua Perplexity API key]
NODE_ENV                 = production
EXPO_PUBLIC_ENABLE_AI_FEATURES      = true
EXPO_PUBLIC_ENABLE_GAMIFICATION     = true
EXPO_PUBLIC_ENABLE_ANALYTICS        = false
```

**Se usando Supabase:**
```bash
EXPO_PUBLIC_SUPABASE_URL            = https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY       = [copiar do Supabase Dashboard]
SUPABASE_SERVICE_ROLE_KEY           = [copiar do Supabase Dashboard]
VITE_SUPABASE_URL                   = https://mnszbkeuerjcevjvdqme.supabase.co
VITE_SUPABASE_ANON_KEY              = [mesma do EXPO_PUBLIC_SUPABASE_ANON_KEY]
```

- [ ] Todas as variáveis adicionadas
- [ ] Scope = Production ✅

### 3. Executar Deploy
- [ ] Clicado em "Deploy"
- [ ] Build concluído com sucesso
- [ ] URL temporária acessível: `https://nossa-maternidadelol-xxx.vercel.app`

---

## 🗃️ MIGRATIONS (10 min)

### Configurar DATABASE_URL Local
```bash
# Criar .env.production com DATABASE_URL de produção
echo 'DATABASE_URL="[sua connection string]"' > .env.production
```

- [ ] Arquivo `.env.production` criado
- [ ] DATABASE_URL configurada

### Executar Migrations
```bash
npm run db:push
```

- [ ] Comando executado sem erros
- [ ] Tabelas criadas no Neon/Supabase Dashboard (~20 tabelas)
- [ ] Verificado: `users`, `profiles`, `habits`, `posts`, etc.

---

## 🌐 DOMÍNIO (60 min)

### 1. Adicionar na Vercel
- [ ] Domínio adicionado: `nossamaternidade.com.br`
- [ ] Domínio adicionado: `www.nossamaternidade.com.br`
- [ ] Valores DNS copiados da Vercel

### 2. Configurar DNS no Registro.br

**Login:** https://registro.br/login

**Adicionar registros:**

| Tipo | Nome | Valor | Feito? |
|------|------|-------|--------|
| A | @ | `76.76.19.19` | [ ] |
| CNAME | www | `cname.vercel-dns.com.` | [ ] |
| TXT | @ | `[valor da Vercel]` | [ ] |

- [ ] Registros antigos removidos (conflitos)
- [ ] Salvou alterações DNS

### 3. Aguardar Propagação (1-48h)

**Verificar:**
```bash
dig nossamaternidade.com.br +short
# Deve retornar: 76.76.19.19

dig www.nossamaternidade.com.br +short
# Deve retornar: cname.vercel-dns.com.
```

- [ ] DNS propagado (ferramenta: https://dnschecker.org)
- [ ] SSL ativo (cadeado verde no navegador)
- [ ] HTTPS funcionando: https://www.nossamaternidade.com.br

---

## ✅ VALIDAÇÃO (30 min)

### Health Checks
```bash
# 1. API Status
curl -I https://www.nossamaternidade.com.br/api/auth/status
# Esperado: HTTP/2 200

# 2. Frontend
curl -I https://www.nossamaternidade.com.br
# Esperado: HTTP/2 200
```

- [ ] API responde (200 OK)
- [ ] Frontend carrega (200 OK)

### Smoke Tests (Navegador)

Abrir: https://www.nossamaternidade.com.br

- [ ] Página inicial carrega
- [ ] Cadastro funciona (criar conta de teste)
- [ ] Login funciona
- [ ] Dashboard aparece após login
- [ ] NathIA (chat) responde mensagens
- [ ] Criar hábito funciona
- [ ] Comunidade carrega posts
- [ ] Console sem erros críticos (F12)

### Logs de Produção
```bash
vercel logs --follow
```

- [ ] Sem erros 500
- [ ] Requests 200 OK
- [ ] "Server started" aparece

---

## 🔐 GITHUB SECRETS (15 min)

**Caminho:** https://github.com/LionGab/Nossa-Maternidadelol/settings/secrets/actions

### Adicionar Secrets

- [ ] `DATABASE_URL` = [connection string]
- [ ] `SESSION_SECRET` = [openssl output]
- [ ] `GEMINI_API_KEY` = [sua key]
- [ ] `PERPLEXITY_API_KEY` = [sua key]
- [ ] `VERCEL_TOKEN` = [criar em https://vercel.com/account/tokens]
- [ ] `VERCEL_ORG_ID` = [copiar do Vercel Dashboard → Settings → General]
- [ ] `VERCEL_PROJECT_ID` = [copiar do Project Settings → General]

### Opcionais (Recursos Avançados)
- [ ] `NEON_API_KEY` (para database branching)
- [ ] `NEON_PROJECT_ID` (para PRs automáticos)

---

## 📊 MONITORAMENTO (20 min)

### Vercel Analytics
- [ ] Ativo automaticamente
- [ ] Verificado em: Project → Analytics

### Sentry (Error Tracking)
- [ ] Conta criada: https://sentry.io/signup
- [ ] Projeto criado: `nossa-maternidade`
- [ ] DSN copiado
- [ ] Adicionado na Vercel: `EXPO_PUBLIC_SENTRY_DSN`

### UptimeRobot (24/7 Monitoring)
- [ ] Conta criada: https://uptimerobot.com
- [ ] Monitor adicionado:
  - URL: `https://www.nossamaternidade.com.br/api/auth/status`
  - Interval: 5 minutes
- [ ] Email de alerta configurado

### Performance Audit
```bash
npx lighthouse https://www.nossamaternidade.com.br --view
```

- [ ] Performance > 90
- [ ] Accessibility > 95
- [ ] Best Practices > 90
- [ ] SEO > 90

---

## 🎉 FINALIZAÇÃO

### GitHub Actions
- [ ] Workflow `ci.yml` executando sem erros
- [ ] Workflow `deploy.yml` executando sem erros
- [ ] Auto-deploy configurado (push to main)

### Documentação
- [ ] README.md atualizado com URL de produção
- [ ] Time notificado sobre deploy
- [ ] Credenciais de admin criadas

### Backup
- [ ] Primeira snapshot criada (Neon Branching ou manual)
- [ ] Plano de backup configurado

---

## 🚨 TROUBLESHOOTING RÁPIDO

| Problema | Solução Rápida |
|----------|----------------|
| Deploy falha | Verificar logs: `vercel logs` |
| DATABASE_URL error | Verificar variável na Vercel |
| 500 error | Executar migrations: `npm run db:push` |
| DNS não funciona | Aguardar 1-48h, usar dnschecker.org |
| SSL não ativa | Aguardar 1h após DNS, re-add domínio |
| GitHub Actions fail | Verificar todos os secrets adicionados |

---

## 📞 SUPORTE

**Problemas?**
1. Consultar: `PLANO_DEPLOY_PRODUCAO.md` (guia completo)
2. Logs: `vercel logs --follow`
3. GitHub Issues: https://github.com/LionGab/Nossa-Maternidadelol/issues

**Documentação:**
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
- Projeto: `DEPLOYMENT.md`

---

## ✨ SUCESSO!

**Quando todos os itens estiverem marcados:**

✅ Site online em: https://www.nossamaternidade.com.br
✅ Deploy automático configurado
✅ Monitoramento ativo 24/7
✅ Pronto para usuários reais!

**Próximos passos:**
- Divulgar URL
- Coletar feedback inicial
- Monitorar métricas (Analytics)
- Iterar baseado em uso real

🎊 **Parabéns pelo deploy!** 🎊
