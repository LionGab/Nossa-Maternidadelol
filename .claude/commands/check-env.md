# Check Environment Variables

Validate all required environment variables are properly configured.

## Instructions

1. Read `.env.example` to get list of required variables
2. Check if `.env` file exists in project root
3. For each required variable:
   - Verify it's defined in `.env`
   - Check if value is non-empty
   - Validate format where applicable:
     - `DATABASE_URL` - Must be valid PostgreSQL connection string (starts with `postgresql://` or `postgres://`)
     - `SESSION_SECRET` - Must be at least 32 characters in production
     - `GEMINI_API_KEY` - Should start with expected prefix
     - `PERPLEXITY_API_KEY` - Should be non-empty
     - `NODE_ENV` - Must be `development` or `production`
     - `PORT` - Must be valid number (1024-65535)

4. Check for common issues:
   - Trailing whitespace in values
   - Missing quotes around values with spaces
   - Commented out required variables

5. Verify `.env` is in `.gitignore` (security check)

## Output Format

```
Environment Check Results:
✅ DATABASE_URL - Configured (PostgreSQL)
✅ GEMINI_API_KEY - Configured
✅ PERPLEXITY_API_KEY - Configured
✅ SESSION_SECRET - Configured (48 chars)
✅ NODE_ENV - development
✅ PORT - 5000

❌ Issues Found:
- SESSION_SECRET too short for production (current: 16 chars, required: 32 chars)

Security:
✅ .env is in .gitignore
```

If all checks pass, confirm environment is properly configured.
