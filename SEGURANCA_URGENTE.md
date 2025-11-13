# 🚨 AÇÃO URGENTE - SEGURANÇA COMPROMETIDA

## ⚠️ SUAS CHAVES FORAM EXPOSTAS PUBLICAMENTE

As seguintes chaves foram compartilhadas em comentário público do GitHub e precisam ser **REVOGADAS IMEDIATAMENTE**:

### Chaves Comprometidas:

1. **Gemini API Key**
   - Chave exposta: `AIzaSyC9YVWRmnGyGu4c9y7g-mNkkipDqb5JBZg`
   - Ação: Revogar em https://aistudio.google.com/app/apikey

2. **Claude API Key**
   - Chave exposta: `sk-ant-api03-dNzIj...`
   - Ação: Revogar em https://console.anthropic.com/settings/keys

3. **OpenAI API Key**
   - Chave exposta: `sk-proj-BKCgHp...`
   - Ação: Revogar em https://platform.openai.com/api-keys

4. **Perplexity API Key**
   - Chave exposta: `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`
   - Ação: Revogar em https://www.perplexity.ai/settings/api

5. **Supabase Anon Key**
   - Chave exposta no comentário
   - Ação: Verificar se precisa rotacionar

---

## 🔥 AÇÕES IMEDIATAS (FAÇA AGORA!)

### 1. Revogar as Chaves de IA

#### Gemini (Google)
1. Acesse: https://aistudio.google.com/app/apikey
2. Encontre a chave: `AIzaSyC9YVWRmnGyGu4c9y7g-mNkkipDqb5JBZg`
3. Clique em "Delete" ou "Revoke"
4. Crie uma nova chave

#### Claude (Anthropic)
1. Acesse: https://console.anthropic.com/settings/keys
2. Encontre a chave que começa com `sk-ant-api03-`
3. Clique em "Revoke"
4. Crie uma nova chave

#### OpenAI
1. Acesse: https://platform.openai.com/api-keys
2. Encontre a chave que começa com `sk-proj-BKCgHp`
3. Clique em "Revoke"
4. Crie uma nova chave

#### Perplexity
1. Acesse: https://www.perplexity.ai/settings/api
2. Encontre a chave: `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`
3. Revogue a chave
4. Crie uma nova chave

### 2. Verificar Uso Não Autorizado

Antes de revogar, **verifique o uso recente**:
- Gemini: https://aistudio.google.com/app/usage
- Claude: Console → Usage
- OpenAI: Dashboard → Usage
- Perplexity: Settings → Usage

Se houver uso suspeito:
- ✅ Revogue IMEDIATAMENTE
- ✅ Entre em contato com o suporte da plataforma
- ✅ Monitore cobranças

### 3. Deletar o Comentário Público

⚠️ O comentário com as chaves ainda está público no GitHub!

1. Vá para o PR: https://github.com/LionGab/Nossa-Maternidadelol/pull/XXX
2. Encontre o comentário com as chaves
3. Clique nos "..." (três pontos)
4. Selecione "Delete"

---

## ✅ CONFIGURAÇÃO CORRETA (Após Revogar)

### Opção 1: Configuração Local (.env)

```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Edite o .env com suas NOVAS chaves
nano .env
# ou
code .env
```

### Opção 2: Vercel (Produção) - RECOMENDADO

**NÃO use arquivos .env em produção!**

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables

2. Adicione cada variável:
   ```
   GEMINI_API_KEY = [sua nova chave]
   CLAUDE_API_KEY = [sua nova chave]
   OPENAI_API_KEY = [sua nova chave]
   PERPLEXITY_API_KEY = [sua nova chave]
   EXPO_PUBLIC_SUPABASE_URL = https://mnszbkeuerjcevjvdqme.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY = [sua chave supabase]
   SESSION_SECRET = [gerar com: openssl rand -base64 32]
   ```

3. Selecione os ambientes: Production, Preview, Development

4. Clique em "Save"

5. Redeploy: `vercel --prod`

---

## 🛡️ REGRAS DE SEGURANÇA (NUNCA MAIS!)

### ❌ NUNCA FAÇA:
- Compartilhar chaves em comentários do GitHub
- Compartilhar chaves em mensagens públicas
- Commitar arquivo `.env` no Git
- Copiar/colar chaves em chat público
- Compartilhar chaves em screenshots

### ✅ SEMPRE FAÇA:
- Use variáveis de ambiente da plataforma (Vercel/Railway/Render)
- Compartilhe chaves apenas via canais seguros (DM criptografada)
- Use `.gitignore` para ignorar `.env`
- Rotacione chaves periodicamente
- Monitore uso das APIs

---

## 📋 Checklist de Recuperação

- [ ] Revogou chave do Gemini
- [ ] Revogou chave do Claude
- [ ] Revogou chave do OpenAI
- [ ] Revogou chave do Perplexity
- [ ] Verificou uso não autorizado em todas as plataformas
- [ ] Criou novas chaves
- [ ] Configurou variáveis no Vercel/plataforma
- [ ] Deletou comentário público com as chaves
- [ ] Testou aplicação com novas chaves
- [ ] Configurou alertas de uso nas plataformas

---

## 📞 Suporte

Se houver cobranças não autorizadas:

- **Gemini**: https://support.google.com/
- **Claude**: support@anthropic.com
- **OpenAI**: https://help.openai.com/
- **Perplexity**: Contato via plataforma

---

## 🎓 Recursos de Segurança

- [Guia de Segurança do GitHub](https://docs.github.com/en/code-security)
- [Como Gerar SESSION_SECRET](./COMO_GERAR_SESSION_SECRET.md)
- [Melhores Práticas de API Keys](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)

---

<div align="center">

**🔒 Lembre-se: Chaves de API são como senhas. Trate-as com cuidado!**

**🌸 Nossa Maternidade** - [www.nossamaternidade.com.br](https://www.nossamaternidade.com.br/)

</div>
