# Feature Development Template

## Feature Overview
- **Feature Name**: [Feature Name]
- **Description**: [Brief description of what this feature does]
- **Priority**: [High/Medium/Low]
- **Estimated Complexity**: [Simple/Medium/Complex]

## Requirements
- [ ] **Functional Requirements**:
  - [List specific functionality requirements]
  - [Include user stories if applicable]

- [ ] **Technical Requirements**:
  - [Database schema changes needed]
  - [API endpoints to create/modify]
  - [Frontend components if applicable]

## Implementation Plan

### Phase 1: Planning & Setup
- [ ] Review existing codebase for similar patterns
- [ ] Design database schema changes (if needed)
- [ ] Plan MCP tool structure and validation schemas
- [ ] Identify testing requirements

### Phase 2: Database Layer
- [ ] Update `lib/db/schema.ts` with new tables/fields
- [ ] Create and run database migrations
- [ ] Test database connectivity and operations

### Phase 3: MCP Tool Implementation
- [ ] Add new tool to `app/[transport]/route.ts`
- [ ] Implement Zod validation schemas
- [ ] Add proper error handling
- [ ] Test tool functionality locally

### Phase 4: Testing & Validation
- [ ] Update test scripts if needed
- [ ] Test all CRUD operations
- [ ] Verify authentication works correctly
- [ ] Run deployment readiness check

### Phase 5: Documentation & Cleanup
- [ ] Update CLAUDE.md if needed
- [ ] Document any new commands or workflows
- [ ] Run lint and build checks
- [ ] Create deployment notes

## Testing Checklist
- [ ] Local MCP server test passes
- [ ] Authentication test passes
- [ ] All existing functionality still works
- [ ] New feature works as expected
- [ ] Error handling works correctly

## Completion Criteria
- [ ] All requirements met
- [ ] Tests pass
- [ ] Code follows project patterns
- [ ] Documentation updated
- [ ] Ready for deployment

## Notes
[Add any additional notes, considerations, or decisions made during development]