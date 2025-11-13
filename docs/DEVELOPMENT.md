# Guia de Desenvolvimento

## Setup Inicial

```bash
# Clone repositório
git clone <repo-url>
cd nossa-maternidade

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Edite .env com suas credenciais

# Iniciar desenvolvimento
npm run dev
```

## Estrutura do Projeto

```
.
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Tipos compartilhados
├── tests/           # Testes
├── scripts/         # Scripts utilitários
└── docs/            # Documentação
```

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor dev (porta 5000)

# Build
npm run build        # Build produção
npm start            # Roda build produção

# Qualidade
npm run check        # Type check
npm run lint         # ESLint
npm run test         # Testes
npm run test:watch   # Testes em watch mode
npm run test:coverage # Coverage report

# Database
npm run db:push      # Push schema para DB
npm run db:generate  # Gerar migrations
npm run db:studio    # Abrir Drizzle Studio

# Utilitários
npm run clean        # Limpar dist e cache
npm run setup        # Script de setup
```

## Workflow de Desenvolvimento

### 1. Criar Branch

```bash
git checkout -b feature/nova-funcionalidade
```

### 2. Desenvolver

- Escreva código seguindo padrões do projeto
- Adicione testes para novas funcionalidades
- Mantenha coverage acima de 95%

### 3. Testar Localmente

```bash
npm run lint
npm run check
npm test
npm run build
```

### 4. Commit

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
```

**Convention:** Use [Conventional Commits](https://www.conventionalcommits.org/)

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### 5. Push e PR

```bash
git push origin feature/nova-funcionalidade
```

Crie Pull Request no GitHub. CI rodará automaticamente.

## Padrões de Código

### TypeScript

- Use tipos explícitos
- Evite `any` (use `unknown` quando necessário)
- Prefira interfaces para objetos
- Use `const` assertions quando apropriado

### Naming

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Imports

```typescript
// Ordem: externos → internos → relativos
import { useState } from 'react';
import { storage } from '../storage';
import type { User } from '@shared/schema';
```

### Error Handling

```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error({ err: error, msg: 'Operation failed' });
  throw new AppError(500, 'Mensagem amigável');
}
```

## Adicionar Nova Rota

### 1. Criar Service (se necessário)

```typescript
// server/services/my-feature.service.ts
export class MyFeatureService {
  async doSomething() {
    // Lógica de negócio
  }
}
```

### 2. Criar Route

```typescript
// server/routes/my-feature.routes.ts
export function registerMyFeatureRoutes(app: Express): void {
  app.get('/api/my-feature', requireAuth, async (req, res, next) => {
    try {
      const result = await myFeatureService.doSomething();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });
}
```

### 3. Registrar em `routes/index.ts`

```typescript
import { registerMyFeatureRoutes } from './my-feature.routes';

export function registerRoutesSync(app: Express): void {
  // ...
  registerMyFeatureRoutes(app);
}
```

## Adicionar Novo Teste

```typescript
// tests/services/my-feature.service.test.ts
import { describe, it, expect } from 'vitest';

describe('MyFeatureService', () => {
  it('should do something', () => {
    // Test
  });
});
```

## Debugging

### VS Code Debugger

Use `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "console": "integratedTerminal"
}
```

### Logs

Use logger estruturado:

```typescript
import { logger } from './logger';

logger.info({ userId, action: 'create_habit', msg: 'Habit created' });
logger.error({ err: error, msg: 'Failed to create habit' });
```

## Performance

### Backend

- Use batch loading para evitar N+1
- Cache dados frequentes (Redis)
- Pagine listas grandes
- Use índices no banco

### Frontend

- Lazy load páginas
- Use React.memo para componentes pesados
- Configure staleTime apropriado no React Query
- Code splitting automático (Vite)

## Troubleshooting

### Erro: Module not found

```bash
npm install
npm run clean
npm run dev
```

### Erro: Type errors

```bash
npm run check
# Corrija erros ou use @ts-ignore temporariamente
```

### Erro: Port already in use

```bash
# Mude PORT no .env ou mate processo
lsof -ti:5000 | xargs kill
```

## Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Vite Docs](https://vitejs.dev/)
