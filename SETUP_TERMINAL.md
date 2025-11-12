# 🚀 Setup Rápido do Terminal Integrado - Cursor

Guia rápido para configurar o terminal integrado do Cursor com carregamento automático de variáveis de ambiente.

## ⚡ Setup em 3 Passos

### 1. Copie o arquivo de exemplo

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2. Preencha suas variáveis

Abra o arquivo `.env` e preencha com seus valores reais:

```env
NODE_ENV=development
PORT=5000
SESSION_SECRET=seu-secret-aqui-min-32-caracteres
DATABASE_URL=sua-connection-string-do-neon
GEMINI_API_KEY=sua-chave-gemini
PERPLEXITY_API_KEY=sua-chave-perplexity
```

**Onde obter as chaves:**
- **DATABASE_URL**: https://console.neon.tech → Seu projeto → Connection String
- **GEMINI_API_KEY**: https://aistudio.google.com/app/apikey
- **PERPLEXITY_API_KEY**: https://www.perplexity.ai/settings/api
- **SESSION_SECRET**: Gere com `openssl rand -base64 32`

### 3. Abra um novo terminal no Cursor

1. Pressione `` Ctrl+` `` (ou `Ctrl+Shift+'` no Windows) para abrir o terminal
2. Ou vá em **Terminal** → **New Terminal**
3. O script de inicialização executará automaticamente
4. Você verá mensagens coloridas indicando o carregamento das variáveis

## ✅ Verificação

Após abrir o terminal, você deve ver:

```
🔧 Carregando variáveis de ambiente...
✅ X variáveis carregadas do .env

📋 Variáveis carregadas:
   NODE_ENV: development
   PORT: 5000
   DATABASE_URL: ✅ Configurada
   GEMINI_API_KEY: ✅ Configurada
   PERPLEXITY_API_KEY: ✅ Configurada
```

## 🧪 Teste Rápido

Execute um comando que usa as variáveis:

```bash
npm run dev
```

O servidor deve iniciar com todas as variáveis carregadas automaticamente.

## 🔧 Como Funciona

### Arquivos de Configuração

- **`.cursor/settings.json`** - Configura o terminal integrado do Cursor
- **`.cursor/terminal-init.ps1`** - Script PowerShell (Windows)
- **`.cursor/terminal-init.sh`** - Script Bash (Linux/Mac)
- **`.env.example`** - Template de variáveis (commitado no Git)
- **`.env`** - Suas variáveis reais (NUNCA commitado)

### Fluxo Automático

1. Você abre um novo terminal no Cursor
2. O Cursor executa automaticamente o script de inicialização
3. O script carrega todas as variáveis do arquivo `.env`
4. Variáveis ficam disponíveis para todos os comandos no terminal

## 🐛 Troubleshooting

### Problema: Variáveis não carregam

**Sintoma**: Mensagem "Arquivo .env não encontrado"

**Solução**:
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique se o nome está correto (`.env` e não `env` ou `.env.local`)
3. Feche e reabra o terminal

### Problema: Script PowerShell não executa

**Sintoma**: Erro de política de execução

**Solução**:
```powershell
# Verifique a política atual
Get-ExecutionPolicy

# Se necessário, ajuste (apenas para desenvolvimento)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: Variáveis não persistem

**Sintoma**: Variáveis desaparecem entre comandos

**Explicação**: Isso é normal! As variáveis são carregadas apenas no terminal atual. Cada novo terminal executa o script novamente.

**Solução**: Se precisar recarregar variáveis, feche e reabra o terminal.

### Problema: Erro de validação em produção

**Sintoma**: Mensagens de erro sobre SESSION_SECRET ou DATABASE_URL

**Solução**:
- Verifique se `SESSION_SECRET` tem pelo menos 32 caracteres
- Verifique se `DATABASE_URL` está configurada
- Gere um novo secret: `openssl rand -base64 32`

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **`CLAUDE.md`** → Seção "Terminal Configuration"
- **`.env.example`** → Comentários inline sobre cada variável

## 🎯 Próximos Passos

Após configurar o terminal:

1. ✅ Execute `npm install` para instalar dependências
2. ✅ Execute `npm run dev` para iniciar o servidor
3. ✅ Acesse `http://localhost:5000` no navegador
4. ✅ Comece a desenvolver!

## 💡 Dicas

- **Nunca commite o arquivo `.env`** - ele contém secrets sensíveis
- **Use `.env.example`** como referência para outros desenvolvedores
- **Em produção**, configure variáveis diretamente na plataforma (Vercel, Railway, etc.)
- **Cada terminal** carrega as variáveis independentemente - isso é intencional

## 🆘 Precisa de Ajuda?

- Veja `CLAUDE.md` para documentação completa
- Verifique os logs do terminal para mensagens de erro
- Consulte a documentação do Cursor: https://cursor.sh/docs

