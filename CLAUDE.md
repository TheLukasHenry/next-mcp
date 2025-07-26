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

### Before starting work

- Always in pln mode to make a plan
- AFter get the plan, make sure you Write the plan to .claude/tasks/TASK_NAME.md.
- Always think MVP and find the latest docs
- Always think MVP, one you write the plan, firstly ask me to review it. Do not continue until I approve the plan

### While implementing

- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand ouver to other engineers.

### Testing MCP Server

- `node scripts/test-client.mjs` - Test local MCP server
- `node scripts/test-authenticated-client.mjs` - Test with authentication
- `MCP_PRODUCTION_URL=https://your-app.vercel.app node scripts/test-cursor-integration.mjs` - Test production deployment

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
