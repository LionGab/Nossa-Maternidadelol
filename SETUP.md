# 🚀 Setup Guide - Nossa Maternidade

## Stack Tecnológica

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Express.js + TypeScript
- **Database:** Supabase PostgreSQL (ou Replit PostgreSQL)
- **Deploy:** Vercel
- **Controle de Versão:** GitHub

---

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. Conta GitHub (para version control)
3. Conta Vercel (para deploy - grátis)
4. Conta Supabase (para database - grátis)

---

## 🔧 Setup Local (1ª vez)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/nossa-maternidade.git
cd nossa-maternidade
```

### 2. Instale dependências
```bash
npm install
```

### 3. Configure variáveis de ambiente
```bash
# Copie o template
cp .env.example .env.local

# Edite .env.local com suas credenciais:
# - DATABASE_URL do Supabase
# - GEMINI_API_KEY do Google AI Studio
# - PERPLEXITY_API_KEY do Perplexity
# - SESSION_SECRET (gere com: openssl rand -base64 32)
```

### 4. Setup do Banco de Dados Supabase

**Opção A: Via Supabase Dashboard (Recomendado)**
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto (grátis)
3. Copie a `DATABASE_URL` em Settings → Database
4. Cole no `.env.local`
5. Rode as migrations:
```bash
npm run db:push
```

**Opção B: Usar Replit PostgreSQL (Alternativa)**
1. No Replit, vá em Tools → Database
2. Ative PostgreSQL
3. Use a `DATABASE_URL` fornecida pelo Replit
4. Rode as migrations

### 5. Rode o projeto
```bash
npm run dev
```

Acesse: http://localhost:5000

---

## 🌐 Deploy para Vercel

### 1. Conecte ao GitHub
```bash
# Se ainda não inicializou git:
git init
git add .
git commit -m "Initial commit"

# Crie repositório no GitHub e conecte:
git remote add origin https://github.com/seu-usuario/nossa-maternidade.git
git push -u origin main
```

### 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique "New Project"
3. Importe repositório do GitHub
4. Configure Environment Variables:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `PERPLEXITY_API_KEY`
   - `SESSION_SECRET`
   - `NODE_ENV=production`
5. Deploy!

---

## 🔄 Trocar entre Supabase ↔ Replit PostgreSQL

O projeto é **100% portável**. Para trocar de DB:

1. Atualize `DATABASE_URL` no `.env.local` (local) ou Vercel (produção)
2. Rode migrations: `npm run db:push`
3. Pronto!

**Nenhum código precisa mudar** - Drizzle ORM funciona com ambos.

---

## 📦 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento local (frontend + backend)
npm run build        # Build para produção
npm run db:push      # Roda migrations no banco
npm run db:studio    # Interface visual do banco (Drizzle Studio)
```

---

## 🆘 Problemas Comuns

### "Cannot connect to database"
- Verifique `DATABASE_URL` no `.env.local`
- Confirme que o IP está autorizado no Supabase

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Deploy no Vercel falhou
- Verifique environment variables
- Rode `npm run build` localmente primeiro

---

## 🔐 Segurança

**⚠️ NUNCA commite:**
- `.env.local` (contém secrets)
- `node_modules/`
- Arquivos de build

O `.gitignore` já protege esses arquivos.

---

## 📞 Suporte

Problemas? Abra uma issue no GitHub ou contate o time de desenvolvimento.
