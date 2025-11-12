# ⚡ Cursor - Referência Rápida

## 🚀 Ativação (30 segundos)

1. Abrir Cursor → `File → Open Folder` → Projeto
2. Verificar: `.cursorrules` aparece no status bar
3. Testar: `Ctrl+K` → Chat funciona ✅

## ⌨️ Atalhos Essenciais

| Atalho | Ação |
|--------|------|
| `Ctrl+K` | Chat inline (perguntas rápidas) |
| `Ctrl+L` | Chat em nova aba (conversas longas) |
| `Ctrl+P` | Abrir arquivo rápido |
| `Ctrl+Shift+O` | Ir para função no arquivo |
| `Ctrl+T` | Ir para símbolo (tipo, função) |
| `Ctrl+D` | Selecionar próxima ocorrência |
| `Ctrl+Shift+L` | Selecionar todas ocorrências |
| `F2` | Renomear símbolo |
| `Ctrl+.` | Quick fixes |
| `Ctrl+` ` | Terminal integrado |

## 📝 Snippets Disponíveis

Digite prefixo → `Tab`:

- `route-protected` - Rota API protegida
- `route-public` - Rota API pública  
- `component-react` - Componente React
- `schema-drizzle` - Schema Drizzle
- `validation-zod` - Validação Zod
- `mutation-query` - React Query mutation
- `log-info` - Logger info
- `log-error` - Logger error
- `paginate` - Paginação
- `batch-load` - Batch loading

## 💬 Comandos de Chat Poderosos

### Refatoração
```
Ctrl+K → "Refatore para usar batch loading, veja server/routes.ts:225"
```

### Criação
```
Ctrl+K → "Crie endpoint /api/novo seguindo padrão de server/routes.ts:84"
```

### Debugging
```
Ctrl+K → "Por que este endpoint está lento? Analise server/routes.ts:225"
```

### Análise
```
Ctrl+L → "Analise server/storage.ts e sugira otimizações"
```

## 🔌 MCPs Recomendados

### 1. GitHub MCP ⭐
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```
**Token:** https://github.com/settings/tokens

### 2. PostgreSQL MCP ⭐
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://..."
      }
    }
  }
}
```

## ⚙️ Configurações Recomendadas

**Settings (`Ctrl+,`):**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## 🎯 Workflow Diário

1. **Abrir arquivo:** `Ctrl+P` → nome
2. **Editar:** Digite normalmente (autocomplete ajuda)
3. **Dúvida rápida:** `Ctrl+K` → pergunta
4. **Refatorar:** `Ctrl+Shift+L` → `F2` → renomear
5. **Validar:** `Ctrl+Shift+P` → "TypeScript: Check"
6. **Commit:** `Ctrl+Enter` → mensagem

## 🔧 Troubleshooting

**Cursor não sugere código?**
- `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

**Snippets não funcionam?**
- Verificar `.cursor/snippets.json` existe
- Reiniciar Cursor

**Autocomplete lento?**
- Desabilitar extensões não usadas
- `Ctrl+Shift+P` → "Developer: Reload Window"

---

**Guia completo:** `CURSOR_SETUP_GUIDE.md`

