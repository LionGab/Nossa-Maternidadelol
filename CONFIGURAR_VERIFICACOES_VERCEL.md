# ⚙️ Configurar Verificações de Deployment no Vercel

## ✅ O Que Foi Criado

1. ✅ **Workflow GitHub Actions** - `.github/workflows/pre-deploy-checks.yml`
   - Executa TypeScript check
   - Executa build test
   - Retorna status check para o Vercel usar

2. ✅ **Documentação Completa** - `VERCEL_DEPLOYMENT_CHECKS.md`

## 🚀 Como Configurar no Vercel (Passo a Passo)

### Passo 1: Aguardar Primeiro Run do Workflow

1. O workflow será executado automaticamente no próximo push
2. Verifique em: **GitHub** → Seu Repositório → **Actions**
3. Aguarde o workflow `Pre-Deploy Checks` completar com sucesso

### Passo 2: Configurar no Vercel Dashboard

1. **Acesse:** https://vercel.com/dashboard → Seu Projeto → **Settings** → **Git**

2. **Em "Deployment Protection":**
   - ✅ Habilite **"Wait for Checks"**
   - ✅ Em **"Required Status Checks"**, adicione:
     - `checks` (nome do job do GitHub Actions)

3. **Salve as alterações**

### Passo 3: Configurar Branch Protection (Opcional mas Recomendado)

1. **GitHub** → Seu Repositório → **Settings** → **Branches**

2. **Adicione regra para branch `main`:**
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ Selecione o check: **`checks`**

3. **Salve as alterações**

## 📊 Como Funciona

### Antes (Sem Verificações)

```
Push → Vercel Build → Deploy Imediato
```

### Depois (Com Verificações)

```
Push → GitHub Actions (checks) → Aguarda passar → Vercel Build → Deploy
```

## ✅ Verificação

Após configurar, teste fazendo um push:

1. **Faça um commit e push**
2. **GitHub Actions** executará `Pre-Deploy Checks`
3. **Vercel** aguardará o check passar
4. **Se passar** → Deploy para produção
5. **Se falhar** → Deploy bloqueado

## 🔍 Onde Verificar

### GitHub Actions
- **URL:** `https://github.com/SEU_USUARIO/SEU_REPO/actions`
- **Workflow:** `Pre-Deploy Checks`
- **Status:** ✅ (verde) = passou, ❌ (vermelho) = falhou

### Vercel Dashboard
- **URL:** `https://vercel.com/dashboard` → Seu Projeto → **Deployments**
- **Status:** Mostra se está aguardando checks ou se passou

## 🐛 Troubleshooting

### Workflow Não Aparece no Vercel

1. Verifique se o workflow foi executado pelo menos uma vez
2. Verifique se o nome do job é exatamente `checks`
3. Aguarde alguns minutos após o primeiro run

### Deploy Não Aguarda Checks

1. Verifique se **"Wait for Checks"** está habilitado
2. Verifique se o nome do check está correto
3. Verifique se o check está passando (verde no GitHub)

### Check Falha Incorretamente

1. Verifique logs do GitHub Actions
2. Execute localmente: `npm run check` e `npm run build`
3. Corrija os erros antes de fazer push

## 📝 Notas

- **Primeira vez:** O workflow precisa rodar pelo menos uma vez antes de aparecer no Vercel
- **Tempo:** Checks adicionam ~2-3 minutos ao tempo de deploy
- **Benefício:** Previne deploys quebrados, vale a pena o tempo extra

---

**Status:** ✅ Workflow criado, aguardando configuração no Vercel  
**Próxima Ação:** Configurar no Vercel Dashboard após primeiro run do workflow  
**Data:** 2025-01-12

