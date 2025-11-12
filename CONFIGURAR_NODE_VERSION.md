# 🔧 Configurar Versão do Node.js no Vercel

## ✅ Configuração Aplicada

O `vercel.json` já foi atualizado com:
```json
{
  "nodeVersion": "20.x"
}
```

## 📋 Configuração no Dashboard (Recomendado)

Para garantir que a versão está correta, configure também no dashboard:

### Passo a Passo

1. **Acesse:** Vercel Dashboard → Seu Projeto → **Settings** → **General**

2. **Encontre a seção:** "Node.js Version" ou "Versão do Node.js"

3. **Selecione:** `20.x` (ou a versão mais recente disponível)

4. **Clique em:** "Save"

5. **Faça um novo deploy:**
   - Push para GitHub (deploy automático)
   - Ou clique em "Redeploy" no último deployment

## ⚠️ Importante

- **Build e Runtime:** A versão do Node.js afeta tanto o **build** quanto as **serverless functions**
- **Mudanças:** Uma nova implantação é necessária para que as alterações entrem em vigor
- **Compatibilidade:** O projeto requer Node.js >= 20.0.0 (verificado no `package.json`)

## 🔍 Verificação

Após configurar, verifique nos logs do deploy:

1. **Vercel Dashboard** → **Deployments** → **Latest** → **Build Logs**
2. Procure por: `Node.js version: 20.x.x` ou similar
3. Confirme que não há erros relacionados à versão do Node.js

## 📊 Versões Suportadas pelo Vercel

- Node.js 18.x (LTS)
- Node.js 20.x (LTS) ✅ **Recomendado para este projeto**
- Node.js 22.x (Latest)

## 🐛 Troubleshooting

### Erro: "Unsupported Node.js version"
**Solução:** Certifique-se de que selecionou Node.js 20.x no dashboard

### Build falha com erros de sintaxe
**Causa:** Versão do Node.js muito antiga
**Solução:** Atualize para Node.js 20.x

### Serverless function retorna erro
**Causa:** Incompatibilidade entre versão do build e runtime
**Solução:** Garanta que ambos usam Node.js 20.x

---

**Status:** ✅ Configurado no `vercel.json`  
**Ação Necessária:** Configurar também no Vercel Dashboard  
**Data:** 2025-01-12

