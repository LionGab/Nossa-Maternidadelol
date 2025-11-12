# Claude Code Resources

This directory contains custom slash commands and hooks to optimize your workflow with Claude Code.

## 📁 Directory Structure

```
.claude/
├── commands/          # Custom slash commands
│   ├── check-types.md
│   ├── test-api.md
│   ├── review-security.md
│   ├── check-env.md
│   ├── deploy-check.md
│   ├── optimize.md
│   ├── seed-db.md
│   └── ai-test.md
├── hooks/            # Automated validation hooks
│   ├── pre-commit.json
│   ├── pre-push.json
│   ├── pre-deploy.json
│   └── user-prompt-submit.json
├── settings.local.json
└── README.md (this file)
```

---

## 🚀 Slash Commands

Slash commands are custom shortcuts you can type in Claude Code to trigger specialized workflows.

### Usage

Type `/` followed by the command name in Claude Code:

```
/check-types
/test-api
/review-security
/permissions-allow-all
/permissions-deny-all
/permissions-review
```

### Available Commands

#### `/check-types`
**Purpose:** Run TypeScript type checking and report errors
**When to use:** Before committing code, when fixing type errors
**Output:** List of type errors with file locations and suggested fixes

#### `/test-api`
**Purpose:** Test critical API endpoints for functionality
**When to use:** After making backend changes, before deployment
**Tests:**
- Authentication endpoints
- AI integrations (NathIA, Mãe Valente)
- Pagination
- Rate limiting
- Response schemas

#### `/review-security`
**Purpose:** Comprehensive security audit of codebase
**When to use:** Before deployment, after adding auth features
**Checks:**
- Authentication & authorization
- Input validation
- Rate limiting
- SQL injection & XSS vulnerabilities
- Secrets management
- CORS configuration
- Dependency vulnerabilities

#### `/check-env`
**Purpose:** Validate environment variables configuration
**When to use:** When setting up project, before deployment
**Validates:**
- All required variables from .env.example
- Format validation (DATABASE_URL, SESSION_SECRET length, etc.)
- Security checks (.env in .gitignore)

#### `/deploy-check`
**Purpose:** Complete pre-deployment verification checklist
**When to use:** Before every production deployment
**Checks:**
- Code quality (TypeScript, build)
- Security configuration
- Environment setup
- Database migrations
- Performance optimizations
- Monitoring setup

**Output:** READY TO DEPLOY or list of blocking issues

#### `/optimize`
**Purpose:** Analyze performance and suggest optimizations
**When to use:** When experiencing slow endpoints, before optimization work
**Analyzes:**
- N+1 query patterns
- API response sizes
- Bundle size
- Caching opportunities
- Memory leaks

**Output:** Issues found with file:line references + recommendations

#### `/seed-db`
**Purpose:** Populate database with realistic test data
**When to use:** Setting up dev environment, testing features
**Creates:**
- Demo users (different subscription tiers)
- Posts & viral content
- Habits with completion streaks
- Community posts & comments
- Achievements

**Output:** Test user credentials for manual testing

#### `/ai-test`
**Purpose:** Test AI integrations (Gemini & Perplexity)
**When to use:** After API configuration changes, monitoring costs
**Tests:**
- NathIA chat responses
- Mãe Valente search quality
- Cache functionality
- Rate limiting
- Error handling

**Output:** Response times, cost estimates, optimization suggestions

#### `/permissions-allow-all`
**Purpose:** Aprovar todas as permissões automaticamente (adiciona wildcards ao `allow`)
**When to use:** Durante desenvolvimento quando você confia no Claude Code, para evitar prompts constantes
**Action:** Adiciona `Bash(*)`, `WebFetch(*)`, `FileRead(*)`, `FileWrite(*)`, `Terminal(*)` ao array `allow`
**Output:** Confirmação de que todas as permissões foram permitidas

⚠️ **Atenção:** Remove camada de segurança - use apenas em desenvolvimento local

#### `/permissions-deny-all`
**Purpose:** Negar todas as permissões automaticamente (configuração máxima segurança)
**When to use:** Quando quer máxima segurança, antes de revisar código sensível, trabalhando com secrets
**Action:** Adiciona wildcards ao `deny`, mantém apenas `Bash(cat:*)`, `Bash(dir:*)`, `WebSearch` no `allow`
**Output:** Confirmação de configuração restritiva aplicada

#### `/permissions-review`
**Purpose:** Revisar e analisar todas as permissões configuradas
**When to use:** Antes de mudar configurações, para auditar segurança, entender o que Claude pode fazer
**Output:** 
- Lista de permissões permitidas/negadas/pendentes
- Categorização por nível de risco (🟢🟡🔴)
- Estatísticas e sugestões de melhorias
- Recomendações de segurança

---

## 🪝 Hooks

Hooks are automated checks that run in response to events (git operations, user prompts, etc.).

### Configuration

Hooks are defined in `.claude/hooks/*.json` files. Each hook specifies:
- **trigger** - When to run (pre-commit, pre-push, manual)
- **enabled** - Whether hook is active
- **checks** - List of validations to perform
- **blocking** - Whether to prevent action if check fails

### Available Hooks

#### `pre-commit` (Git Hook)
**Trigger:** Before `git commit`
**Status:** ✅ Enabled
**Checks:**
- ✅ TypeScript type check (blocking)
- ⚠️ No console.* statements (warning)
- ✅ No secrets in code (blocking)
- ⚠️ Validate imports (warning)

**Purpose:** Prevent committing broken or insecure code

#### `pre-push` (Git Hook)
**Trigger:** Before `git push`
**Status:** ✅ Enabled
**Checks:**
- ✅ Build succeeds (blocking)
- ✅ TypeScript check passes (blocking)
- ⚠️ Security audit (warning for high/critical vulns)
- ⚠️ Check for TODOs (warning)
- ✅ .env.example exists (blocking)

**Purpose:** Ensure pushed code is production-ready

#### `pre-deploy` (Manual Hook)
**Trigger:** Manual (run via `/deploy-check` or before deployment)
**Status:** ✅ Enabled
**Comprehensive checks:**
- ✅ Environment variables validated (NODE_ENV, SESSION_SECRET, etc.)
- ✅ Security configuration (rate limiting, input validation, secure sessions)
- ✅ Code quality (TypeScript + build)
- ✅ .env not committed to git (critical)
- ✅ No critical vulnerabilities in production dependencies
- ⚠️ Database migrations reminder
- ⚠️ Platform configuration reminder
- ⚠️ Backup verification reminder

**Output:** Clear PASS/FAIL + actionable items

#### `user-prompt-submit` (Prompt Hook)
**Trigger:** When submitting prompts to Claude Code
**Status:** ⚠️ Disabled by default
**Purpose:** Suggest better prompts and relevant commands

**Enable by setting `"enabled": true` in `.claude/hooks/user-prompt-submit.json`**

**Suggestions:**
- Detects vague requests → suggests specific alternatives
- Security keywords → suggests `/review-security`
- Performance keywords → suggests `/optimize`
- Deployment keywords → suggests `/deploy-check`

---

## ⚙️ Configuration

### Enabling/Disabling Hooks

Edit the hook JSON file and change `"enabled"`:

```json
{
  "name": "Pre-commit Validation",
  "enabled": true,  // ← Change to false to disable
  ...
}
```

### Adjusting Blocking Behavior

Each check has a `"blocking"` flag:

```json
{
  "name": "No Console Statements",
  "blocking": false,  // ← Warning only
  ...
}
```

- `true` - Prevents action if check fails
- `false` - Shows warning but allows action

### Adding Custom Checks

You can add custom validations to any hook:

```json
{
  "name": "Custom Check",
  "pattern": "your-regex-pattern",
  "exclude": ["node_modules/**"],
  "blocking": true,
  "message": "❌ Your custom error message"
}
```

---

## 🎯 Recommended Workflow

### Daily Development (Cursor $20)

1. **Write code** with autocomplete
2. **Before commit:**
   - Pre-commit hook validates automatically
   - Or manually run `/check-types`
3. **Before push:**
   - Pre-push hook validates automatically
   - Or manually run `/test-api` for API changes

### Complex Tasks (Claude Max $100)

1. **Planning:** Reference `CONTEXT.md` for quick context
2. **Architecture decisions:** Ask Claude Max for analysis
3. **Security review:** Run `/review-security`
4. **Performance optimization:** Run `/optimize`

### Before Deployment

1. **Run `/deploy-check`** - Full validation
2. **Fix all blocking issues**
3. **Verify environment variables on platform**
4. **Run database migrations if needed**
5. **Deploy with confidence** ✅

---

## 🔧 Customization

### Creating New Slash Commands

1. Create a new `.md` file in `.claude/commands/`
2. Write clear instructions for Claude Code to follow
3. Use this template:

```markdown
# Command Name

Brief description of what this command does.

## Instructions

1. Step-by-step instructions
2. What to check
3. How to format output

## Output Format

Describe expected output format.
```

### Creating New Hooks

1. Create a new `.json` file in `.claude/hooks/`
2. Define trigger, checks, and validation logic
3. Use this template:

```json
{
  "name": "Hook Name",
  "description": "What this hook does",
  "trigger": "pre-commit|pre-push|manual",
  "enabled": true,
  "checks": [
    {
      "name": "Check Name",
      "command": "npm run something",
      "blocking": true,
      "message": "Error message"
    }
  ]
}
```

---

## 📊 Impact

### Time Saved

- **Type checking:** Automated via hooks (saves 2-3 min per commit)
- **Security reviews:** `/review-security` in 1 min (vs 10-15 min manual)
- **API testing:** `/test-api` in 2 min (vs 5-10 min manual)
- **Pre-deployment:** `/deploy-check` in 3 min (vs 20-30 min manual checklist)

### Quality Improvements

- **Fewer bugs in production:** Pre-push validation catches issues early
- **Better security:** Automated secret detection, security audits
- **Consistent code quality:** Enforced type checking and validation
- **Faster onboarding:** New devs can run commands to understand codebase

---

## 🆘 Troubleshooting

### Hooks not running

1. Verify hook is enabled: `"enabled": true`
2. Check Claude Code settings: `.claude/settings.local.json`
3. Restart Claude Code

### Command not found

1. Verify file exists in `.claude/commands/`
2. Check file has `.md` extension
3. Restart Claude Code to reload commands

### Hook blocking valid code

1. Review the specific check that's failing
2. Either fix the issue or disable the check temporarily
3. Consider adjusting blocking behavior: `"blocking": false`

### False positives in secret detection

1. Add file to exclude list in hook JSON:
   ```json
   "exclude": [".env.example", "docs/*.md"]
   ```

---

## 📚 Additional Resources

- **Claude Code Docs:** https://docs.claude.com/claude-code
- **Project Context:** See `CONTEXT.md` for quick reference
- **Full Documentation:** See `CLAUDE.md` for complete project guide
- **Cursor Setup:** See Cursor-specific instructions in `CLAUDE.md`

---

## 🤝 Contributing

When adding new commands or hooks:

1. Follow existing naming conventions
2. Document thoroughly with examples
3. Test before committing
4. Update this README

---

**Last Updated:** 2025-01-12
**Version:** 1.0.0
**Maintained by:** Nossa Maternidade Dev Team
