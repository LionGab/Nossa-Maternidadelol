# Review Security

Perform a comprehensive security review of the codebase.

## Instructions

1. **Authentication & Authorization**
   - Check all routes using `requireAuth` middleware
   - Verify session configuration (secure cookies in production)
   - Review password hashing implementation (`server/auth.ts`)
   - Check for authentication bypass vulnerabilities

2. **Input Validation**
   - Verify all user inputs are validated with Zod schemas
   - Check for SQL injection vulnerabilities
   - Check for XSS vulnerabilities in user-generated content
   - Review file upload validation (if any)

3. **Rate Limiting**
   - Verify rate limiters are applied to sensitive endpoints
   - Check AI endpoints (Gemini, Perplexity) for rate limits
   - Review auth endpoints for brute force protection

4. **Environment & Secrets**
   - Verify `.env` is in `.gitignore`
   - Check for hardcoded secrets in code
   - Verify SESSION_SECRET validation in production

5. **CORS & Headers**
   - Review CORS configuration
   - Check security headers (helmet.js if used)

6. **Dependencies**
   - Check for known vulnerabilities: `npm audit`
   - Review critical dependencies

## Output Format

For each category, report:
- ✅ Secure - What's properly protected
- ⚠️ Warning - Potential issues to review
- ❌ Vulnerable - Critical issues to fix immediately

Prioritize findings by severity.
