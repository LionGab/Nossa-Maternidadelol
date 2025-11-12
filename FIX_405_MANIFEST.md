# 🔧 Fix: Erro 405 ao acessar manifest.json

## Problema

Erro **405 (Método não permitido)** ao acessar `/manifest.json` em produção.

```
/manifest.json
405
Método não permitido
```

## Causa

O `vercel.json` não especificava métodos HTTP permitidos nas rotas, causando conflito quando o Vercel tentava rotear requisições GET para arquivos estáticos.

## Solução Aplicada

Adicionados métodos HTTP explícitos nas rotas do `vercel.json`:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|svg|ico|json|woff|woff2|ttf|eot|webp|gif|mp4|webmanifest|xml|txt|pdf))",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "methods": ["GET", "HEAD"],  // ✅ Apenas GET e HEAD para arquivos estáticos
      "continue": true
    },
    {
      "src": "/((?!api|.*\\.[a-z0-9]+$).*)",
      "dest": "/index.html",
      "methods": ["GET", "HEAD"]  // ✅ Apenas GET e HEAD para SPA routing
    }
  ]
}
```

## O Que Foi Corrigido

1. ✅ **Rota de API**: Especificados métodos permitidos (GET, POST, PUT, DELETE, PATCH, OPTIONS)
2. ✅ **Arquivos estáticos**: Apenas GET e HEAD (métodos apropriados para recursos estáticos)
3. ✅ **SPA routing**: Apenas GET e HEAD (métodos apropriados para navegação)

## Por Que Funciona

- **Métodos explícitos**: O Vercel agora sabe exatamente quais métodos cada rota aceita
- **GET e HEAD para estáticos**: Arquivos estáticos só precisam de GET (e HEAD para verificação)
- **Evita conflitos**: Rotas não tentam processar métodos não suportados

## Verificação

Após o deploy, teste:

```bash
# Deve retornar 200 OK
curl -I https://nossa-maternidadelol.vercel.app/manifest.json

# Deve retornar o conteúdo JSON
curl https://nossa-maternidadelol.vercel.app/manifest.json
```

## Notas Técnicas

- **GET**: Método padrão para recuperar recursos
- **HEAD**: Similar ao GET, mas retorna apenas headers (útil para verificação)
- **OPTIONS**: Necessário para CORS preflight requests na API
- **POST/PUT/DELETE/PATCH**: Apenas para rotas de API

## Referências

- [Vercel Routes Documentation](https://vercel.com/docs/configuration/routes)
- [HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

---

**Status:** ✅ Corrigido  
**Arquivo:** `vercel.json`  
**Data:** 2025-01-12

