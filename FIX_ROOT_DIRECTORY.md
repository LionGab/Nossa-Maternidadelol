# 🔧 Fix: Root Directory Error no Vercel

## Problema

```
The specified Root Directory "www.nossamaternidade.com.br" does not exist. 
Please update your Project Settings.
```

O Vercel está tentando usar o domínio `www.nossamaternidade.com.br` como **Root Directory**, mas isso não existe. O Root Directory deve ser a raiz do projeto (`.` ou vazio).

## Solução

### Opção 1: Corrigir no Vercel Dashboard (Recomendado)

1. Acesse: **Vercel Dashboard** → Seu Projeto → **Settings** → **General**

2. Na seção **Root Directory**, verifique o valor:
   - ❌ **Errado**: `www.nossamaternidade.com.br`
   - ✅ **Correto**: `.` (ponto) ou deixe **vazio**

3. Clique em **Save**

4. Faça um novo deploy (ou aguarde o próximo push)

### Opção 2: Verificar Configuração do Domínio

O problema pode ter ocorrido ao configurar o domínio customizado. Verifique:

1. **Vercel Dashboard** → **Settings** → **Domains**
2. O domínio `www.nossamaternidade.com.br` deve estar listado como **domínio**, não como **Root Directory**
3. Se necessário, remova e adicione novamente o domínio

### Opção 3: Usar Vercel CLI

Se preferir usar a CLI:

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Verificar configuração atual
vercel inspect

# Atualizar Root Directory (se necessário)
# Via Dashboard é mais fácil
```

## Configuração Correta

### Root Directory
- **Valor**: `.` (ponto) ou **vazio**
- **Significado**: Raiz do repositório Git

### Build Settings
- **Build Command**: `npm run build` (ou automático se detectado)
- **Output Directory**: `dist/public` (já configurado no `vercel.json`)
- **Install Command**: `npm install` (ou automático)

### Domínio Customizado
- **Configuração**: Vercel Dashboard → Settings → Domains
- **Valor**: `www.nossamaternidade.com.br` (como domínio, não Root Directory)

## Verificação

Após corrigir, faça um novo deploy:

1. **Push para GitHub** (se ainda não fez):
   ```bash
   git add .
   git commit -m "fix: corrigir configuração do Vercel"
   git push origin main
   ```

2. **Ou faça deploy manual**:
   ```bash
   vercel --prod
   ```

3. **Verifique os logs** no Vercel Dashboard → Deployments → Latest

## Estrutura do Projeto

O projeto deve ter esta estrutura na raiz:

```
Nossa-Maternidadelol/
├── api/
│   └── index.ts          # Serverless function
├── client/               # Frontend (React + Vite)
├── server/               # Backend (Express)
├── shared/               # Shared types
├── dist/                 # Build output (gerado)
│   └── public/           # Frontend build
├── package.json
├── vercel.json           # Configuração do Vercel
└── vite.config.ts
```

O **Root Directory** deve apontar para `.` (raiz), não para um subdiretório.

## Notas

- O Root Directory é diferente do **Output Directory**
- Root Directory = onde o código está
- Output Directory = onde os arquivos buildados estão (já configurado no `vercel.json`)

---

**Status:** ⚠️ Requer ação no Vercel Dashboard  
**Data:** 2025-01-12

