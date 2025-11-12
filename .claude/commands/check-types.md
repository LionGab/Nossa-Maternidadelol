# Check TypeScript Types

Run TypeScript type checking and report all type errors in the codebase.

## Instructions

1. Execute `npm run check` to run TypeScript compiler in check mode
2. Parse and categorize errors by severity and file
3. For each error:
   - Show the file path and line number
   - Display the error message
   - Suggest a fix if possible
4. Summarize total errors found
5. If no errors, confirm codebase is type-safe

## Priority

Focus on errors in:
- `server/` - Backend routes and logic
- `shared/schema.ts` - Type definitions
- `client/src/` - Frontend components

Report results in a clear, actionable format.
