# 🔄 Limpar Cache do Vercel - Erro 401 no manifest.json

## Problema

O erro **401 (Não autorizado)** no cache do `/manifest.json` indica que o Vercel está servindo uma versão antiga em cache que tinha a configuração incorreta.

## Solução: Limpar Cache do Vercel

### Opção 1: Redeploy (Recomendado)

1. **Vercel Dashboard** → Seu Projeto → **Deployments**
2. Encontre o deployment mais recente
3. Clique em **"..."** → **"Redeploy"**
4. Aguarde o novo deploy completar

Isso força o Vercel a:
- ✅ Rebuildar o projeto
- ✅ Limpar o cache
- ✅ Aplicar a nova configuração do `vercel.json`

### Opção 2: Invalidar Cache Manualmente

1. **Vercel Dashboard** → Seu Projeto → **Settings** → **General**
2. Procure por **"Cache"** ou **"Purge Cache"**
3. Clique em **"Purge All Cache"** ou **"Clear Cache"**
4. Aguarde alguns minutos

### Opção 3: Forçar Novo Deploy via Git

```bash
# Fazer um commit vazio para forçar novo deploy
git commit --allow-empty -m "chore: limpar cache do Vercel"
git push origin main
```

### Opção 4: Usar Vercel CLI

```bash
# Instalar CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Invalidar cache
vercel env pull  # Atualizar env vars localmente
vercel --prod --force  # Forçar novo deploy
```

## Verificação Após Limpar Cache

1. **Aguarde 2-5 minutos** após o redeploy
2. **Teste o manifest.json:**
   ```bash
   curl -I https://nossa-maternidadelol.vercel.app/manifest.json
   ```
   Deve retornar `200 OK`, não `401 Unauthorized`

3. **Teste no navegador:**
   - Abra: https://nossa-maternidadelol.vercel.app/manifest.json
   - Deve mostrar o JSON, não erro 401

4. **Limpar cache do navegador:**
   - Pressione `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
   - Ou abra DevTools → Network → "Disable cache"

## Configuração Atualizada

O `vercel.json` foi atualizado para garantir que arquivos estáticos sejam servidos corretamente:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"  // ✅ Serve arquivos estáticos primeiro
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|svg|ico|json|woff|woff2|ttf|eot|webp|gif|mp4|webmanifest|xml|txt|pdf))",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "continue": true  // ✅ Continua para filesystem handle
    },
    {
      "src": "/((?!api|.*\\.[a-z0-9]+$).*)",
      "dest": "/index.html"
    }
  ]
}
```

## Por Que Aconteceu?

1. **Cache do Vercel:** O Vercel cacheia respostas para melhor performance
2. **Configuração Antiga:** O cache tinha a versão antiga do `vercel.json`
3. **401 em Cache:** A versão antiga redirecionava tudo para `/api`, causando 401

## Prevenção

Após corrigir:
- ✅ O `filesystem` handle serve arquivos estáticos **antes** de qualquer rewrite
- ✅ Arquivos com extensões são explicitamente excluídos do rewrite
- ✅ Cache headers garantem que arquivos estáticos sejam cacheados corretamente

---

**Status:** ⚠️ Requer limpeza de cache  
**Ação:** Redeploy ou invalidar cache manualmente  
**Data:** 2025-01-12

