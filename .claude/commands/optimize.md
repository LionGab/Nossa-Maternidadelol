# Optimize Performance

Analyze codebase for performance issues and optimization opportunities.

## Instructions

### 1. Database Query Analysis
- Scan `server/routes.ts` and `server/storage.ts` for query patterns
- Identify N+1 query problems:
  - Look for loops that call database queries
  - Check if relations are loaded efficiently
  - Suggest batch loading patterns
- Check for missing indexes (if using Drizzle queries)

### 2. API Response Size
- Check endpoints that return large datasets
- Verify pagination is implemented
- Suggest response compression if needed
- Check for unnecessary data in responses (e.g., sending entire objects when only IDs needed)

### 3. Frontend Bundle Analysis
- Check `client/src/` for large imports
- Identify unused imports
- Suggest code splitting opportunities
- Look for large libraries that could be replaced

### 4. Caching Opportunities
- Identify frequently-accessed, rarely-changing data
- Check if Q&A cache is being used effectively
- Suggest Redis cache for habits/stats if not implemented
- Review cache invalidation strategies

### 5. Rate Limiting & Throttling
- Verify expensive operations have rate limits
- Check AI API calls are properly limited
- Suggest request coalescing for duplicate requests

### 6. Memory Leaks
- Check for event listeners not being cleaned up
- Look for growing arrays/maps (especially in `MemStorage`)
- Verify WebSocket connections are properly closed (if any)

## Output Format

For each category:
1. **Current State** - What's already optimized
2. **Issues Found** - Specific problems with file:line references
3. **Recommendations** - Concrete optimization suggestions with code examples
4. **Expected Impact** - Estimate improvement (e.g., "50% faster", "90% smaller payload")

Prioritize by impact vs effort (quick wins first).
