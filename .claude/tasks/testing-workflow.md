# MCP Server Testing Workflow

## Overview
Comprehensive testing workflow for the Next.js MCP server to ensure reliability and functionality.

## Testing Levels

### 1. Local Development Testing
Run during development to catch issues early:

```bash
# Build check
npm run build

# Lint check  
npm run lint

# Basic MCP server test
node scripts/test-client.mjs
```

### 2. Integration Testing
Test MCP server with authentication and full functionality:

```bash
# Test with authentication
node scripts/test-authenticated-client.mjs

# Test all MCP tools
node scripts/test-streamable-http-client.mjs
```

### 3. Production Testing
Test deployed production environment:

```bash
# Set production URL and test
export MCP_PRODUCTION_URL=https://your-app.vercel.app
export MCP_API_KEY=your-production-key
node scripts/test-cursor-integration.mjs
```

## MCP Tool Testing Matrix

### Core Tools
- [ ] **echo**: Basic functionality test
  - Input: Simple string message
  - Expected: Same message returned with "Tool echo:" prefix

- [ ] **redis_set**: Redis write operation
  - Input: key and value strings  
  - Expected: Confirmation message
  - Verify: Can retrieve with redis_get

- [ ] **redis_get**: Redis read operation
  - Input: existing key
  - Expected: Correct value returned
  - Test: Non-existent key (should return null)

### Hobby Management Tools
- [ ] **show_hobbies**: List all hobbies
  - Expected: Formatted list with ID, name, category, difficulty
  - Check: Proper sorting (by name ASC)
  - Verify: Count matches actual entries

- [ ] **create_hobby**: Add new hobby
  - Test required fields: name, description, category, difficulty_level
  - Test optional field: is_active (defaults to true)
  - Verify: Hobby appears in show_hobbies list
  - Test: Duplicate names (should be allowed)

- [ ] **delete_hobby**: Remove hobby by name
  - Test: Existing hobby (should confirm deletion)
  - Test: Non-existent hobby (should report "not found")
  - Verify: Hobby no longer appears in list

## Error Handling Tests

### Authentication Errors
- [ ] Missing API key in production
- [ ] Invalid API key format
- [ ] Expired or incorrect API key

### Database Errors  
- [ ] Database connection failure
- [ ] Invalid SQL queries
- [ ] Missing required fields
- [ ] Database timeout scenarios

### Redis Errors
- [ ] Redis connection failure
- [ ] Invalid key formats
- [ ] Redis timeout scenarios

### Input Validation Errors
- [ ] Missing required parameters
- [ ] Invalid parameter types
- [ ] Malformed input data
- [ ] SQL injection attempts

## Performance Testing

### Response Time Benchmarks
- [ ] Echo tool: < 100ms
- [ ] Redis operations: < 200ms  
- [ ] Database queries: < 500ms
- [ ] Complex hobby operations: < 1000ms

### Concurrent Request Testing
- [ ] Multiple simultaneous requests
- [ ] Database connection pooling under load
- [ ] Redis connection handling under load

## Automated Testing Scripts

### Daily Health Check
```bash
#!/bin/bash
echo "Running daily MCP server health check..."
npm run lint && \
npm run build && \
node scripts/test-client.mjs && \
node scripts/test-authenticated-client.mjs
echo "Health check complete"
```

### Pre-deployment Validation
```bash
#!/bin/bash
echo "Running pre-deployment validation..."
npm run db:generate && \
npm run db:migrate && \
npm run build && \
node scripts/test-client.mjs && \
node scripts/test-authenticated-client.mjs
if [ $? -eq 0 ]; then
  echo "✅ Ready for deployment"
else
  echo "❌ Deployment validation failed"
  exit 1
fi
```

## Test Data Management

### Test Hobbies Dataset
Use consistent test data for reliable testing:

```json
[
  {
    "name": "Test Guitar",
    "description": "Learning acoustic guitar for testing",
    "category": "Music",
    "difficulty_level": "Beginner",
    "is_active": true
  },
  {
    "name": "Test Cooking", 
    "description": "Cooking Italian cuisine for testing",
    "category": "Culinary",
    "difficulty_level": "Intermediate", 
    "is_active": true
  }
]
```

### Cleanup Procedures
- [ ] Remove test hobbies after testing
- [ ] Clear test Redis keys
- [ ] Reset any modified state

## Test Result Documentation

### Success Criteria
- All MCP tools respond correctly
- Authentication works as expected  
- Database operations complete successfully
- Error handling works properly
- Performance meets benchmarks

### Failure Reporting
Document any failures with:
- Tool/function that failed
- Input parameters used
- Expected vs actual results
- Error messages received
- Environment details (local/production)

## Continuous Testing Integration

### Git Hooks (Optional)
Consider adding pre-commit hooks:
```bash
# pre-commit hook
npm run lint && npm run build
```

### CI/CD Integration
For future CI/CD pipeline:
- Run linting and build on every commit
- Execute MCP server tests on pull requests
- Validate production deployment with integration tests

## Troubleshooting Common Issues

### Connection Failures
- Check environment variables are set
- Verify database/Redis URLs are accessible
- Test network connectivity

### Authentication Issues  
- Verify MCP_API_KEY is correctly set
- Check API key format and validity
- Ensure production vs development mode is correct

### Performance Issues
- Monitor database query execution times
- Check Redis connection pool utilization
- Review Vercel function timeout settings