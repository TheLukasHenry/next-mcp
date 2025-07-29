# Database Status Check

Check the status and connectivity of PostgreSQL and Redis databases.

## Database Health Check:

1. **PostgreSQL Connection**:
   - Test connection to Neon database
   - Verify `DATABASE_URL` environment variable
   - Check hobby table existence and structure

2. **Redis Connection**:
   - Test Redis connectivity
   - Verify `REDIS_URL` environment variable
   - Test basic set/get operations

3. **Database Schema**:
   - Review current schema in `lib/db/schema.ts`
   - Check for pending migrations with `!npm run db:generate`

4. **Test Database Operations**:
   Use the MCP server to test database functionality:
   - Create a test hobby
   - List all hobbies
   - Delete the test hobby

## Expected Results:
- Both databases should connect successfully
- All CRUD operations should work without errors
- Schema should be up to date

Report any connection issues or operational failures.