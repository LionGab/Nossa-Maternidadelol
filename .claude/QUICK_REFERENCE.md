# Claude Code Quick Reference

**Nossa Maternidade Project**
Last Updated: 2025-01-12

---

## 🚀 Slash Commands

| Command | Use Case | Time Saved |
|---------|----------|------------|
| `/check-types` | TypeScript error check | 2-3 min |
| `/test-api` | Test all API endpoints | 5-10 min |
| `/check-env` | Validate environment vars | 2 min |
| `/review-security` | Security audit | 10-15 min |
| `/optimize` | Performance analysis | 15-20 min |
| `/deploy-check` | Pre-deployment checklist | 20-30 min |
| `/seed-db` | Populate test data | 10-15 min |
| `/ai-test` | Test AI integrations | 5-10 min |

### Quick Command Guide

**Before committing:**
```
/check-types
```

**After backend changes:**
```
/test-api
```

**Before deployment:**
```
/deploy-check
```

**Performance issues?**
```
/optimize
```

**Security review?**
```
/review-security
```

---

## 🪝 Automatic Hooks

### Pre-commit Hook ✅
**Runs:** Before `git commit`
**Checks:**
- ✅ TypeScript errors (blocking)
- ⚠️ console.* usage (warning)
- ✅ Secrets in code (blocking)
- ⚠️ Import patterns (warning)

### Pre-push Hook ✅
**Runs:** Before `git push`
**Checks:**
- ✅ Build success (blocking)
- ✅ TypeScript check (blocking)
- ⚠️ Security audit (warning)
- ⚠️ TODO comments (warning)

### Pre-deploy Hook ✅
**Runs:** Manual via `/deploy-check`
**Checks:**
- ✅ Environment variables
- ✅ Security configuration
- ✅ Code quality
- ✅ No secrets committed
- ✅ No critical vulnerabilities

---

## 📋 Common Workflows

### Daily Development
```
1. Write code with Cursor autocomplete
2. git add . (pre-commit hook runs automatically)
3. git commit -m "message"
4. git push (pre-push hook runs automatically)
```

### API Development
```
1. Make changes to server/routes.ts
2. /test-api to verify endpoints
3. /check-types to ensure type safety
4. Commit & push
```

### Performance Optimization
```
1. /optimize to identify issues
2. Fix N+1 queries, add pagination, etc.
3. /test-api to verify improvements
4. Commit & push
```

### Security Review
```
1. /review-security for full audit
2. Fix any ❌ critical issues
3. Address ⚠️ warnings
4. /deploy-check before deploying
```

### Deployment
```
1. /deploy-check (comprehensive validation)
2. Fix all blocking issues
3. Verify env vars on platform (Vercel/Railway)
4. Deploy with confidence ✅
```

---

## 🔧 Quick Configuration

### Enable/Disable Hook
```bash
# Edit .claude/hooks/<hook-name>.json
"enabled": true  # or false
```

### Make Check Non-blocking
```bash
# Edit specific check in hook JSON
"blocking": false  # warning only
```

### Add File to Exclusion
```bash
# In hook JSON
"exclude": ["node_modules/**", "*.test.ts", "docs/**"]
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Hook not running | Check `"enabled": true` in hook JSON |
| Command not found | Verify `.md` file exists in `.claude/commands/` |
| False positive | Add to `"exclude"` array or set `"blocking": false` |
| Hook blocking valid code | Review specific check and adjust config |

---

## 💡 Pro Tips

1. **Run `/deploy-check` before every deployment** - catches 90% of issues
2. **Use `/optimize` regularly** - prevents performance degradation
3. **Enable `user-prompt-submit` hook** - get smarter command suggestions
4. **Chain commands** - Run multiple in succession for thorough checks
5. **Customize hooks** - Adjust blocking behavior for your workflow

---

## 📊 Time Savings Calculator

**Weekly development (20 commits, 2 deployments):**

- Type checking: 20 × 2 min = **40 min saved**
- API testing: 10 × 5 min = **50 min saved**
- Security reviews: 2 × 15 min = **30 min saved**
- Deployment checks: 2 × 30 min = **60 min saved**

**Total weekly savings: ~3 hours**
**Monthly savings: ~12 hours**

---

## 📚 Full Documentation

- **Complete guide:** `.claude/README.md`
- **Project docs:** `CLAUDE.md`
- **Quick context:** `CONTEXT.md`

---

## 🎯 Keyboard Shortcuts

**In Claude Code:**
- Type `/` → see available commands
- `Ctrl+/` → command palette (if available)
- `Ctrl+K` → quick actions

**In Cursor:**
- `Ctrl+Shift+P` → command palette
- `Ctrl+`` → toggle terminal
- `Ctrl+L` → focus Claude Code

---

## 🔐 Security Reminders

- ✅ Always run `/review-security` before deployment
- ✅ Verify `.env` is in `.gitignore`
- ✅ SESSION_SECRET must be ≥32 chars in production
- ✅ Rate limiting must be enabled on AI endpoints
- ✅ All user inputs must have Zod validation

---

**Need help?** Run `/help` or check `.claude/README.md` for detailed documentation.
