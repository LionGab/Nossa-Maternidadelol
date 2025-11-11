# 📋 Pull Request

## 📝 Description
<!-- Descreva as mudanças implementadas neste PR -->

**Tipo de mudança:**
- [ ] 🐛 Bug fix (correção de bug)
- [ ] ✨ New feature (nova funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📚 Documentation (atualização de documentação)
- [ ] 🎨 Style (formatação, sem mudança de lógica)
- [ ] ♻️ Refactor (refatoração sem mudança de comportamento)
- [ ] ⚡️ Performance (melhoria de performance)
- [ ] 🔒 Security (correção de vulnerabilidade)

## 🎯 Motivação e Contexto
<!-- Por que essa mudança é necessária? Qual problema ela resolve? -->

Closes #(issue number)

## 🔍 Como foi testado?
<!-- Descreva como você testou suas mudanças -->

- [ ] Testes manuais
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Build passou sem erros
- [ ] TypeScript check passou

## 📸 Screenshots (se aplicável)
<!-- Adicione screenshots para mudanças visuais -->

## ✅ Checklist

### Código
- [ ] Meu código segue o style guide do projeto
- [ ] Removi código comentado e debugs
- [ ] Não há `console.log` (uso `logger` do Pino)
- [ ] TypeScript check passou (`npm run check`)
- [ ] Build passou (`npm run build`)

### Segurança
- [ ] Validei inputs do usuário com Zod
- [ ] Usei `requireAuth` em rotas protegidas
- [ ] Não expus dados sensíveis nos logs
- [ ] Não commitei `.env` ou secrets
- [ ] Uso rate limiting em APIs caras (AI, auth)

### Performance
- [ ] Evitei N+1 queries
- [ ] Usei paginação em endpoints de lista
- [ ] Não fiz queries desnecessárias

### Documentação
- [ ] Atualizei CLAUDE.md (se mudança arquitetural)
- [ ] Adicionei comentários em código complexo
- [ ] Atualizei README (se necessário)

### Database (se aplicável)
- [ ] Testei migrations localmente
- [ ] Adicionei campos `avatarUrl` onde necessário
- [ ] Schema está sincronizado com tipos TypeScript

## 🔗 Links Relacionados
<!-- Issues, documentação, etc -->

## 📝 Notas Adicionais
<!-- Qualquer informação adicional relevante -->

---

**🤖 Gerado com Claude Code**
