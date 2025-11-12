# Deny All Permissions

Nega todas as permissões automaticamente, adicionando-as ao array `deny` em `.claude/settings.local.json`.

## Instruções

Quando este comando é executado:

1. **Ler o arquivo atual** `.claude/settings.local.json`
2. **Adicionar wildcards perigosos** ao array `deny`:
   ```json
   "deny": [
     "Bash(*)",
     "WebFetch(*)",
     "FileWrite(*)",
     "Terminal(*)"
   ]
   ```
3. **Manter apenas permissões seguras** no array `allow`:
   ```json
   "allow": [
     "Bash(cat:*)",
     "Bash(dir:*)",
     "WebSearch"
   ]
   ```
4. **Limpar array** `ask` (deixar vazio)
5. **Salvar o arquivo** com a nova configuração

## Permissões Negadas

- `Bash(*)` - Bloqueia todos os comandos shell (exceto os permitidos explicitamente)
- `WebFetch(*)` - Bloqueia requisições HTTP
- `FileWrite(*)` - Bloqueia escrita em arquivos
- `Terminal(*)` - Bloqueia comandos de terminal

## Permissões Permitidas (Mínimas)

- `Bash(cat:*)` - Apenas ler conteúdo de arquivos
- `Bash(dir:*)` - Apenas listar diretórios
- `WebSearch` - Apenas busca na web

## Output

Após executar, confirme:
- ✅ Permissões perigosas foram adicionadas ao `deny`
- ✅ Apenas permissões seguras permanecem no `allow`
- ✅ Arquivo salvo com sucesso
- ⚠️ Aviso: Esta configuração é muito restritiva - Claude terá acesso limitado

## Quando Usar

- Quando você quer máxima segurança
- Antes de revisar código sensível
- Quando está trabalhando com secrets ou dados críticos
- Para garantir que Claude não faça mudanças não autorizadas

## Impacto

Com esta configuração, o Claude Code poderá:
- ✅ Ler arquivos (`cat`)
- ✅ Listar diretórios (`dir`)
- ✅ Buscar na web
- ❌ Executar comandos
- ❌ Fazer requisições HTTP
- ❌ Escrever arquivos
- ❌ Usar terminal
