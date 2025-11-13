<div align="center">

# 🌸 Nossa Maternidade

### Plataforma Digital de Bem-Estar Materno

*Um refúgio sem julgamentos para mães e gestantes*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-100%20passing-success.svg)](tests/)
[![Build](https://img.shields.io/badge/Build-Passing-success.svg)](https://github.com/LionGab/Nossa-Maternidadelol)

[🌐 Site Oficial](https://www.nossamaternidade.com.br/) · [📖 Documentação](docs/) · [🐛 Report Bug](https://github.com/LionGab/Nossa-Maternidadelol/issues) · [✨ Request Feature](https://github.com/LionGab/Nossa-Maternidadelol/issues)

</div>

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tech Stack](#-tech-stack)
- [Começando](#-começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Configuração](#configuração)
  - [Desenvolvimento](#desenvolvimento)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura](#-arquitetura)
- [Deploy](#-deploy)
- [Testes](#-testes)
- [Segurança](#-segurança)
- [Performance](#-performance)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)
- [Agradecimentos](#-agradecimentos)

---

## 📱 Sobre o Projeto

**Nossa Maternidade** é uma plataforma digital inovadora criada pela influenciadora **Nathália Valente** ([@nathaliavalente](https://instagram.com/nathaliavalente)), oferecendo um espaço seguro, acolhedor e livre de julgamentos para mães e gestantes em todas as fases da maternidade.

### 🎯 Missão

Proporcionar suporte emocional, informação confiável e ferramentas práticas para o bem-estar materno, combinando tecnologia de IA de ponta com empatia humana genuína.

### 🌟 Diferenciais

- ✅ **Sem Julgamentos**: Espaço 100% livre de críticas e pressões sociais
- 🤖 **IA Empática**: Assistentes de IA treinados especificamente para saúde materna
- 🎮 **Gamificação**: Sistema motivacional com XP, streaks e achievements
- 👥 **Comunidade Real**: Mães reais compartilhando experiências autênticas
- 🔒 **Privacidade**: Dados protegidos com criptografia e políticas rigorosas

---

## ✨ Funcionalidades

### 💬 NathIA - Assistente Virtual de IA

<img src="https://img.shields.io/badge/Powered%20by-Google%20Gemini%202.5-4285F4?logo=google&logoColor=white" alt="Gemini">

- Chat em tempo real com IA empática especializada em saúde mental materna
- Respostas personalizadas baseadas no contexto da usuária (fase da gestação, objetivos)
- Suporte 24/7 sem julgamentos
- Histórico de conversas para acompanhamento contínuo
- Detecção inteligente de situações que requerem ajuda profissional
- Sugestões de prompts contextuais

**Tecnologia**: Google Gemini 2.5 Flash com system prompts customizados

### 🌟 Mãe Valente - Pesquisa Inteligente

<img src="https://img.shields.io/badge/Powered%20by-Perplexity%20AI-20B2AA?logo=perplexity&logoColor=white" alt="Perplexity">

- Busca inteligente com respostas baseadas em fontes médicas confiáveis
- 4 categorias de empoderamento:
  - 💪 **Força Interior**: Resiliência e coragem
  - 🧠 **Sabedoria**: Conhecimento transformador
  - 🌿 **Serenidade**: Paz e equilíbrio
  - 💝 **Autoamor**: Cultivo do amor próprio
- Cache de respostas para economia de API
- Sistema de favoritos para salvar conteúdos importantes
- Citações inspiracionais rotativas

**Tecnologia**: Perplexity AI com fontes verificadas

### ✅ Hábitos - Sistema Gamificado

- **Tracking Diário**: Acompanhamento visual de hábitos saudáveis
- **Sistema de XP**: Ganhe 10 XP por hábito completado
- **Níveis**: Progrida através de níveis (Level = XP / 100 + 1)
- **Streaks**: Sequências de dias consecutivos com bônus de motivação
- **Achievements**: 12+ conquistas desbloqueáveis:
  - 🌟 Primeira Vez (completar primeiro hábito)
  - 🔥 Sequência de Fogo (7 dias seguidos)
  - 💯 Centenário (100 XP)
  - 👑 Mestre (nível 10)
  - E muito mais!
- **Estatísticas Semanais**: Gráficos de progresso e insights
- **Customização**: Escolha emoji e cor do gradiente para cada hábito

### 🏡 Refúgio Nath - Comunidade

- **4 Tipos de Posts**:
  - 💗 Desabafo (até 300 caracteres)
  - 🎉 Vitória (até 200 caracteres)
  - 🤝 Apoio (até 300 caracteres)
  - 💭 Reflexão (até 400 caracteres)
- **Interações Sociais**:
  - ❤️ Curtidas e reações
  - 💬 Comentários e respostas
  - 🚩 Sistema de denúncia/moderação
- **Feed Inteligente**: Posts destacados e recentes
- **Avatares Automáticos**: Gerados via DiceBear API (estilo Lorelei feminino)
- **Autenticação Segura**: Apenas usuários logados podem postar/comentar

### 📚 Mundo Nath - Conteúdos Educativos

- Posts educativos sobre maternidade
- Conteúdos virais do TikTok e Instagram
- Dicas práticas do dia
- Sistema de favoritos
- Filtros por categoria e tipo

### 🏠 Dashboard Inteligente

- Widget de chat rápido para NathIA
- Progresso semanal de hábitos
- Featured content do dia
- Posts em destaque da comunidade
- Atalhos para funcionalidades principais

---

## 🛠 Tech Stack

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| [React](https://reactjs.org/) | 18.3 | Framework UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.6 | Type Safety |
| [Vite](https://vitejs.dev/) | 5.4 | Build Tool & Dev Server |
| [Wouter](https://github.com/molefrog/wouter) | 3.3 | Roteamento leve |
| [TanStack Query](https://tanstack.com/query) | 5.60 | State Management & Cache |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Componentes UI (Radix UI) |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Estilização utilitária |
| [Framer Motion](https://www.framer.com/motion/) | 11.13 | Animações |
| [Lucide React](https://lucide.dev/) | 0.453 | Ícones |
| [React Hook Form](https://react-hook-form.com/) | 7.55 | Formulários |
| [Zod](https://zod.dev/) | 3.24 | Validação de schemas |

### Backend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| [Node.js](https://nodejs.org/) | 20+ | Runtime |
| [Express](https://expressjs.com/) | 4.21 | Framework HTTP |
| [TypeScript](https://www.typescriptlang.org/) | 5.6 | Type Safety |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.39 | ORM para PostgreSQL |
| [Neon](https://neon.tech/) | Latest | PostgreSQL Serverless |
| [Passport.js](http://www.passportjs.org/) | 0.7 | Autenticação |
| [Express Session](https://github.com/expressjs/session) | 1.18 | Gerenciamento de sessões |
| [Pino](https://getpino.io/) | 10.1 | Logging estruturado |
| [Helmet](https://helmetjs.github.io/) | 8.1 | Segurança HTTP headers |
| [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit) | 8.2 | Rate limiting |

### IA & Integrações

| Serviço | Uso |
|---------|-----|
| [Google Gemini 2.5 Flash](https://ai.google.dev/) | Chat NathIA |
| [Perplexity AI](https://www.perplexity.ai/) | Busca Mãe Valente |
| [Supabase](https://supabase.com/) | Backend as a Service (opcional) |
| [DiceBear API](https://www.dicebear.com/) | Geração de avatares |

### DevOps & Tools

| Ferramenta | Uso |
|-----------|-----|
| [Vitest](https://vitest.dev/) | Framework de testes |
| [ESLint](https://eslint.org/) | Linting |
| [esbuild](https://esbuild.github.io/) | Bundler backend |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript execution |
| [Vercel](https://vercel.com/) | Deploy & Hosting |

---

## 🚀 Começando

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js**: versão 20 ou superior
- **npm**: versão 10 ou superior
- **Git**: última versão

```bash
# Verificar versões
node --version  # deve ser >= 20.0.0
npm --version   # deve ser >= 10.0.0
```

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/LionGab/Nossa-Maternidadelol.git
cd Nossa-Maternidadelol
```

2. **Instale as dependências**

```bash
npm install
```

Isso irá instalar:
- 112 dependências de produção
- 46 devDependencies
- Total: ~665 pacotes

### Configuração

3. **Configure as variáveis de ambiente**

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env
nano .env
# ou
code .env
```

4. **Obtenha as chaves de API necessárias**

| Variável | Obter em | Necessária? |
|----------|----------|-------------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ Sim |
| `PERPLEXITY_API_KEY` | [Perplexity Settings](https://www.perplexity.ai/settings/api) | ✅ Sim |
| `SESSION_SECRET` | Gerar: `openssl rand -base64 32` | ✅ Sim |
| `DATABASE_URL` | [Neon Console](https://console.neon.tech/) | ⚠️ Opcional* |
| `EXPO_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) | ⚠️ Opcional* |

*Opcional: O app funciona com MemStorage (dados em memória) para desenvolvimento.

**Guias detalhados:**
- 📖 [Como Gerar SESSION_SECRET](./COMO_GERAR_SESSION_SECRET.md)
- 📖 [Como Instalar](./COMO_INSTALAR.md)
- 📖 [Setup Completo](./SETUP.md)

5. **Gere o SESSION_SECRET**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Copie a saída e cole no .env
```

### Desenvolvimento

6. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

O app estará disponível em:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api
- **Hot Reload**: Habilitado (Vite HMR)

7. **Acesse a aplicação**

Abra http://localhost:5000 no navegador

---

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Inicia dev server (frontend + backend)
npm run dev:clean    # Limpa cache e inicia dev server
npm run check        # Verifica tipos TypeScript (sem build)
npm run type-check   # Alias para check
```

### Build & Produção

```bash
npm run build        # Build completo (Vite + esbuild)
npm start            # Inicia servidor em produção
npm run analyze      # Analisa tamanho do bundle
```

### Database

```bash
npm run db:push      # Push schema para database
npm run db:generate  # Gera migrations
npm run db:migrate   # Executa migrations
npm run db:studio    # Abre Drizzle Studio (GUI)
```

### Testes

```bash
npm test             # Executa todos os testes
npm run test:watch   # Modo watch
npm run test:ui      # Interface visual (Vitest UI)
npm run test:coverage # Relatório de cobertura
```

### Qualidade de Código

```bash
npm run lint         # ESLint com zero warnings
npm run lint:fix     # Auto-fix de problemas
```

### Utilitários

```bash
npm run clean        # Remove dist e cache
npm run clean:all    # Limpeza completa (inclui node_modules/.cache)
npm run setup        # Script de setup inicial
npm run generate:session-secret  # Gera SESSION_SECRET
```

---

## 📂 Estrutura do Projeto

```
nossa-maternidade/
├── 📁 client/                    # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── landing/         # Componentes da landing page
│   │   ├── pages/               # Páginas da aplicação
│   │   │   ├── NathIA.tsx       # Chat IA
│   │   │   ├── MaeValente.tsx   # Busca inteligente
│   │   │   ├── Habitos.tsx      # Gamificação
│   │   │   ├── RefugioNath.tsx  # Comunidade
│   │   │   ├── MundoNath.tsx    # Conteúdos
│   │   │   ├── Dashboard.tsx    # Hub central
│   │   │   ├── Landing.tsx      # Página inicial
│   │   │   └── ...
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilitários e configurações
│   │   │   ├── queryClient.ts   # TanStack Query config
│   │   │   └── utils.ts         # Funções utilitárias
│   │   └── App.tsx              # App principal
│   └── index.html
├── 📁 server/                    # Backend Express
│   ├── index.ts                 # Entry point + Express setup
│   ├── routes.ts                # Rotas da API
│   ├── auth-routes.ts           # Rotas de autenticação
│   ├── auth.ts                  # Passport.js config
│   ├── storage.ts               # Interface de storage
│   ├── storage/
│   │   ├── mem-storage.ts       # MemStorage (desenvolvimento)
│   │   └── drizzle-storage.ts   # DrizzleStorage (produção)
│   ├── gemini.ts                # Integração Google Gemini
│   ├── perplexity.ts            # Integração Perplexity AI
│   ├── logger.ts                # Pino logger config
│   ├── rate-limit.ts            # Rate limiters
│   ├── validation.ts            # Zod schemas
│   ├── pagination.ts            # Paginação utilitária
│   ├── avatar.ts                # Geração de avatares
│   └── db.ts                    # Drizzle config
├── 📁 shared/                    # Código compartilhado
│   └── schema.ts                # Schemas Drizzle + tipos
├── 📁 tests/                     # Testes
│   ├── server/
│   │   ├── unit/                # Testes unitários backend
│   │   └── integration/         # Testes de integração
│   └── unit/
│       └── server/              # Mais testes unitários
├── 📁 scripts/                   # Scripts utilitários
│   ├── setup.js
│   ├── postinstall.js
│   └── generate-session-secret.js
├── 📁 attached_assets/           # Imagens e recursos
├── 📁 docs/                      # Documentação adicional
├── 📁 .github/                   # GitHub configs
│   ├── workflows/               # CI/CD
│   └── ISSUE_TEMPLATE/
├── 📄 .env.example               # Exemplo de variáveis
├── 📄 .gitignore                 # Arquivos ignorados
├── 📄 package.json               # Dependências e scripts
├── 📄 tsconfig.json              # TypeScript config
├── 📄 vite.config.ts             # Vite config
├── 📄 vitest.config.ts           # Vitest config
├── 📄 drizzle.config.ts          # Drizzle ORM config
├── 📄 tailwind.config.ts         # Tailwind config
├── 📄 README.md                  # Este arquivo
├── 📄 COMO_GERAR_SESSION_SECRET.md
├── 📄 COMO_INSTALAR.md
├── 📄 DEPLOY-STATUS.md
├── 📄 SEGURANCA_URGENTE.md
├── 📄 CLAUDE.md                  # Docs para Claude Code
└── 📄 PROJETO_STATUS.md
```

---

## 🏗 Arquitetura

### Frontend Architecture

```
┌─────────────────────────────────────┐
│         React App (Vite)            │
├─────────────────────────────────────┤
│  Wouter Router                      │
│  ├─ /               → Landing       │
│  ├─ /dashboard      → Dashboard     │
│  ├─ /nathia         → NathIA        │
│  ├─ /mae-valente    → MãeValente    │
│  ├─ /habitos        → Hábitos       │
│  └─ /refugio        → RefugioNath   │
├─────────────────────────────────────┤
│  TanStack Query (State + Cache)    │
├─────────────────────────────────────┤
│  shadcn/ui + Tailwind CSS           │
└─────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────┐
│       Express.js Server             │
├─────────────────────────────────────┤
│  Middleware Stack:                  │
│  ├─ Helmet (Security)               │
│  ├─ CORS                            │
│  ├─ Compression                     │
│  ├─ Express Session                 │
│  ├─ Passport.js (Auth)              │
│  └─ Rate Limiting                   │
├─────────────────────────────────────┤
│  Routes:                            │
│  ├─ /api/auth/*      → Auth         │
│  ├─ /api/nathia/*    → Gemini AI    │
│  ├─ /api/mae-valente/* → Perplexity │
│  ├─ /api/habits/*    → Hábitos      │
│  ├─ /api/community/* → Comunidade   │
│  └─ /api/stats/*     → Estatísticas │
├─────────────────────────────────────┤
│  Storage Layer (Interface):         │
│  ├─ MemStorage (Dev)                │
│  └─ DrizzleStorage (Prod)           │
├─────────────────────────────────────┤
│  External APIs:                     │
│  ├─ Google Gemini                   │
│  ├─ Perplexity AI                   │
│  └─ DiceBear                        │
└─────────────────────────────────────┘
```

### Database Schema (Drizzle ORM)

**20+ Tabelas Organizadas por Feature:**

- **Auth**: `users`, `profiles`, `subscriptions`
- **Content**: `posts`, `viralPosts`, `tips`, `dailyFeatured`
- **AI**: `aiSessions`, `aiMessages`, `qaCache`, `savedQa`
- **Habits**: `habits`, `habitCompletions`, `userStats`, `achievements`, `userAchievements`
- **Social**: `communityPosts`, `comments`, `reactions`, `reports`, `dailyQuestions`
- **Favorites**: `favorites`

---

## 🚀 Deploy

### Vercel (Recomendado)

1. **Instale o Vercel CLI**

```bash
npm install -g vercel
```

2. **Configure variáveis de ambiente**

```bash
# Via CLI
vercel env add GEMINI_API_KEY production
vercel env add PERPLEXITY_API_KEY production
vercel env add SESSION_SECRET production
vercel env add DATABASE_URL production

# Ou via Dashboard: https://vercel.com/seu-projeto/settings/environment-variables
```

3. **Deploy**

```bash
# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

### Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente no dashboard
3. Deploy automático em cada push

**📖 Guia completo**: [DEPLOY-STATUS.md](./DEPLOY-STATUS.md)

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm test tests/server/unit/ tests/unit/

# Com coverage
npm run test:coverage

# Modo watch
npm run test:watch

# UI interativa
npm run test:ui
```

### Cobertura Atual

```
✅ Test Files: 7 passed (7)
✅ Tests: 100 passed (100)
✅ Duration: ~1s
```

**Testes incluem:**
- ✅ Validação de schemas (Zod)
- ✅ Configuração de agentes de IA
- ✅ Rate limiting
- ✅ Paginação
- ✅ Gamificação (XP, streaks, achievements)
- ✅ Constantes e utilitários

---

## 🔒 Segurança

### Implementações de Segurança

✅ **Rate Limiting** (5 endpoints protegidos)
- AI Chat: 10 req/min
- AI Search: 5 req/min
- Auth: 5 attempts/15min

✅ **Input Validation** (8 Zod schemas)
- Previne SQL injection
- Previne XSS
- Valida todos os inputs do usuário

✅ **Environment Validation**
- Produção requer SESSION_SECRET mínimo de 32 chars
- Valida DATABASE_URL

✅ **Password Security**
- Hashing com scrypt + salt
- Nunca armazena senhas em texto plano

✅ **Session Security**
- Express-session com cookies httpOnly
- Secure cookies em produção (HTTPS)

✅ **Structured Logging**
- Pino logger com JSON output
- Auto-redação de dados sensíveis
- Request IDs para tracing

✅ **Helmet.js**
- Security headers configurados
- XSS protection
- MIME type sniffing protection

**📖 Guia completo**: [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md)
**🚨 Em caso de vazamento**: [SEGURANCA_URGENTE.md](./SEGURANCA_URGENTE.md)

---

## ⚡ Performance

### Otimizações Implementadas

✅ **N+1 Query Optimization**
- Batch loading com `getHabitCompletionsByHabitIds()`
- Redução de 155 queries → 1 query
- 99.4% melhoria de latência (7.75s → 50ms)

✅ **API Pagination**
- Default: 20 items/page, max 100
- 3 rotas paginadas
- 98% redução de payload (5MB → 100KB)

✅ **Q&A Response Caching**
- Cache de 7 dias
- MD5 hash keys
- Reduz custos de API

✅ **Build Optimization**
- Code splitting automático (Vite)
- Tree shaking
- Minification (esbuild)
- Gzip compression

✅ **Asset Optimization**
- Lazy loading de imagens
- Componentes code-split por rota
- React.lazy() para páginas

**Métricas:**
- Build time: ~10s
- Bundle size (frontend): ~600KB gzipped
- Time to Interactive: < 2s
- Lighthouse Score: 90+

**📖 Relatório completo**: [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Este projeto está em fase de desenvolvimento.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Guidelines

- ✅ Siga o style guide do projeto (ESLint)
- ✅ Adicione testes para novas features
- ✅ Atualize a documentação se necessário
- ✅ Use Conventional Commits
- ✅ Mantenha o coverage de testes acima de 80%

### Pull Request Template

Use o template em [`.github/pull_request_template.md`](./.github/pull_request_template.md)

---

## 📄 Licença

Este projeto é propriedade de **Nathália Valente**. Todos os direitos reservados.

Para uso comercial ou licenciamento, entre em contato através do [site oficial](https://www.nossamaternidade.com.br/).

---

## 📞 Contato

### Nathália Valente

- 🌐 Website: [www.nossamaternidade.com.br](https://www.nossamaternidade.com.br/)
- 📸 Instagram: [@nathaliavalente](https://instagram.com/nathaliavalente)
- 📧 Email: contato@nossamaternidade.com.br

### Equipe de Desenvolvimento

- 🐛 Issues: [GitHub Issues](https://github.com/LionGab/Nossa-Maternidadelol/issues)
- 💡 Feature Requests: [GitHub Issues](https://github.com/LionGab/Nossa-Maternidadelol/issues/new?template=feature_request.md)
- 🔒 Security: [Security Policy](https://github.com/LionGab/Nossa-Maternidadelol/security/policy)

---

## 💝 Agradecimentos

Criado com carinho para mães e gestantes que merecem apoio, acolhimento e compreensão em sua jornada.

### Tecnologias & Comunidades

- [Vercel](https://vercel.com/) - Hosting e deploy
- [Neon](https://neon.tech/) - PostgreSQL serverless
- [Google AI](https://ai.google.dev/) - Gemini API
- [Perplexity](https://www.perplexity.ai/) - Search API
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI incríveis
- Comunidade Open Source ❤️

### Inspiração

Este projeto foi inspirado pela missão de criar um espaço onde **TODAS as mães** se sintam:
- ✨ Acolhidas
- 💪 Empoderadas
- 🤗 Compreendidas
- 💖 Amadas

---

<div align="center">

### 🌸 Nossa Maternidade

**Um refúgio sem julgamentos**

[www.nossamaternidade.com.br](https://www.nossamaternidade.com.br/)

*Desenvolvido com ❤️ pela equipe Nathália Valente*

---

⭐ Se este projeto te ajudou, considere dar uma estrela!

[![GitHub stars](https://img.shields.io/github/stars/LionGab/Nossa-Maternidadelol?style=social)](https://github.com/LionGab/Nossa-Maternidadelol/stargazers)

</div>

---

## 📱 Sobre o Projeto

**Nossa Maternidade** é uma plataforma digital inovadora criada pela influenciadora **Nathália Valente** (@nathaliavalente), oferecendo um espaço seguro, acolhedor e livre de julgamentos para mães e gestantes em todas as fases da maternidade.

### 🎯 Missão

Proporcionar suporte emocional, informação confiável e ferramentas práticas para o bem-estar materno, combinando tecnologia de IA com empatia humana.

### ✨ Funcionalidades Principais

| Funcionalidade | Descrição |
|---------------|-----------|
| 💬 **NathIA** | Assistente de IA empática especializada em saúde mental materna, powered by Google Gemini 2.5 Flash |
| 🌟 **Mãe Valente** | Busca inteligente com respostas baseadas em fontes confiáveis, powered by Perplexity AI |
| ✅ **Hábitos** | Sistema gamificado de tracking de hábitos com streaks, XP, níveis e achievements |
| 🏡 **Refúgio Nath** | Comunidade segura para desabafos, perguntas e apoio mútuo entre mães |
| 📚 **Mundo Nath** | Conteúdos educativos, dicas práticas e posts virais do Instagram/TikTok |

## 🎯 Funcionalidades Principais

### NathIA - Assistente Virtual
- Chat empático e acolhedor com IA
- Respostas personalizadas sobre maternidade
- Suporte emocional sem julgamentos
- Histórico de conversas

### Mãe Valente - Pesquisa Inteligente
- Busca sobre saúde mental materna
- Informações baseadas em fontes confiáveis
- Tópicos sobre ansiedade, burnout materno, autocuidado
- Recursos de emergência (CVV, SAMU)
- Salvamento de respostas importantes

### Hábitos Saudáveis
- Rastreamento diário de hábitos
- Sistema de sequências (streaks)
- Estatísticas semanais
- Interface gamificada e motivacional

### Mundo Nath
- Conteúdos virais do TikTok e Instagram
- Posts educativos sobre maternidade
- Dicas práticas do dia
- Sistema de favoritos

## 🛠 Tecnologias

### Frontend
- **React** + **TypeScript** - Interface moderna e tipada
- **Wouter** - Roteamento leve
- **TanStack Query** - Gerenciamento de estado e cache
- **shadcn/ui** - Componentes UI elegantes
- **Tailwind CSS** - Estilização responsiva
- **Vite** - Build tool ultrarrápido

### Backend
- **Node.js** + **Express** - API REST
- **TypeScript** - Código tipado e seguro
- **In-Memory Storage** - Persistência de dados

### IA e Integrações
- **Gemini AI** (via Replit AI Integrations) - Assistente NathIA
- **Perplexity AI** - Busca inteligente Mãe Valente

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nossa-maternidade.git
cd nossa-maternidade

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Copie o arquivo .env.example para .env e preencha as chaves necessárias

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`

## 📝 Variáveis de Ambiente

```env
# Gemini AI (via Replit AI Integrations)
AI_INTEGRATIONS_GEMINI_API_KEY=your_key_here
AI_INTEGRATIONS_GEMINI_BASE_URL=your_url_here

# Perplexity AI (Mãe Valente)
PERPLEXITY_API_KEY=your_key_here
```

## 📂 Estrutura do Projeto

```
nossa-maternidade/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   └── lib/         # Utilitários e configurações
├── server/              # Backend Express
│   ├── routes.ts        # Rotas da API
│   ├── storage.ts       # Camada de persistência
│   ├── gemini.ts        # Integração NathIA
│   └── perplexity.ts    # Integração Mãe Valente
├── shared/              # Código compartilhado
│   └── schema.ts        # Schemas e tipos
└── attached_assets/     # Imagens e recursos
```

## 🎨 Design e UX

- Interface responsiva (mobile-first)
- Tema claro/escuro
- Paleta de cores suaves e acolhedoras
- Animações sutis e feedback visual
- Acessibilidade em primeiro lugar

## 🔒 Segurança e Privacidade

- Dados armazenados localmente no ambiente de desenvolvimento
- Comunicação segura com APIs de IA
- Sem coleta de dados pessoais sensíveis
- Recursos de emergência sempre acessíveis

## 🤖 Automação e CI/CD

### GitHub Actions Workflows

Este projeto possui automação completa via GitHub Actions:

#### 1. **CI Workflow** - Integração Contínua
- ✅ TypeScript type checking
- ✅ Build verification
- ✅ Security audit
- ✅ Schema validation
- **Trigger:** Push/PR para `main` ou `develop`

#### 2. **Deploy Workflow** - Deploy Automático
- 🚀 Deploy para Vercel
- 🗄️ Database migrations
- 🔍 Health check validation
- **Trigger:** Push para `main`

#### 3. **Neon Branch Workflow** - Database Branching
- 🌿 Cria database branch para cada PR
- 📊 Roda migrations automaticamente
- 📝 Posta schema diff como comentário
- 🗑️ Deleta branch ao fechar PR (expira em 2 semanas)
- **Trigger:** PR opened/reopened/synchronize/closed

#### 4. **Dependabot** - Atualizações Automáticas
- 📦 Updates semanais de npm (segundas, 9h)
- 🔧 Updates mensais de GitHub Actions

### Setup dos Secrets

Para habilitar os workflows, configure em **Settings → Secrets and variables → Actions**:

**Secrets:**
```bash
NEON_API_KEY          # Neon Dashboard → Account Settings → API Keys
VERCEL_TOKEN          # Vercel → Account Settings → Tokens
GEMINI_API_KEY        # Google AI Studio
PERPLEXITY_API_KEY    # Perplexity API
SESSION_SECRET        # openssl rand -base64 32
DATABASE_URL          # Neon connection string
```

**Variables:**
```bash
NEON_PROJECT_ID       # Neon Dashboard → Project Settings → General
VERCEL_ORG_ID         # Vercel Dashboard → Settings → General
VERCEL_PROJECT_ID     # Vercel Project Settings → General
```

Veja o guia completo em [`DEPLOYMENT.md`](./DEPLOYMENT.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Este projeto está em fase de desenvolvimento e teste fechado.

### Como contribuir com PRs

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Automações no PR:**
- ✅ CI roda automaticamente (typecheck, build, security)
- 🗄️ Database branch de preview é criado
- 📊 Schema diff é postado como comentário
- 🔍 PR template guia a descrição

Veja templates em `.github/ISSUE_TEMPLATE/` e `.github/pull_request_template.md`

## 📄 Licença

Este projeto é propriedade de Nathália Valente.

## 💝 Agradecimentos

Criado com carinho para mães e gestantes que merecem apoio, acolhimento e compreensão em sua jornada.

---

<div align="center">

**🌸 Nossa Maternidade** - [www.nossamaternidade.com.br](https://www.nossamaternidade.com.br/)

*Desenvolvido com ❤️ pela equipe Nathália Valente*

</div>
