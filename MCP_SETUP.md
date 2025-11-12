# MCP Servers Setup Guide

**Nossa Maternidade Project**
**Last Updated:** 2025-01-12

---

## 📋 Table of Contents

1. [What are MCP Servers?](#what-are-mcp-servers)
2. [Installed MCPs](#installed-mcps)
3. [Prerequisites](#prerequisites)
4. [Installation Steps](#installation-steps)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Security](#security)
9. [Usage Examples](#usage-examples)

---

## What are MCP Servers?

**Model Context Protocol (MCP)** is an open protocol that enables AI assistants like Claude to connect to external tools and data sources. MCP servers provide specialized capabilities:

- **Database Operations** - Natural language database queries
- **GitHub Integration** - Automated PR/issue management
- **Knowledge Persistence** - Context preservation across sessions
- **Deployment Management** - Environment and deployment control

---

## Installed MCPs

### ✅ Enabled MCPs

| MCP Server | Purpose | Status | Variables |
|------------|---------|--------|-----------|
| **GitHub** | Repository and PR management | ✅ Enabled | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| **Memory** | Knowledge graph persistence | ✅ Enabled | Nenhuma (arquivo local) |
| **Sequential Thinking** | Structured problem-solving | ✅ Enabled | Nenhuma |
| **Vercel** | Deployment management | ✅ Enabled | `VERCEL_API_KEY` |
| **Supabase** | PostgreSQL database operations | ✅ Enabled | `DATABASE_URL` |

### ⚠️ Disabled MCPs

| MCP Server | Purpose | Status | Reason |
|------------|---------|--------|--------|
| **Neon** | PostgreSQL database integration | ❌ Disabled | Migrado para Supabase |

---

## Prerequisites

### Required Software

- **Node.js** v18.0.0 or higher
- **npm** or **pnpm** (comes with Node.js)
- **Git** (already installed for this project)
- **Cursor** or **Claude Desktop**

### API Keys Needed

Before enabling MCP servers, obtain these API keys:

#### 1. GitHub Personal Access Token (Required for GitHub MCP)
**Where to get:**
1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Name: "Nossa Maternidade MCP"
4. Select scopes:
   - ✅ `repo` (Full repository access)
   - ✅ `workflow` (GitHub Actions access)
   - ✅ `read:org` (Organization read access)
5. Click **Generate token**
6. Copy the token (starts with `ghp_`)
7. Add to `.env` as `GITHUB_PERSONAL_ACCESS_TOKEN`

**Security Note:** Store token securely, never commit to git

#### 2. Vercel API Token (Required for Vercel MCP)
**Where to get:**
1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: "Nossa Maternidade MCP"
4. Scope: **Full Account** (or specific project)
5. Expiration: Set appropriate expiration
6. Copy the token
7. Add to `.env` as `VERCEL_API_KEY`

#### 3. Supabase DATABASE_URL (Required for Supabase MCP)
**Where to get:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Add to `.env` as `DATABASE_URL`

**Format:**
```
postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Note:** This uses the standard PostgreSQL MCP server, which works with any PostgreSQL database including Supabase.

---

## Installation Steps

### Step 1: Copy Environment Variables

```bash
# If you don't have a .env file yet
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

### Step 2: Add API Keys to .env

Open `.env` and add the following:

```bash
# MCP Server API Keys
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Supabase (já configurado no projeto)
SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Verify MCP Configuration

The MCP configuration is already set up in `.cursor/mcp.json`. To verify:

```bash
cat .cursor/mcp.json
```

You should see configuration for all MCP servers.

### Step 4: Restart Cursor

**Important:** MCP servers are loaded when Cursor starts.

1. Close Cursor completely
2. Reopen Cursor
3. Open the Nossa Maternidade project
4. MCP servers will initialize automatically

### Step 5: Verify MCPs are Running

In Claude Code, you can check if MCPs are active by asking:

```
Are MCP servers running? Which ones are available?
```

Or check Cursor's output panel for MCP initialization logs.

---

## Configuration

### MCP Configuration File

Located at: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@github/github-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}",
        "GITHUB_TOOLSETS": "context,repos,issues,pull_requests,actions"
      },
      "enabled": true
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_FILE_PATH": "${HOME}/.nossa-maternidade-memory.jsonl"
      },
      "enabled": true
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "enabled": true
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "@zueai/vercel-api-mcp"],
      "env": {
        "VERCEL_API_KEY": "${VERCEL_API_KEY}"
      },
      "enabled": true
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      },
      "enabled": true
    }
  }
}
```

### Enabling/Disabling MCPs

To disable an MCP server, edit `.cursor/mcp.json`:

```json
{
  "neon": {
    ...
    "enabled": false  // ← Change to false to disable
  }
}
```

Then restart Cursor.

### Customizing GitHub Toolsets

By default, GitHub MCP includes: `context`, `repos`, `issues`, `pull_requests`, `actions`

To customize, edit `.cursor/mcp.json`:

```json
{
  "github": {
    ...
    "env": {
      "GITHUB_TOOLSETS": "context,repos,issues"  // ← Customize here
    }
  }
}
```

Available toolsets:
- `context` - Repository context
- `repos` - Repository management
- `issues` - Issue tracking
- `pull_requests` - PR management
- `actions` - GitHub Actions CI/CD
- `code_security` - Security scanning
- `discussions` - GitHub Discussions
- `gists` - Gist management

---

## Testing

### Test Supabase MCP

In Claude Code, try:

```
List all tables in the database
```

or

```
Show me the schema for the users table in the database
```

or

```
Find all users created in the last 7 days
```

Expected: Claude should be able to query your Supabase PostgreSQL database

### Test GitHub MCP

In Claude Code, try:

```
Show me the latest 5 commits on the main branch
```

or

```
List all open pull requests for this repository
```

Expected: Claude should fetch real data from your GitHub repository

### Test Memory MCP

In Claude Code, try:

```
Remember that we decided to migrate from in-memory storage to Drizzle ORM for better data persistence
```

Then in a new conversation:

```
What do you remember about our storage migration plans?
```

Expected: Claude should recall the information from the previous conversation

---

## Troubleshooting

### MCP Servers Not Starting

**Problem:** MCPs don't initialize when Cursor starts

**Solutions:**
1. Check Cursor output panel for error messages
2. Verify API keys are correctly set in `.env`
3. Ensure `.env` file exists in project root
4. Restart Cursor completely (close all windows)
5. Check Node.js version: `node --version` (must be ≥18.0.0)

### Authentication Errors

**Problem:** "Authentication failed" or "Invalid API key"

**Solutions:**

**For Neon:**
1. Verify `NEON_API_KEY` in `.env`
2. Check key starts with `neon_api_`
3. Regenerate key at https://console.neon.tech/app/settings/api-keys
4. Ensure no trailing spaces in `.env` file

**For GitHub:**
1. Verify `GITHUB_PERSONAL_ACCESS_TOKEN` in `.env`
2. Check token has required scopes (repo, workflow, read:org)
3. Verify token hasn't expired
4. Regenerate token at https://github.com/settings/tokens

### Rate Limit Errors

**Problem:** "Rate limit exceeded"

**Solutions:**
1. **GitHub:** 5,000 requests/hour limit - wait or use different account
2. **Neon:** Check Neon plan limits
3. Reduce frequency of MCP operations
4. Consider caching results locally

### Memory MCP Not Persisting

**Problem:** Knowledge graph doesn't persist between sessions

**Solutions:**
1. Check `MEMORY_FILE_PATH` in `.cursor/mcp.json`
2. Verify directory exists: `ls -la ~/.nossa-maternidade-memory.jsonl`
3. Check file permissions (should be writable)
4. Manually create file if missing: `touch ~/.nossa-maternidade-memory.jsonl`

### npx Installation Issues

**Problem:** "npx command not found" or "Package not found"

**Solutions:**
1. Update Node.js: https://nodejs.org
2. Clear npm cache: `npm cache clean --force`
3. Try with full package path: `npx -y @neondatabase/mcp-server-neon`
4. Check network connection (npx downloads packages on demand)

---

## Security

### Best Practices

✅ **DO:**
- Store all API keys in `.env` file only
- Add `.env` to `.gitignore` (already configured)
- Use read-only tokens when possible
- Rotate API keys every 90 days
- Set token expiration dates
- Review MCP server permissions regularly

❌ **DON'T:**
- Commit API keys to git
- Share API keys in chat messages
- Use production keys for development
- Grant unnecessary permissions to tokens
- Use tokens without expiration dates

### API Key Permissions

**Neon MCP:**
- ✅ Required: Full project access
- ⚠️ Risk: Can modify database schema
- 💡 Mitigation: Use read-only mode in production (set `NEON_READ_ONLY=true`)

**GitHub MCP:**
- ✅ Required: `repo`, `workflow`, `read:org`
- ⚠️ Risk: Can push code and trigger workflows
- 💡 Mitigation: Use fine-grained tokens with specific repository access

**Vercel MCP:**
- ✅ Required: Read and Write access
- ⚠️ Risk: Can deploy and modify environment variables
- 💡 Mitigation: Use read-only token for monitoring, write token only when deploying

### Revoking Compromised Keys

If an API key is compromised:

1. **Immediately revoke** the key:
   - **Neon:** https://console.neon.tech/app/settings/api-keys
   - **GitHub:** https://github.com/settings/tokens
   - **Vercel:** https://vercel.com/account/tokens

2. **Generate new key** with same permissions

3. **Update `.env`** with new key

4. **Restart Cursor** to reload MCP configuration

5. **Review git history** - ensure key was never committed:
   ```bash
   git log -p | grep -i "neon_api\|ghp_\|vercel"
   ```

6. **If committed:** Rotate immediately and consider repo as compromised

---

## Usage Examples

### Database Operations with Supabase MCP

```
Query Examples:
- "Show me all tables in the database"
- "What's the schema for the users table?"
- "Find all users created in the last 7 days"
- "Show me slow queries from the last 24 hours"
- "List all columns in the posts table"

Schema Examples:
- "What indexes exist on the users table?"
- "Show me all foreign key relationships"
- "What's the data type of the email column in users?"
```

### GitHub Operations with GitHub MCP

```
Repository Examples:
- "Show me recent commits by [author]"
- "Find all files modified in the last PR"
- "Search for TODO comments in the codebase"

Issue/PR Examples:
- "List all open issues labeled 'bug'"
- "Create an issue: Fix TypeScript errors in server/routes.ts"
- "Update PR #42 title to 'feat: Add dark mode toggle'"
- "Show me failed CI runs for the last 5 commits"

Actions Examples:
- "Check status of latest GitHub Actions workflow"
- "Show me build logs for the failed deployment"
- "List all workflows in this repository"
```

### Knowledge Persistence with Memory MCP

```
Storing Knowledge:
- "Remember that we use Drizzle ORM with Neon PostgreSQL"
- "Store this decision: We're using Gemini for chat and Perplexity for search"
- "Note that the N+1 query in habits endpoint was fixed on 2025-01-11"

Retrieving Knowledge:
- "What do you remember about our database setup?"
- "Recall previous decisions about AI integrations"
- "What fixes have been applied to performance issues?"

Organizing Knowledge:
- "Create a knowledge graph node for 'Authentication System'"
- "Link the 'Rate Limiting' entity to 'Security Improvements'"
```

---

## Advanced Configuration

### Custom Memory Storage Location

```json
{
  "memory": {
    "env": {
      "MEMORY_FILE_PATH": "/custom/path/project-memory.jsonl"
    }
  }
}
```

### Debug Logging

Enable detailed MCP logs:

```json
{
  "logging": {
    "level": "debug",
    "file": ".cursor/logs/mcp-debug.log"
  }
}
```

View logs:
```bash
tail -f .cursor/logs/mcp-debug.log
```

### Connection Timeout

Increase timeout for slow networks:

```json
{
  "neon": {
    "timeout": 30000  // 30 seconds
  }
}
```

---

## MCP Server Lifecycle

### Startup
1. Cursor loads `.cursor/mcp.json`
2. For each enabled MCP:
   - Executes `command` with `args`
   - Loads environment variables from `.env`
   - Establishes MCP connection
   - Registers available tools
3. MCPs are now available to Claude Code

### Runtime
- MCPs respond to Claude's tool calls
- Results are returned to Claude for processing
- Errors are logged and reported

### Shutdown
- When Cursor closes, MCPs are terminated
- Memory MCP persists knowledge to disk
- Other MCPs clean up connections

---

## Monitoring

### Check MCP Status

In Claude Code:
```
List all available MCP tools
```

### View MCP Logs

```bash
# On macOS/Linux
tail -f .cursor/logs/mcp.log

# On Windows (Git Bash)
tail -f .cursor/logs/mcp.log

# On Windows (PowerShell)
Get-Content .cursor/logs/mcp.log -Wait
```

### Performance Metrics

Monitor MCP operation latency:
- Neon queries: <2s for simple queries
- GitHub API calls: <1s for most operations
- Memory operations: <100ms

If slower, check network connection and API rate limits.

---

## Cost Considerations

### API Costs

| MCP Server | Cost | Rate Limits |
|------------|------|-------------|
| Neon | Free tier: 10 projects | Varies by plan |
| GitHub | Free: 5,000 req/hr | Per token |
| Memory | Free (local) | No limit |
| Vercel | Included in plan | Varies by plan |

### Recommendations

- **Development:** Use free tiers
- **Production:** Consider paid plans for higher limits
- **Monitoring:** Track API usage in respective dashboards

---

## Next Steps

1. ✅ **Verify all API keys** are configured in `.env`
2. ✅ **Restart Cursor** to load MCP servers
3. ✅ **Test each MCP** using examples above
4. ✅ **Enable optional MCPs** (Sequential Thinking, Vercel) as needed
5. ✅ **Review security settings** and rotate keys every 90 days

---

## Resources

### Official Documentation
- **MCP Specification:** https://modelcontextprotocol.io
- **Neon MCP:** https://github.com/neondatabase/mcp-server-neon
- **GitHub MCP:** https://github.com/github/github-mcp-server
- **Memory MCP:** https://github.com/modelcontextprotocol/servers

### Support
- **MCP Discord:** https://discord.gg/modelcontextprotocol
- **Cursor Discord:** https://discord.gg/cursor
- **Project Issues:** GitHub Issues in this repository

---

**Maintained by:** Nossa Maternidade Dev Team
**Last Updated:** 2025-01-12
**Version:** 1.0.0
