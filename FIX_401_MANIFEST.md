# 🔧 Fix: Erro 401 ao carregar manifest.json

## Problema

O erro `Manifest fetch from https://nossa-maternidadelol-git-main-liams-projects-a37cc75c.vercel.app/manifest.json failed, code 401` ocorria porque o `vercel.json` estava redirecionando **todas** as requisições (incluindo arquivos estáticos) para `/index.html`, que por sua vez estava sendo processado pela serverless function `/api`, que requer autenticação.

## Solução Aplicada

### Configuração Final (vercel.json):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"  // ✅ Serve arquivos estáticos primeiro
    },
    {
      "src": "/((?!api|.*\\.[a-z0-9]+$).*)",  // ✅ Exclui arquivos com extensões
      "dest": "/index.html"
    }
  ],
  "outputDirectory": "dist/public"
}
```

### Componentes da Solução:

1. **Build para Frontend**: `@vercel/static-build` compila o frontend para `dist/public`
2. **Build para Backend**: `@vercel/node` compila a serverless function em `api/index.ts`
3. **Filesystem Handle**: Serve arquivos estáticos antes de aplicar rewrites
4. **Regex no último route**: Exclui arquivos com extensões do rewrite para SPA

## Como Funciona

A regex `/((?!api|.*\\.[a-z0-9]+$).*)` usa **negative lookahead** para excluir:

1. **Rotas que começam com `api`** - Já são tratadas pelo primeiro rewrite
2. **Arquivos com extensões** - Qualquer coisa que termine com `.` seguido de letras/números (ex: `.json`, `.png`, `.js`, `.css`)

Isso permite que:
- ✅ Arquivos estáticos (`manifest.json`, `favicon.png`, `icon-*.png`, etc.) sejam servidos diretamente pelo Vercel
- ✅ Rotas do SPA (`/nathia`, `/habitos`, etc.) sejam redirecionadas para `/index.html`
- ✅ Rotas da API (`/api/*`) sejam processadas pela serverless function

## Arquivos Estáticos Servidos Corretamente

Com essa configuração, os seguintes arquivos são servidos diretamente (sem passar pelo rewrite):

- `/manifest.json` ✅
- `/favicon.png` ✅
- `/icon-*.png` ✅
- `/sw.js` ✅
- `/offline.html` ✅
- `/assets/*.js` ✅
- `/assets/*.css` ✅
- `/assets/*.png` ✅
- Qualquer outro arquivo com extensão ✅

## Verificação

Após o deploy, verifique:

1. **Manifest carrega corretamente:**
   ```bash
   curl https://seu-dominio.vercel.app/manifest.json
   ```
   Deve retornar o conteúdo JSON, não 401.

2. **SPA routing funciona:**
   - Acesse `https://seu-dominio.vercel.app/nathia`
   - Deve carregar a página (não 404)

3. **API funciona:**
   ```bash
   curl https://seu-dominio.vercel.app/api/health
   ```
   Deve retornar resposta da API.

## Notas Técnicas

- O Vercel serve arquivos estáticos automaticamente do `outputDirectory` (`dist/public`) **antes** de aplicar rewrites
- O rewrite só é aplicado se o arquivo não existir como estático
- A regex usa `[a-z0-9]+` para capturar extensões comuns (pode ser ajustada se necessário)

## Referências

- [Vercel Rewrites Documentation](https://vercel.com/docs/configuration/routes/rewrites)
- [Vercel Static Files](https://vercel.com/docs/configuration/routes/static-files)

---

**Status:** ✅ Corrigido  
**Data:** 2025-01-12

