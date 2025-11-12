# Test API Endpoints

Test critical API endpoints to ensure they're working correctly.

## Instructions

1. Start the dev server if not already running: `npm run dev`
2. Test these critical endpoints (use curl or fetch):
   - `POST /api/login` - Test authentication
   - `GET /api/user` - Test session retrieval
   - `GET /api/habits` - Test habits with date range
   - `POST /api/ai/chat` - Test NathIA chat (include rate limit check)
   - `POST /api/ai/search` - Test Mãe Valente search (include rate limit check)
   - `GET /api/community/posts?page=1&limit=20` - Test pagination
3. For each endpoint:
   - Show request method and path
   - Display response status code
   - Show response time
   - Verify response structure matches expected schema
   - Check for proper error handling
4. Report any failures or anomalies
5. Summarize: X/Y endpoints passing

## Important

- Check if environment variables are loaded (DATABASE_URL, GEMINI_API_KEY, PERPLEXITY_API_KEY)
- Test with valid authentication (create test user if needed)
- Verify rate limiting is working correctly
