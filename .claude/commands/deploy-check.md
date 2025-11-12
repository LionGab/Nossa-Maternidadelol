# Deployment Checklist

Run comprehensive pre-deployment verification.

## Instructions

Execute these checks in order:

### 1. Code Quality
- ✅ Run TypeScript check: `npm run check`
- ✅ Run build: `npm run build`
- ✅ Verify no console.log/console.error (should use logger)

### 2. Security
- ✅ Verify SESSION_SECRET is at least 32 chars
- ✅ Check `.env` is not committed
- ✅ Run security audit: `npm audit --production`
- ✅ Verify rate limiting is enabled on sensitive routes
- ✅ Check all API routes use proper validation

### 3. Environment
- ✅ Verify all required env vars are documented in `.env.example`
- ✅ Check NODE_ENV is set to "production"
- ✅ Verify DATABASE_URL is configured for production database

### 4. Database
- ✅ Verify database schema is up to date
- ✅ Check for pending migrations
- ✅ Verify database backups are configured

### 5. Performance
- ✅ Check for N+1 query patterns
- ✅ Verify pagination is implemented on list endpoints
- ✅ Check bundle size: look for large dependencies

### 6. Monitoring & Logging
- ✅ Verify structured logging is in place (logger.ts)
- ✅ Check error handling on all routes
- ✅ Verify sensitive data is redacted from logs

### 7. Platform-Specific (Vercel/Railway)
- ✅ Verify `vercel.json` or railway config is present
- ✅ Check environment variables are set on platform
- ✅ Verify build command is correct
- ✅ Check Node.js version matches production

## Output Format

Show progress for each check with:
- ✅ Pass
- ⚠️ Warning (can deploy but should fix)
- ❌ Fail (must fix before deploy)

End with:
- **READY TO DEPLOY** if all critical checks pass
- **NOT READY - X issues must be fixed** if critical issues found

Include a summary of all warnings and failures with file references.
