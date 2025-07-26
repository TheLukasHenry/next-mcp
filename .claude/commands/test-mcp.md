# Test MCP Server

Run comprehensive MCP server tests to validate functionality.

## Steps:

1. **Test Local Server**:
   ```bash
   !node scripts/test-client.mjs
   ```

2. **Test Authentication**:
   ```bash
   !node scripts/test-authenticated-client.mjs
   ```

3. **Test All Available Tools**:
   - Echo functionality
   - Redis set/get operations
   - Hobby management (create, list, delete)

4. **Validate Responses**:
   - Check proper MCP response format
   - Verify error handling
   - Confirm authentication requirements

Report any failures or unexpected behavior found during testing.