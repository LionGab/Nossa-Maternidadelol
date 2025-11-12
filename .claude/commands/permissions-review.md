# Review All Permissions

Lista e analisa todas as permissões configuradas, sugerindo melhorias de segurança.

## Instruções

Quando este comando é executado:

1. **Ler o arquivo** `.claude/settings.local.json`
2. **Analisar cada permissão** nos arrays `allow`, `deny`, e `ask`
3. **Categorizar permissões** por nível de risco:
   - 🟢 **Seguro**: Leitura, listagem, busca
   - 🟡 **Moderado**: Comandos específicos, domínios conhecidos
   - 🔴 **Arriscado**: Wildcards amplos (`*`), escrita, comandos destrutivos
4. **Identificar padrões** e sugerir otimizações
5. **Mostrar estatísticas**:
   - Total de permissões permitidas
   - Total de permissões negadas
   - Total de permissões que pedem confirmação
   - Número de wildcards vs permissões específicas
6. **Sugerir melhorias** de segurança quando apropriado

## Output Format

```
📋 Revisão de Permissões - Claude Code

═══════════════════════════════════════════════════════

✅ PERMITIDAS (Allow): 3
   🟢 Bash(cat:*) - Leitura de arquivos
   🟢 Bash(dir:*) - Listagem de diretórios
   🟢 WebSearch - Busca na web

❌ NEGADAS (Deny): 0
   (Nenhuma permissão negada)

❓ PEDIR CONFIRMAÇÃO (Ask): 0
   (Todas as permissões são automáticas)

═══════════════════════════════════════════════════════

📊 Estatísticas:
   • Total de permissões: 3
   • Wildcards (*): 0
   • Permissões específicas: 3
   • Nível de segurança: 🟢 ALTO

═══════════════════════════════════════════════════════

💡 Sugestões:
   • Configuração segura e restritiva
   • Claude terá acesso limitado (apenas leitura)
   • Para desenvolvimento, considere adicionar:
     - Bash(npm:*) para gerenciar dependências
     - Bash(git:*) para operações Git
     - FileRead(*) para ler qualquer arquivo

═══════════════════════════════════════════════════════

🔧 Ações Disponíveis:
   • Executar /permissions-allow-all para permitir tudo
   • Executar /permissions-deny-all para negar tudo
   • Editar manualmente .claude/settings.local.json
```

## Categorização de Risco

### 🟢 Seguro
- `Bash(cat:*)` - Ler arquivos
- `Bash(dir:*)` - Listar diretórios
- `Bash(ls:*)` - Listar arquivos
- `WebSearch` - Busca na web
- `FileRead(*)` - Leitura (sem escrita)

### 🟡 Moderado
- `Bash(npm:*)` - Gerenciar pacotes
- `Bash(git:*)` - Operações Git
- `Bash(pwsh:*)` - PowerShell específico
- `WebFetch(domain:github.com)` - Domínio específico
- `FileWrite(client/src/**)` - Escrita em diretório específico

### 🔴 Arriscado
- `Bash(*)` - Todos os comandos (inclui `rm -rf`, etc.)
- `Bash(rm:*)` - Comandos de remoção
- `FileWrite(*)` - Escrita em qualquer arquivo
- `WebFetch(*)` - Requisições para qualquer domínio
- `Terminal(*)` - Acesso total ao terminal

## Quando Usar

- Antes de mudar configurações de permissão
- Para entender o que o Claude pode fazer
- Para auditar segurança antes de deploy
- Quando suspeitar de comportamento inesperado
- Para documentar configurações de permissão

## Melhores Práticas

1. **Princípio do menor privilégio**: Dê apenas permissões necessárias
2. **Específico > Genérico**: Prefira `Bash(npm:*)` a `Bash(*)`
3. **Domínios conhecidos**: Prefira `WebFetch(domain:github.com)` a `WebFetch(*)`
4. **Revisar regularmente**: Execute este comando periodicamente
5. **Documentar mudanças**: Anote por que certas permissões foram adicionadas
