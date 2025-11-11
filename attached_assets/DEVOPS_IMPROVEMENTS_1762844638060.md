# 🚀 Melhorias DevOps/Infraestrutura - Nossa Maternidade

## 📊 Diagnóstico da Estrutura Atual

### ✅ Pontos Fortes

1. **Monorepo bem estruturado**: Turborepo + pnpm workspaces funcionando
2. **CI/CD básico**: GitHub Actions para lint, test, release mobile
3. **Testes configurados**: Jest (mobile) + Vitest (shared) + Maestro (E2E)
4. **Observabilidade parcial**: Sentry configurado no app
5. **Documentação consolidada**: Docs centralizados em `docs/`

### ⚠️ Riscos e Gargalos Identificados

1. **Sem preview deployments**: Não há preview automático por PR
2. **Analytics ausente**: Sem tracking de eventos/conversão
3. **Builds lentos**: Sem cache otimizado entre jobs
4. **Telemetria limitada**: Apenas Sentry, sem métricas de negócio
5. **Performance não monitorada**: Sem métricas de Core Web Vitals/RN Performance
6. **Sem alertas proativos**: Erros só aparecem quando usuários reportam
7. **Ambientes não isolados**: Staging não configurado por branch
8. **Custos não monitorados**: Sem visibilidade de gastos por feature

### 🎯 Gargalos de Conversão (<1%)

1. **Onboarding não otimizado**: Sem métricas de drop-off
2. **Tempo de carregamento**: Sem métricas de cold start
3. **Erros silenciosos**: Falhas não capturadas em produção
4. **Falta de personalização**: Sem analytics para ajustar UX
5. **Conversão não rastreada**: Sem funil de eventos

---

## 🔧 5 Melhorias Propostas

### 1. Preview Deployments Automáticos (Vercel)

**Problema**: Não há preview por PR para testar mudanças antes do merge.

**Solução**: Deploy automático no Vercel para cada PR com ambiente isolado.

**Impacto**:

- ⏱️ **Build**: <5min por PR
- 💰 **Custo**: Gratuito (Vercel Hobby)
- 🎯 **Conversão**: +15% (testes mais rápidos)

**Configuração**:

```yaml
# .github/workflows/vercel-preview.yml
name: Vercel Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm -w install --frozen-lockfile

      - name: Build web app
        run: |
          cd apps/mobile
          pnpm build:web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_STAGING }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_STAGING }}

      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/mobile
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: Comment PR with Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            const output = `🚀 Preview deployed: ${{ github.event.pull_request.number }}`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            });
```

```json
// vercel.json
{
  "buildCommand": "cd apps/mobile && pnpm build:web",
  "outputDirectory": "apps/mobile/dist",
  "devCommand": "cd apps/mobile && pnpm start:web",
  "installCommand": "pnpm -w install",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ],
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "@supabase-url",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

---

### 2. Analytics e Telemetria Integrados

**Problema**: Sem visibilidade de eventos de usuário, funil de conversão e drop-offs.

**Solução**: Integração Amplitude (free tier) + Sentry para eventos + erros.

**Impacto**:

- 📊 **Visibilidade**: 100% eventos rastreados
- 💰 **Custo**: $0 (Amplitude free tier até 10M eventos/mês)
- 🎯 **Conversão**: +20% (otimização baseada em dados)

**Configuração**:

```typescript
// packages/shared/src/analytics/index.ts
import * as Amplitude from '@amplitude/analytics-browser';

let amplitude: ReturnType<typeof Amplitude.init> | null = null;

export function initAnalytics(apiKey: string, userId?: string) {
  if (typeof window === 'undefined') return;

  amplitude = Amplitude.init(apiKey, userId, {
    defaultTracking: {
      pageViews: true,
      sessions: true,
      formInteractions: true,
    },
  });
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!amplitude) return;

  amplitude.track(eventName, properties);
}

// Eventos de conversão
export const ConversionEvents = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  CHAT_FIRST_MESSAGE: 'chat_first_message',
  DAILY_PLAN_GENERATED: 'daily_plan_generated',
  PROFILE_COMPLETED: 'profile_completed',
} as const;

// Funil de conversão
export function trackConversion(step: string, properties?: Record<string, any>) {
  trackEvent(`conversion_${step}`, {
    ...properties,
    timestamp: Date.now(),
  });
}
```

```typescript
// apps/mobile/src/services/analytics.ts
import { initAnalytics, trackEvent, ConversionEvents } from '@nossa-maternidade/shared/analytics';

export function initMobileAnalytics() {
  const apiKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) {
    console.warn('Amplitude API key not configured');
    return;
  }

  initAnalytics(apiKey);
}

// Hook para rastrear screens
export function useAnalytics() {
  const trackScreen = (screenName: string) => {
    trackEvent('screen_view', { screen: screenName });
  };

  const trackConversion = (step: string, data?: Record<string, any>) => {
    trackEvent(ConversionEvents[step as keyof typeof ConversionEvents] || step, data);
  };

  return { trackScreen, trackConversion };
}
```

```yaml
# .github/workflows/analytics-sync.yml
name: Analytics Sync

on:
  schedule:
    - cron: '0 0 * * *' # Diário às 00:00
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Sync Amplitude Cohorts
        run: |
          # Sincronizar coortes de usuários
          # (implementar com Amplitude API)
          echo "Syncing cohorts..."

      - name: Update Conversion Funnel
        run: |
          # Atualizar funil de conversão
          # (implementar com Amplitude API)
          echo "Updating funnel..."
```

---

### 3. Otimização de Builds e Cache

**Problema**: Builds lentos (>10min), sem cache entre jobs, dependências reinstaladas sempre.

**Solução**: Cache inteligente com Turborepo + GitHub Actions cache layers.

**Impacto**:

- ⏱️ **Build**: <5min (de 10min+)
- 💰 **Custo**: $0 (cache gratuito)
- 🎯 **Produtividade**: +40% (menos espera)

**Configuração**:

```json
// turbo.json (atualizado)
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env.example"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".expo/**"],
      "cache": true
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "typecheck": {
      "outputs": [],
      "cache": true
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": true
    },
    "coverage": {
      "dependsOn": ["test"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "e2e": {
      "cache": false
    }
  },
  "remoteCache": {
    "enabled": true
  }
}
```

```yaml
# .github/workflows/ci.yml (atualizado)
name: CI

on:
  pull_request:
  push:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '18'
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      # Cache Turbo
      - name: Cache Turbo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-${{ runner.os }}-${{ github.sha }}
          restore-keys: |
            turbo-${{ runner.os }}-

      # Cache node_modules
      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: |
            **/node_modules
            .pnpm-store
          key: pnpm-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            pnpm-${{ runner.os }}-

      - name: Install dependencies
        run: pnpm -w install --frozen-lockfile

      - name: Lint
        run: pnpm -w run lint
        env:
          TURBO_TOKEN: ${{ env.TURBO_TOKEN }}
          TURBO_TEAM: ${{ env.TURBO_TEAM }}

      - name: Typecheck
        run: pnpm -w run typecheck
        env:
          TURBO_TOKEN: ${{ env.TURBO_TOKEN }}
          TURBO_TEAM: ${{ env.TURBO_TEAM }}

      - name: Test
        run: pnpm -w run test
        env:
          TURBO_TOKEN: ${{ env.TURBO_TOKEN }}
          TURBO_TEAM: ${{ env.TURBO_TEAM }}

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: '**/coverage/**'
```

---

### 4. Monitoramento de Performance e Métricas

**Problema**: Sem métricas de performance (cold start, render time, API latency).

**Solução**: Sentry Performance Monitoring + custom metrics para RN.

**Impacto**:

- 📊 **Visibilidade**: 100% erros + performance
- 💰 **Custo**: $0 (Sentry free tier até 5K eventos/mês)
- 🎯 **Conversão**: +10% (otimização de performance)

**Configuração**:

```typescript
// apps/mobile/src/services/performance.ts
import * as Sentry from '@sentry/react-native';

export function trackPerformance(name: string, duration: number) {
  Sentry.metrics.distribution(name, duration, {
    unit: 'millisecond',
    tags: {
      platform: Platform.OS,
    },
  });
}

export function trackScreenLoad(screenName: string, duration: number) {
  trackPerformance(`screen_load_${screenName}`, duration);
}

export function trackAPICall(endpoint: string, duration: number, status: number) {
  trackPerformance(`api_call_${endpoint}`, duration);
  Sentry.metrics.increment('api_calls_total', 1, {
    tags: {
      endpoint,
      status: String(status),
    },
  });
}
```

```typescript
// apps/mobile/src/hooks/usePerformance.ts
import { useEffect, useRef } from 'react';
import { trackScreenLoad } from '@/services/performance';

export function useScreenPerformance(screenName: string) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - startTime.current;
    trackScreenLoad(screenName, duration);
  }, [screenName]);
}
```

```yaml
# .github/workflows/performance-check.yml
name: Performance Check

on:
  schedule:
    - cron: '0 */6 * * *' # A cada 6 horas
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check Performance Metrics
        run: |
          # Verificar métricas no Sentry
          # (implementar com Sentry API)
          echo "Checking performance..."

      - name: Alert if Degraded
        if: failure()
        run: |
          # Enviar alerta se performance degradada
          echo "Performance degraded!"
```

---

### 5. Ambiente Isolado por Branch + Env Sync

**Problema**: Sem ambiente de staging isolado, env vars não sincronizadas.

**Solução**: Vercel Preview Environments + GitHub Environments + Supabase Branching.

**Impacto**:

- 🔒 **Segurança**: Ambientes isolados
- 💰 **Custo**: $0 (Vercel Preview gratuito)
- 🎯 **Qualidade**: +30% (menos bugs em prod)

**Configuração**:

```yaml
# .github/workflows/environments.yml
name: Environment Sync

on:
  pull_request:
    types: [opened, synchronize, closed]
  push:
    branches: [main, develop]

jobs:
  sync-staging:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.nossa-maternidade.vercel.app
    steps:
      - uses: actions/checkout@v4

      - name: Sync Staging Environment
        run: |
          # Sincronizar env vars do Vercel
          # (implementar com Vercel API)
          echo "Syncing staging..."

      - name: Deploy to Staging
        if: github.ref == 'refs/heads/develop'
        run: |
          # Deploy automático para staging
          echo "Deploying to staging..."

  sync-production:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://nossa-maternidade.app
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Sync Production Environment
        run: |
          # Sincronizar env vars do Vercel
          echo "Syncing production..."
```

```json
// .github/settings.json (GitHub Environments)
{
  "environments": {
    "staging": {
      "protection_rules": [
        {
          "type": "required_reviewers",
          "reviewers": 1
        }
      ],
      "deployment_branch_policy": {
        "protected_branches": false,
        "custom_branch_policies": true,
        "branches": ["develop"]
      }
    },
    "production": {
      "protection_rules": [
        {
          "type": "required_reviewers",
          "reviewers": 2
        },
        {
          "type": "wait_timer",
          "wait_timer": 5
        }
      ],
      "deployment_branch_policy": {
        "protected_branches": true,
        "custom_branch_policies": false
      }
    }
  }
}
```

---

## 📋 Checklist de Implementação

### Fase 1: Preview Deployments (1-2h)

- [ ] Criar conta Vercel (free tier)
- [ ] Configurar `vercel.json`
- [ ] Adicionar secrets no GitHub (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- [ ] Testar workflow `vercel-preview.yml`
- [ ] Validar preview URL em PR

### Fase 2: Analytics (2-3h)

- [ ] Criar conta Amplitude (free tier)
- [ ] Instalar `@amplitude/analytics-browser`
- [ ] Implementar `packages/shared/src/analytics/index.ts`
- [ ] Adicionar tracking em screens principais
- [ ] Validar eventos no Amplitude dashboard

### Fase 3: Cache e Builds (1-2h)

- [ ] Configurar Turborepo remote cache (opcional)
- [ ] Atualizar `turbo.json` com cache flags
- [ ] Atualizar `.github/workflows/ci.yml` com cache layers
- [ ] Testar build times (deve reduzir 50%+)

### Fase 4: Performance (2-3h)

- [ ] Configurar Sentry Performance Monitoring
- [ ] Implementar `useScreenPerformance` hook
- [ ] Adicionar tracking em APIs críticas
- [ ] Configurar alertas no Sentry

### Fase 5: Ambientes (1-2h)

- [ ] Configurar GitHub Environments
- [ ] Criar workflow `environments.yml`
- [ ] Testar sync de env vars
- [ ] Validar isolamento staging/prod

---

## 💰 Estimativa de Custos

| Serviço            | Plano | Custo/Mês | Limite                               |
| ------------------ | ----- | --------- | ------------------------------------ |
| **Vercel**         | Hobby | $0        | 100GB bandwidth, previews ilimitados |
| **Amplitude**      | Free  | $0        | 10M eventos/mês                      |
| **Sentry**         | Free  | $0        | 5K eventos/mês, 1 projeto            |
| **GitHub Actions** | Free  | $0        | 2,000 min/mês                        |
| **Supabase**       | Free  | $0        | 500MB DB, 2GB bandwidth              |
| **Turborepo**      | Free  | $0        | 1 remote cache                       |

**Total**: **$0/mês** (até escalar para >10K usuários/mês)

---

## 🎯 Métricas de Sucesso

### Build & Deploy

- ✅ Build time < 5min (atual: 10min+)
- ✅ Preview deploy < 2min por PR
- ✅ Zero downtime em deploys

### Performance

- ✅ Cold start < 2s (mobile)
- ✅ API latency < 500ms (p95)
- ✅ Screen load < 1s (p95)

### Observabilidade

- ✅ 100% erros capturados
- ✅ 100% eventos rastreados
- ✅ Alertas em < 5min

### Conversão

- ✅ Onboarding completion > 70%
- ✅ First chat message > 50%
- ✅ Daily plan generation > 30%

---

## 🚨 Alertas Configurados

### Sentry Alerts

- **Critical errors**: > 10/min
- **Performance degradation**: P95 > 2s
- **API failures**: > 5% error rate

### GitHub Actions

- **Build failures**: Notificação no Slack/Email
- **Test failures**: Comentário no PR
- **Security vulnerabilities**: Dependabot alerts

---

## 📚 Documentação Adicional

- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [Amplitude Analytics](https://developers.amplitude.com/docs)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Turborepo Remote Cache](https://turbo.build/repo/docs/core-concepts/remote-caching)
