# ✅ Configurar Verificações de Deployment no Vercel

## O Que São Verificações de Deployment?

As **verificações de deployment** (Deployment Checks) são testes e validações que o Vercel executa antes de promover um deployment para produção. Elas garantem que apenas código que passou em todas as verificações seja publicado.

## Por Que Configurar?

- ✅ **Previne deploys quebrados** - Código com erros não vai para produção
- ✅ **Garante qualidade** - Apenas código testado e validado
- ✅ **Reduz downtime** - Menos bugs em produção
- ✅ **Automação** - Não precisa verificar manualmente

## Tipos de Verificações Disponíveis

### 1. GitHub Actions / CI/CD

Use GitHub Actions para executar testes antes do deploy:

```yaml
# .github/workflows/vercel-deploy-check.yml
name: Vercel Deployment Check
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check  # TypeScript check
      - run: npm run build  # Build test
      # Adicione mais verificações conforme necessário
```

### 2. Status Checks do GitHub

O Vercel pode esperar por status checks do GitHub antes de promover:

1. **Vercel Dashboard** → Seu Projeto → **Settings** → **Git**
2. Em **"Deployment Protection"**, configure:
   - **Required Status Checks**: Selecione os checks que devem passar
   - **Branch Protection**: Configure proteção de branch no GitHub

### 3. Vercel Build Checks

O próprio Vercel pode verificar se o build foi bem-sucedido:

- ✅ Build bem-sucedido
- ✅ Sem erros de TypeScript
- ✅ Sem erros de lint
- ✅ Testes passando (se configurados)

## Configuração Passo a Passo

### Opção 1: GitHub Actions (Recomendado)

#### 1. Criar Workflow do GitHub Actions

Crie `.github/workflows/vercel-deploy-check.yml`:

```yaml
name: Pre-Deploy Checks

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  checks:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript check
        run: npm run check
      
      - name: Build test
        run: npm run build
      
      # Adicione testes quando disponíveis
      # - name: Run tests
      #   run: npm test
```

#### 2. Configurar no Vercel

1. **Vercel Dashboard** → Seu Projeto → **Settings** → **Git**
2. Em **"Deployment Protection"**:
   - Habilite **"Wait for Checks"**
   - Selecione **"Required Status Checks"**
   - Adicione: `checks` (nome do job do GitHub Actions)

#### 3. Configurar Branch Protection no GitHub

1. **GitHub** → Seu Repositório → **Settings** → **Branches**
2. Adicione regra para branch `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Selecione o check: `checks`

### Opção 2: Vercel Build Checks (Mais Simples)

Se não quiser usar GitHub Actions, o Vercel pode verificar automaticamente:

1. **Vercel Dashboard** → Seu Projeto → **Settings** → **General**
2. Em **"Deployment Protection"**:
   - ✅ **"Block deployments that fail build"** - Bloqueia se build falhar
   - ✅ **"Block deployments that fail function builds"** - Bloqueia se serverless functions falharem

## Configuração Recomendada para Este Projeto

### Mínimo (Build Checks)

```yaml
# Apenas verificar se build funciona
Deployment Protection:
  - Block deployments that fail build: ✅
  - Block deployments that fail function builds: ✅
```

### Recomendado (GitHub Actions)

✅ **Já criado:** `.github/workflows/pre-deploy-checks.yml`

Este workflow executa:
- ✅ TypeScript validation (`npm run check`)
- ✅ Build test (`npm run build`)
- ✅ Retorna status check que o Vercel pode usar

**Próximo passo:** Configurar no Vercel Dashboard para usar este status check.

## Verificações que Podem Ser Adicionadas

### Atualmente Disponíveis

- ✅ **TypeScript Check** - `npm run check`
- ✅ **Build Test** - `npm run build`
- ✅ **Lint** - (quando configurado)

### Futuro (Quando Implementado)

- ⏳ **Unit Tests** - `npm test`
- ⏳ **E2E Tests** - Testes end-to-end
- ⏳ **Security Audit** - `npm audit`
- ⏳ **Bundle Size Check** - Verificar tamanho do bundle

## Como Funciona

### Fluxo com Verificações

```
1. Push para main
   ↓
2. Vercel inicia build
   ↓
3. GitHub Actions executa checks (se configurado)
   ↓
4. Aguarda status checks passarem
   ↓
5. Se todos passarem → Deploy para produção
   ↓
6. Se algum falhar → Deploy bloqueado
```

### Sem Verificações (Atual)

```
1. Push para main
   ↓
2. Vercel inicia build
   ↓
3. Se build passar → Deploy imediato
   ↓
4. Se build falhar → Deploy bloqueado
```

## Configuração Atual vs Recomendada

### Atual (Sem Verificações)

- ⚠️ Apenas verifica se build funciona
- ⚠️ Não verifica TypeScript antes do deploy
- ⚠️ Não verifica testes
- ⚠️ Deploy pode ir para produção com warnings

### Recomendado (Com Verificações)

- ✅ Verifica TypeScript antes do deploy
- ✅ Verifica build antes do deploy
- ✅ Pode adicionar testes no futuro
- ✅ Deploy só vai para produção se tudo passar

## Próximos Passos

### Imediato

1. ✅ Habilitar **"Block deployments that fail build"** no Vercel
2. ✅ Habilitar **"Block deployments that fail function builds"** no Vercel

### Curto Prazo

1. Criar `.github/workflows/vercel-deploy-check.yml`
2. Configurar GitHub Actions para executar checks
3. Configurar branch protection no GitHub
4. Configurar Vercel para esperar status checks

### Longo Prazo

1. Adicionar testes unitários
2. Adicionar testes E2E
3. Adicionar verificação de segurança
4. Adicionar verificação de bundle size

## Troubleshooting

### Verificações Não Estão Sendo Executadas

1. Verifique se o workflow está no branch correto
2. Verifique se o nome do job corresponde ao configurado no Vercel
3. Verifique logs do GitHub Actions

### Deploy Bloqueado Incorretamente

1. Verifique logs do GitHub Actions
2. Verifique se todos os checks estão passando
3. Verifique configuração de branch protection

### Verificações Demoram Muito

1. Use cache do npm (`cache: 'npm'` no setup-node)
2. Execute verificações em paralelo (múltiplos jobs)
3. Considere verificações mais rápidas

## Referências

- [Vercel: Deployment Protection](https://vercel.com/docs/deployments/deployment-protection)
- [GitHub Actions: Status Checks](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [GitHub: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

**Status:** ⚠️ Não configurado (recomendado configurar)  
**Prioridade:** Média (melhora qualidade, mas não crítico)  
**Data:** 2025-01-12

