# Guia de Testes

## Estrutura de Testes

```
tests/
├── services/          # Testes de services
├── middleware/         # Testes de middlewares
├── validation/         # Testes de validação
└── integration/       # Testes de integração
```

## Executar Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# UI interativo
npm run test:ui

# Coverage
npm run test:coverage
```

## Coverage Target

**Meta:** 95% coverage

- Statements: 95%
- Branches: 90%
- Functions: 95%
- Lines: 95%

## Tipos de Testes

### Unit Tests

Testam funções isoladas:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateLevel } from './gamification.service';

describe('calculateLevel', () => {
  it('should return level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });
});
```

### Integration Tests

Testam fluxo completo:

```typescript
describe('POST /api/habits/:id/complete', () => {
  it('should complete habit and update stats', async () => {
    // Setup
    const habit = await createHabit();
    
    // Execute
    const response = await request(app)
      .post(`/api/habits/${habit.id}/complete`)
      .set('Authorization', `Bearer ${token}`);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.stats.xp).toBeGreaterThan(0);
  });
});
```

## Mocking

### Storage Mock

```typescript
import { vi } from 'vitest';
import { storage } from '../../server/storage';

vi.mock('../../server/storage', () => ({
  storage: {
    getHabits: vi.fn(),
    createHabit: vi.fn(),
  },
}));
```

### Request/Response Mock

```typescript
const mockReq = {
  params: { id: '123' },
  user: { id: 'user1' },
} as Partial<Request>;

const mockRes = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
} as Partial<Response>;
```

## Test Utilities

### Test Helpers

Crie helpers reutilizáveis em `tests/helpers/`:

```typescript
export async function createTestUser() {
  return await storage.createUser({
    email: `test-${Date.now()}@test.com`,
    // ...
  });
}
```

## CI Integration

Testes rodam automaticamente no GitHub Actions:

- Push em `main` ou `develop`
- Pull Requests
- Coverage report enviado para Codecov

## Best Practices

1. **Isolate Tests**: Cada teste deve ser independente
2. **Clear Names**: Use nomes descritivos (`should return 404 when habit not found`)
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mock External**: Mock APIs externas (Gemini, Perplexity)
5. **Fast Tests**: Mantenha testes rápidos (<100ms cada)

## Debugging

### VS Code

Use `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal"
}
```

### Console Logs

```typescript
it('should work', () => {
  console.log('Debug info:', data);
  expect(result).toBe(expected);
});
```
