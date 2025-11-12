# Database Migrations

Este projeto usa **Drizzle Kit** para gerenciar migrations versionadas do banco de dados.

## Comandos Disponíveis

### Gerar Migration
```bash
npm run db:generate
```
Gera uma nova migration baseada nas mudanças no schema (`shared/schema.ts`). A migration será salva em `./migrations/`.

### Aplicar Migrations
```bash
npm run db:migrate
```
Aplica todas as migrations pendentes no banco de dados.

### Push Direto (Desenvolvimento)
```bash
npm run db:push
```
Sincroniza o schema diretamente com o banco (sem criar migration). **Use apenas em desenvolvimento.**

### Drizzle Studio
```bash
npm run db:studio
```
Abre o Drizzle Studio para visualizar e editar dados do banco.

## Workflow Recomendado

### Desenvolvimento Local
1. Fazer mudanças em `shared/schema.ts`
2. Gerar migration: `npm run db:generate`
3. Aplicar migration: `npm run db:migrate`
4. Testar localmente

### Produção
1. Commitar migrations geradas (`./migrations/`)
2. No deploy, rodar: `npm run db:migrate`
3. Verificar se migrations foram aplicadas

## Estrutura de Migrations

```
migrations/
├── 0000_initial.sql
├── 0001_add_indexes.sql
└── ...
```

Cada migration é um arquivo SQL versionado que pode ser aplicado incrementalmente.

## Importante

- **Nunca edite migrations já aplicadas** - crie novas migrations
- **Sempre teste migrations localmente** antes de aplicar em produção
- **Faça backup do banco** antes de aplicar migrations em produção
- **Commite a pasta `migrations/`** no git para versionamento

