# Cursor Configuration - Nossa Maternidade

**Quick Reference for MCP Servers + Claude Code Resources**

---

## 📁 What's in This Directory

```
.cursor/
├── mcp.json                  # MCP server configuration ✅ NEW
├── settings.json             # Terminal and editor settings
├── snippets.json             # Code snippets
├── terminal-init.ps1         # PowerShell env loader
├── terminal-init.sh          # Bash/Zsh env loader
└── README-MCP.md            # This file
```

---

## 🔌 MCP Servers (Model Context Protocol)

### Enabled by Default

| Server | Purpose | API Key Required |
|--------|---------|------------------|
| **Neon** | PostgreSQL database integration | `NEON_API_KEY` |
| **GitHub** | Repository & PR management | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| **Memory** | Knowledge graph persistence | None (local) |

### Optional (Disabled)

| Server | Purpose | Enable When |
|--------|---------|-------------|
| **Sequential Thinking** | Complex problem solving | Architectural decisions |
| **Vercel** | Deployment management | Managing deployments |

---

## 🚀 Quick Setup

### 1. Get API Keys

**Neon:**
- Go to: https://console.neon.tech/app/settings/api-keys
- Create API Key
- Add to `.env` as `NEON_API_KEY`

**GitHub:**
- Go to: https://github.com/settings/tokens
- Generate new token (classic)
- Scopes: `repo`, `workflow`, `read:org`
- Add to `.env` as `GITHUB_PERSONAL_ACCESS_TOKEN`

### 2. Update .env

```bash
# In project root .env file
NEON_API_KEY=neon_api_xxxxxxxxxxxxxxxx
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxx
```

### 3. Restart Cursor

Close Cursor completely and reopen. MCPs will initialize automatically.

### 4. Test

In Claude Code, ask:
```
Are MCP servers running? List available tools.
```

---

## 💡 Usage Examples

### Database Operations (Neon MCP)

```
"Show me all tables in the database"
"What's the schema for the users table?"
"Find slow queries from last 24 hours"
```

### GitHub Operations (GitHub MCP)

```
"Show me recent commits on main"
"List open PRs with label 'bug'"
"Check latest workflow status"
```

### Knowledge Persistence (Memory MCP)

```
"Remember that we use Drizzle ORM with Neon PostgreSQL"
"What do you remember about our database setup?"
```

---

## 🔧 Configuration

### Enable/Disable MCP

Edit `.cursor/mcp.json`:

```json
{
  "neon": {
    "enabled": true  // ← Change to false to disable
  }
}
```

Restart Cursor after changes.

### View Logs

```bash
# Check MCP initialization logs
tail -f .cursor/logs/mcp.log
```

---

## 🆘 Troubleshooting

**MCPs not starting:**
1. Verify API keys in `.env`
2. Check Node.js version: `node --version` (need ≥18.0.0)
3. Restart Cursor completely
4. Check logs in `.cursor/logs/mcp.log`

**Authentication errors:**
1. Verify key format (neon_api_, ghp_)
2. Check token scopes/permissions
3. Regenerate key if expired

---

## 📚 Full Documentation

- **MCP Setup Guide:** `../MCP_SETUP.md`
- **Claude Code Resources:** `../.claude/README.md`
- **Project Docs:** `../CLAUDE.md`

---

## 🔐 Security Reminders

- ✅ Never commit `.env` file
- ✅ Rotate API keys every 90 days
- ✅ Use minimum required permissions
- ✅ Review token scopes regularly

---

**Last Updated:** 2025-01-12
