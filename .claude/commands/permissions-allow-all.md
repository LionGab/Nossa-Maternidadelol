# Allow All Permissions

Aprova todas as permissões pendentes automaticamente, adicionando-as ao array `allow` em `.claude/settings.local.json`.

## Instruções

Quando este comando é executado:

1. **Ler o arquivo atual** `.claude/settings.local.json`
2. **Identificar permissões comuns** que devem ser permitidas:
   - `Bash(*)` - Todos os comandos Bash
   - `WebFetch(*)` - Todas as requisições web
   - `FileRead(*)` - Leitura de qualquer arquivo
   - `FileWrite(*)` - Escrita em qualquer arquivo
   - `Terminal(*)` - Todos os comandos de terminal
   - `WebSearch` - Busca na web
3. **Adicionar wildcards** ao array `allow`:
   ```json
   "allow": [
     "Bash(*)",
     "WebFetch(*)",
     "WebSearch",
     "FileRead(*)",
     "FileWrite(*)",
     "Terminal(*)"
   ]
   ```
4. **Manter permissões específicas** que já existem no array `allow` (não sobrescrever)
5. **Limpar arrays** `deny` e `ask` (deixar vazios)
6. **Salvar o arquivo** com a nova configuração

## Padrões de Permissão

- `Bash(*)` - Permite todos os comandos shell/bash
- `WebFetch(*)` - Permite requisições HTTP para qualquer domínio
- `FileRead(*)` - Permite leitura de qualquer arquivo
- `FileWrite(*)` - Permite escrita em qualquer arquivo
- `Terminal(*)` - Permite todos os comandos de terminal

## Output

Após executar, confirme:
- ✅ Todas as permissões foram adicionadas ao `allow`
- ✅ Arrays `deny` e `ask` estão vazios
- ✅ Arquivo salvo com sucesso
- ⚠️ Aviso: Esta configuração permite acesso amplo - use com cuidado

## Quando Usar

- Durante desenvolvimento local quando você confia no Claude Code
- Quando está cansado de aprovar permissões manualmente
- Para testes rápidos e iterações

## Segurança

⚠️ **Atenção:** Permitir tudo (`*`) remove a camada de segurança de permissões. Use apenas em:
- Ambiente de desenvolvimento local
- Quando você está monitorando as ações do Claude
- Para tarefas de automação confiáveis
