# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

### Database

- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Apply database migrations

### Testing MCP Server

- `node scripts/test-client.mjs` - Test local MCP server
- `node scripts/test-authenticated-client.mjs` - Test with authentication
- `MCP_PRODUCTION_URL=https://your-app.vercel.app node scripts/test-cursor-integration.mjs` - Test production deployment

## Technology Stack & Documentation

### Core Technologies
- **Next.js 15.2.4**: [Latest Docs](https://nextjs.org/docs) - React framework for web applications
- **Model Context Protocol**: [MCP Docs](https://modelcontextprotocol.io/docs) - Protocol for AI-application integration
- **Vercel MCP Adapter**: [Package Docs](https://www.npmjs.com/package/@vercel/mcp-adapter) - Vercel deployment adapter for MCP
- **TypeScript 5**: [TS Docs](https://www.typescriptlang.org/docs/) - Type-safe JavaScript

### Database & Storage
- **PostgreSQL**: [Neon Docs](https://neon.tech/docs) - Serverless PostgreSQL database
- **Drizzle ORM**: [Drizzle Docs](https://orm.drizzle.team/docs/overview) - TypeScript ORM
- **Redis**: [Redis Docs](https://redis.io/docs/) - In-memory data store for caching and SSE

### Validation & Utilities
- **Zod**: [Zod Docs](https://zod.dev/) - TypeScript-first schema validation

### Deployment
- **Vercel**: [Vercel Docs](https://vercel.com/docs) - Serverless deployment platform

### Integrations
- **Todoist**: [Todoist API Docs](https://developer.todoist.com/rest/v2/) - Task management integration

## Workflow Instructions

### Before Starting Work
- Always use plan mode first to create a structured approach
- Write plans to `.claude/tasks/TASK_NAME.md` for future reference
- Think MVP - focus on minimal viable implementation  
- Ask for plan review before proceeding with implementation

### During Implementation
- Update task plans as work progresses
- Document detailed changes made for handover to other engineers
- Run `npm run lint` after code changes
- Test MCP server functionality with provided scripts

### MCP Development Patterns
- All tools defined in `app/[transport]/route.ts` using `createMcpHandler`
- Use Zod schemas for input validation on all tools
- Implement proper error handling with try/catch blocks
- Return MCP-formatted responses with content arrays
- Test both authenticated and unauthenticated endpoints

## Custom Slash Commands

The project includes custom slash commands in `.claude/commands/`:

- `/test-mcp` - Run comprehensive MCP server tests
- `/deploy-check` - Validate deployment readiness  
- `/db-status` - Check database connectivity and health
- `/hobby-demo` - Demonstrate hobby management functionality
- `/todoist-today` - Get today's tasks from Todoist integration

## Task Templates

Structured templates are available in `.claude/tasks/`:

- `feature-development-template.md` - Complete feature development workflow
- `bug-fix-template.md` - Systematic bug investigation and resolution
- `deployment-checklist.md` - Comprehensive deployment validation
- `testing-workflow.md` - Complete testing procedures and benchmarks

## Architecture

This is a Next.js MCP (Model Context Protocol) server using the Vercel MCP Adapter. The core architecture consists of:

### MCP Server (`app/[transport]/route.ts`)

- Single handler file that defines all MCP tools using `createMcpHandler` from `@vercel/mcp-adapter`
- Implements API key authentication wrapper for production environments
- Supports multiple transport protocols (HTTP, SSE) via dynamic routing
- Tools include: echo, Redis operations, and hobby management (CRUD operations on PostgreSQL)
- Uses Zod for input validation on all tools

### Database Layer

- **PostgreSQL**: Primary database using Neon in production, managed via Drizzle ORM
- **Redis**: Used for SSE transport and caching, with connection management in `lib/redis.ts`
- **Schema**: Minimal schema definition in `lib/db/schema.ts` (currently contains only pgTable imports)
- **Raw SQL**: Uses `@neondatabase/serverless` for direct SQL queries rather than Drizzle for tool operations

### Environment Configuration

- Requires `DATABASE_URL`, `REDIS_URL`, and `MCP_API_KEY` for production
- Development mode bypasses API key validation
- Vercel-specific configuration in `vercel.json` sets `maxDuration: 60` and CORS headers

### Key Design Patterns

- Connection pooling for PostgreSQL via `pg.Pool`
- Redis connection management with automatic reconnection
- Authentication middleware that wraps the MCP handler
- Direct SQL queries using template literals for database operations
- Error handling with try/catch blocks returning formatted MCP responses

The project implements a hobby management system as the primary use case, with tools for creating, listing, and deleting hobbies stored in PostgreSQL.

### Todoist Integration

The server includes a Todoist integration that provides:
- **get_todays_tasks**: Retrieves today's tasks from your Todoist account
- Requires `TODOIST_API_TOKEN` environment variable
- Returns formatted task list with priorities, projects, and due times
- Handles authentication errors and empty task lists gracefully
