# 🧪 Testes - Nossa Maternidade

## Setup

### 1. Instalar Dependências

```bash
npm install
```

Isso instalará:
- `vitest` - Framework de testes
- `@vitest/ui` - Interface visual para testes
- `@vitest/coverage-v8` - Coverage reports

### 2. Rodar Testes

```bash
# Rodar todos os testes uma vez
npm run test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Interface visual
npm run test:ui

# Com coverage
npm run test:coverage
```

## Estrutura de Testes

```
tests/
├── setup.ts                    # Setup global
├── server/
│   ├── unit/                   # Testes unitários
│   │   ├── validation.test.ts  # Validação Zod
│   │   ├── pagination.test.ts  # Utilitários de paginação
│   │   └── rate-limit.test.ts  # Rate limiters
│   └── integration/            # Testes de integração (futuro)
└── shared/
    └── unit/                   # Testes de schemas (futuro)
```

## Testes Implementados

### ✅ Validação (validation.test.ts)
- Testa todos os schemas Zod
- Validação de inputs válidos
- Rejeição de inputs inválidos
- Mensagens de erro em português
- Trim de espaços em branco

### ✅ Paginação (pagination.test.ts)
- Schema de paginação
- Cálculo de metadata
- Paginação de arrays
- Validação de limites

### ✅ Rate Limiting (rate-limit.test.ts)
- Configuração de limiters
- Skip em desenvolvimento
- Comportamento em produção

## Próximos Testes a Implementar

1. **Testes de Integração**
   - Rotas da API
   - Autenticação
   - Storage layer

2. **Testes E2E**
   - Fluxos completos
   - Playwright

3. **Testes de Performance**
   - Latência de APIs
   - Bundle size

## Coverage

Meta: **> 80% coverage**

Áreas críticas (meta: **> 90%**):
- Validação (Zod schemas)
- Autenticação
- Rate limiting
- Paginação

## Comandos Úteis

```bash
# Rodar apenas testes de validação
npm run test -- validation

# Rodar com verbose
npm run test -- --reporter=verbose

# Rodar testes em paralelo (padrão)
npm run test -- --threads

# Rodar testes sequencialmente
npm run test -- --no-threads
```

## Troubleshooting

### Erro: "Cannot find module 'vitest/config'"
**Solução:** Execute `npm install` para instalar dependências

### Testes não encontram módulos
**Solução:** Verifique se `vitest.config.ts` tem os path aliases corretos

### Coverage não funciona
**Solução:** Verifique se `@vitest/coverage-v8` está instalado

