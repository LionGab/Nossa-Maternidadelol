<div align="center">

# 🌸 Nossa Maternidade

### Plataforma Digital de Bem-Estar Materno

*Um refúgio sem julgamentos para mães e gestantes*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-100%20passing-success.svg)](tests/)

[Demo](https://nossa-maternidade.vercel.app) · [Documentação](docs/) · [Report Bug](https://github.com/LionGab/Nossa-Maternidadelol/issues)

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

**Desenvolvido com** ❤️ **pela equipe Nathália Valente**
