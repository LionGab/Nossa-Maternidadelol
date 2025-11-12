# ✅ Verificação do Deploy no Vercel

**URL:** https://nossa-maternidadelol.vercel.app/

## 🔍 Checklist de Verificação

### 1. Frontend Carrega?
- [ ] Acesse: https://nossa-maternidadelol.vercel.app/
- [ ] A página inicial carrega sem erros
- [ ] Não há erros 401/403/404 no console
- [ ] O manifest.json carrega corretamente

### 2. Arquivos Estáticos Funcionam?
Teste estes URLs diretamente no navegador:

- [ ] https://nossa-maternidadelol.vercel.app/manifest.json (deve retornar JSON, não 401)
- [ ] https://nossa-maternidadelol.vercel.app/favicon.png (deve mostrar imagem)
- [ ] https://nossa-maternidadelol.vercel.app/icon-192.png (deve mostrar imagem)

### 3. API Funciona?
Teste com curl ou no navegador:

```bash
# Health check (se existir)
curl https://nossa-maternidadelol.vercel.app/api/health

# Teste de registro
curl -X POST https://nossa-maternidadelol.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Teste",
    "stage": "pregnant"
  }'
```

### 4. SPA Routing Funciona?
- [ ] https://nossa-maternidadelol.vercel.app/nathia (carrega página)
- [ ] https://nossa-maternidadelol.vercel.app/habitos (carrega página)
- [ ] https://nossa-maternidadelol.vercel.app/mae-valente (carrega página)

### 5. Console do Navegador
Abra DevTools (F12) e verifique:

- [ ] Sem erros 401 Unauthorized
- [ ] Sem erros 404 Not Found
- [ ] Sem erros de CORS
- [ ] Manifest.json carrega com status 200

## 🐛 Problemas Comuns

### Erro 401 no manifest.json
**Solução:** Já corrigido no `vercel.json` com regex que exclui arquivos estáticos.

### Erro CORS
**Causa:** `api/index.ts` pode não ter o domínio do Vercel na lista de allowed origins.

**Verificar:** O CORS em `api/index.ts` inclui:
```typescript
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : [
      'https://nossa-maternidadelol.vercel.app',  // ✅ Deve estar aqui
      'https://www.nossamaternidade.com.br',
      'https://nossamaternidade.com.br'
    ];
```

### Página em Branco
**Causa:** Erro JavaScript ou build falhou.

**Verificar:**
1. Vercel Dashboard → Deployments → Latest → Build Logs
2. Console do navegador (F12) → Console tab
3. Verificar se há erros de importação ou runtime

### API Retorna 500
**Causa:** Variáveis de ambiente faltando ou erro no código.

**Verificar:**
1. Vercel Dashboard → Settings → Environment Variables
2. Todas as variáveis obrigatórias estão configuradas?
3. Vercel Dashboard → Deployments → Latest → Runtime Logs

## 📊 Status do Deploy

Verifique no Vercel Dashboard:

1. **Deployments** → Latest
   - Status: ✅ Ready / ⚠️ Building / ❌ Error
   - Build time: ~2-5 minutos
   - Runtime: Node.js 20+

2. **Settings** → General
   - Root Directory: `.` (correto)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`

3. **Settings** → Environment Variables
   - `NODE_ENV=production` ✅
   - `SESSION_SECRET` (32+ chars) ✅
   - `DATABASE_URL` ✅
   - `GEMINI_API_KEY` ✅
   - `PERPLEXITY_API_KEY` ✅
   - `SUPABASE_URL` ✅
   - `SUPABASE_SERVICE_ROLE_KEY` ✅
   - `VITE_SUPABASE_URL` ✅
   - `VITE_SUPABASE_ANON_KEY` ✅

## 🔧 Comandos Úteis para Debug

### Ver Logs em Tempo Real
```bash
vercel logs --follow
```

### Verificar Configuração
```bash
vercel inspect
```

### Testar Localmente (Produção)
```bash
npm run build
npm start
# Acesse http://localhost:5000
```

## ✅ Se Tudo Estiver OK

Se todos os itens acima estão funcionando:

1. ✅ Frontend carrega
2. ✅ Manifest.json acessível (200, não 401)
3. ✅ API responde
4. ✅ SPA routing funciona
5. ✅ Sem erros no console

**Parabéns! O deploy está funcionando! 🎉**

Próximo passo: Configurar domínio customizado `www.nossamaternidade.com.br` (se ainda não fez).

---

**Última atualização:** 2025-01-12

