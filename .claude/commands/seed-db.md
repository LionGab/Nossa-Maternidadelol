# Seed Database

Populate database with test data for development.

## Instructions

1. Check if `server/demo-user.ts` exists and review its implementation
2. Verify database connection is working
3. Ask user which data to seed:
   - Users & profiles (demo users with different subscription tiers)
   - Posts & viral content (sample maternal wellness posts)
   - Habits & completions (pre-filled habit tracking data)
   - Community posts & comments (sample forum discussions)
   - Q&A cache (pre-cached Perplexity responses)
   - Achievements (unlock achievements for demo users)
   - ALL (full seed with realistic data)

4. Execute seeding based on user selection
5. Show progress for each table seeded
6. Report:
   - Number of records created per table
   - Any errors encountered
   - Sample user credentials for testing

## Important

- Check current NODE_ENV - warn if production
- Ask for confirmation before seeding production
- Preserve existing data or offer to clear first
- Create realistic data that demonstrates app features:
  - Users with different streak lengths
  - Posts with various engagement levels
  - Habits with completion patterns

## Sample Data Guidelines

- **Users**: At least 5 users with different names/avatars
- **Posts**: 20-50 posts with realistic maternal wellness content
- **Habits**: 5-10 common maternal habits per user
- **Community**: 30+ posts with comments and reactions
- **Achievements**: Full achievement ladder for testing gamification

Output credentials for test users so they can be used for manual testing.
