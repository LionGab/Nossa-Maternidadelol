# 🤖 Agentes Especializados - Nossa Maternidade

Este diretório contém agentes especializados para tarefas complexas e demoradas que se beneficiam de expertise focada.

---

## 📚 Agentes Disponíveis

### 1. 🗄️ database-migration-expert
**Modelo:** Haiku (rápido, econômico)
**Especialidade:** Migração de MemStorage → Drizzle ORM PostgreSQL

**Quando usar:**
- ✅ Planejar migração de in-memory para PostgreSQL
- ✅ Analisar dependências entre tabelas
- ✅ Identificar gaps de implementação
- ✅ Criar estratégia de migração passo-a-passo

**Como usar:**
```
/task database-migration-expert

Analise o schema atual em shared/schema.ts e crie uma estratégia completa de migração de MemStorage para DrizzleStorage. Inclua ordem de migração, gaps de implementação, riscos e plano executável.
```

**Output esperado:**
- Inventário de 20+ tabelas
- Grafo de dependências (ordem topológica)
- Lista de métodos faltantes em DrizzleStorage
- Riscos classificados (ALTO/MÉDIO/BAIXO)
- Plano de migração em 4 fases (Preparação → Implementação → Migração → Cutover)

**Duração:** ~40 minutos de análise

---

### 2. 🔒 security-auditor
**Modelo:** Sonnet (análise profunda)
**Especialidade:** Auditoria de segurança OWASP Top 10

**Quando usar:**
- ✅ Antes de deploy em produção
- ✅ Após adicionar novos endpoints
- ✅ Auditoria trimestral de segurança
- ✅ Após mudanças em auth/validation

**Como usar:**
```
/task security-auditor

Realize uma auditoria completa de segurança focando em OWASP Top 10. Analise autenticação, validação de inputs, rate limiting, sensitive data exposure e security headers.
```

**Output esperado:**
- Vulnerabilidades classificadas por severidade (⚫ CRÍTICO → 🟢 BAIXO)
- Boas práticas já implementadas
- Recomendações priorizadas (Curto/Médio/Longo Prazo)
- Compliance LGPD verificado
- Teste de penetração scope sugerido

**Duração:** ~1-2 horas de análise

---

### 3. ⚡ performance-optimizer
**Modelo:** Haiku (análise rápida)
**Especialidade:** Otimização de performance backend/frontend

**Quando usar:**
- ✅ Latência de API > 500ms
- ✅ Bundle size > 500KB
- ✅ Web Vitals fora dos targets
- ✅ Análise trimestral de performance

**Como usar:**
```
/task performance-optimizer

Analise performance do backend e frontend. Identifique gargalos de N+1 queries, cache strategy, bundle size e Web Vitals. Priorize otimizações por ROI (Impacto / Esforço).
```

**Output esperado:**
- Gargalos classificados (🔴 CRÍTICO → 🟢 MELHORIAS)
- Métricas estimadas (P50/P95/P99 latência, Web Vitals)
- Código de exemplo para cada otimização
- Plano de ação priorizado por ROI
- Ferramentas de profiling recomendadas

**Duração:** ~30-45 minutos de análise

---

### 4. 🧪 test-coverage-analyzer
**Modelo:** Haiku (análise rápida)
**Especialidade:** Estratégia de testes e cobertura

**Quando usar:**
- ✅ Antes de iniciar implementação de testes
- ✅ Coverage atual < 40%
- ✅ Refatoração grande planejada
- ✅ Onboarding de novo dev

**Como usar:**
```
/task test-coverage-analyzer

Analise o código e crie estratégia executável de testes. Priorize por ROI (bugs prevenidos / esforço). Target: 40-50% coverage em Fase 1.
```

**Output esperado:**
- Inventário de código testável (LOC por módulo)
- Testes priorizados em 3 fases (Foundation → Integration → Comprehensive)
- Templates de teste prontos (copiar/colar)
- Estimativas de esforço (horas) e ROI (⭐⭐⭐⭐⭐)
- Comandos úteis para setup

**Duração:** ~30 minutos de análise

---

## 🚀 Como Usar Agentes

### Sintaxe Básica

```bash
# Via slash command (recomendado)
/task <agent-name>

<Seu prompt detalhado aqui>

# Ou via comando direto no chat
@task <agent-name> <prompt>
```

### Exemplo Completo

```
/task security-auditor

Foque especialmente em:
1. Endpoints de AI (NathIA, MãeValente)
2. Community posts (XSS, injection)
3. File upload (se existir)

Retorne apenas vulnerabilidades de severidade MÉDIA ou superior.
```

### Boas Práticas

1. **Seja específico** no prompt
   - ❌ "Analise o código"
   - ✅ "Analise endpoints de AI buscando rate limiting e input validation"

2. **Defina scope** quando apropriado
   - "Foque apenas em backend"
   - "Analise apenas schema de gamificação"

3. **Especifique output** desejado
   - "Retorne apenas gaps de implementação"
   - "Priorize por ROI alto"

4. **Use model apropriado**
   - Haiku: Análise rápida, reports estruturados
   - Sonnet: Análise profunda, decisões complexas

---

## 📊 Quando Usar vs Não Usar Agentes

### ✅ Use Agentes Quando:

1. **Tarefa é complexa e demorada** (>30min)
   - Migração de 20+ tabelas
   - Auditoria de segurança completa
   - Análise de performance end-to-end

2. **Análise é paralela/independente**
   - Pode rodar enquanto você trabalha em outra coisa
   - Não precisa de interação contínua

3. **Expertise especializada é valiosa**
   - OWASP Top 10
   - Web Vitals optimization
   - Test strategy

4. **Output não precisa estar no contexto principal**
   - Relatórios para documentação
   - Análise one-off
   - Research phase

### ❌ NÃO Use Agentes Quando:

1. **Tarefa é simples** (<10min)
   - "Adicione um console.log"
   - "Renomeie esta variável"
   - Use Claude direto

2. **Precisa de interação contínua**
   - Debugging interativo
   - Implementação iterativa
   - Use Claude direto

3. **Output precisa estar visível**
   - Type checking errors
   - Test results
   - Use slash commands normais

4. **Custo de tokens importa mais que tempo**
   - Agentes consomem 3-4x mais tokens
   - Para MVPs com budget limitado

---

## 🎯 Matriz de Decisão

| Situação | Recomendação | Motivo |
|----------|--------------|--------|
| Migrar para Drizzle | ✅ `database-migration-expert` | Análise complexa, 40min |
| Auditoria pré-deploy | ✅ `security-auditor` | OWASP expertise, 1-2h |
| Performance degradou | ✅ `performance-optimizer` | Análise end-to-end, 30-45min |
| Iniciar testes | ✅ `test-coverage-analyzer` | Estratégia completa, 30min |
| Adicionar endpoint simples | ❌ Claude direto | <10min, não vale overhead |
| Debug de erro específico | ❌ Claude direto | Precisa interação |
| Type checking | ❌ `/check-types` | Precisa output visível |

---

## 📈 Métricas de Sucesso

### Bons Indicadores de Uso de Agente:

- ✅ Análise completou em <50% do tempo manual
- ✅ Output é reutilizável (documentação, templates)
- ✅ Expertise agregou valor (OWASP, Web Vitals)
- ✅ Não precisou re-rodar (prompt foi claro)

### Maus Indicadores:

- ❌ Precisou re-rodar 2+ vezes (prompt vago)
- ❌ Output não foi acionável (muito genérico)
- ❌ Poderia ter feito em 5min direto
- ❌ Gastou 3x mais tokens sem benefício claro

---

## 🔧 Troubleshooting

### Agente não está executando

1. Verifique se está usando sintaxe correta: `/task <agent-name>`
2. Confirme que o arquivo `.md` existe em `.claude/agents/`
3. Certifique-se que front-matter está correto (---name:--- etc)

### Output não é o esperado

1. Refine o prompt com mais contexto
2. Especifique output desejado explicitamente
3. Use exemplos no prompt ("Formato esperado: ...")

### Agente demora muito

1. Reduza scope ("Foque apenas em backend")
2. Use model Haiku em vez de Sonnet (se aplicável)
3. Considere fazer análise em partes menores

---

## 🎓 Referências

- [Claude Code Docs - Subagents](https://docs.claude.com/claude-code/subagents)
- [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Community Templates](https://github.com/VoltAgent/awesome-claude-code-subagents)

---

## 📝 Contribuindo Novos Agentes

Para criar um novo agente:

1. Crie arquivo `.claude/agents/seu-agente.md`
2. Adicione front-matter:
   ```yaml
   ---
   name: seu-agente
   description: Breve descrição (1 linha)
   tools: [Read, Grep, Glob, Bash]
   model: haiku  # ou sonnet
   ---
   ```
3. Escreva system prompt focado (<3k tokens)
4. Defina workflow claro (5-7 etapas)
5. Especifique output esperado (template Markdown)
6. Adicione restrições (O QUE NÃO FAZER)
7. Documente neste README

---

**Última Atualização:** 2025-01-13
**Agentes Ativos:** 4 (database-migration-expert, security-auditor, performance-optimizer, test-coverage-analyzer)
**Status:** ✅ Pronto para uso
