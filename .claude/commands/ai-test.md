# Test AI Integrations

Test NathIA (Gemini) and Mãe Valente (Perplexity) AI integrations.

## Instructions

### 1. Pre-flight Checks
- Verify API keys are configured (GEMINI_API_KEY, PERPLEXITY_API_KEY)
- Check server is running
- Verify rate limiters are active

### 2. Test NathIA (Gemini Chat)
- Send test message: "Olá NathIA, como você pode me ajudar hoje?"
- Verify response:
  - Returns within reasonable time (< 5s)
  - Response is in Portuguese
  - Response is empathetic and supportive
  - Response references maternal wellness context
- Test conversation context:
  - Send follow-up message referencing previous response
  - Verify NathIA maintains context
- Test error handling:
  - Send very long message (> 10000 chars)
  - Verify rate limiting (send 10+ requests rapidly)
  - Check error messages are user-friendly

### 3. Test Mãe Valente (Perplexity Search)
- Send test query: "Como lidar com ansiedade pós-parto?"
- Verify response:
  - Returns within reasonable time (< 10s)
  - Response includes citations/sources
  - Content is relevant and evidence-based
  - Response is in Portuguese
- Test cache:
  - Send same query again
  - Verify response is served from cache (much faster)
  - Check cache key generation
- Test error handling:
  - Send empty query
  - Verify rate limiting (5 req/min)
  - Check error messages

### 4. Monitor API Usage
- Check server logs for API calls
- Verify proper logging format (structured JSON)
- Check for sensitive data in logs (should be redacted)
- Monitor response times

### 5. Cost Analysis
- Estimate API costs based on usage
- Suggest optimizations:
  - Increase cache TTL if appropriate
  - Implement request deduplication
  - Add user-friendly warnings for expensive operations

## Output Format

```
AI Integration Test Results:

NathIA (Gemini):
✅ Basic response - 2.3s
✅ Context retention - Working
✅ Rate limiting - 10 req/min enforced
⚠️ Long message handling - Truncates after 8000 chars

Mãe Valente (Perplexity):
✅ Search response - 4.1s
✅ Cache working - 50ms on cache hit
✅ Rate limiting - 5 req/min enforced
✅ Citations included - 3 sources

Cost Estimate (monthly):
- Gemini: ~$X (based on Y requests/day)
- Perplexity: ~$X (based on Y searches/day)

Recommendations:
- [List any optimization suggestions]
```
