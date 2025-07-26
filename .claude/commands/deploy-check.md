# Deployment Readiness Check

Validate that the MCP server is ready for production deployment.

## Pre-deployment Checklist:

1. **Environment Variables**:
   - Verify `DATABASE_URL` is configured
   - Verify `REDIS_URL` is configured  
   - Verify `MCP_API_KEY` is set for production

2. **Build Process**:
   ```bash
   !npm run build
   ```

3. **Lint Check**:
   ```bash
   !npm run lint
   ```

4. **Database Migrations**:
   ```bash
   !npm run db:generate
   !npm run db:migrate
   ```

5. **Production Test** (if MCP_PRODUCTION_URL is set):
   ```bash
   !MCP_PRODUCTION_URL=$MCP_PRODUCTION_URL node scripts/test-cursor-integration.mjs
   ```

6. **Vercel Configuration**:
   - Check `vercel.json` maxDuration setting
   - Verify CORS headers configuration

Report deployment readiness status and any issues found.