# Example Next.js MCP Server

**Uses `@vercel/mcp-adapter`**

## Usage

This sample app uses the [Vercel MCP Adapter](https://www.npmjs.com/package/@vercel/mcp-adapter) that allows you to drop in an MCP server on a group of routes in any Next.js project.

Update `app/[transport]/route.ts` with your tools, prompts, and resources following the [MCP TypeScript SDK documentation](https://github.com/modelcontextprotocol/typescript-sdk/tree/main?tab=readme-ov-file#server).

## Notes for running on Vercel

- To use the SSE transport, requires a Redis attached to the project under `process.env.REDIS_URL`
- Make sure you have [Fluid compute](https://vercel.com/docs/functions/fluid-compute) enabled for efficient execution
- After enabling Fluid compute, open `app/route.ts` and adjust `maxDuration` to 800 if you using a Vercel Pro or Enterprise account
- [Deploy the Next.js MCP template](https://vercel.com/templates/next.js/model-context-protocol-mcp-with-next-js)

## Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Required for production
DATABASE_URL=your-neon-postgres-url
REDIS_URL=your-upstash-redis-url
MCP_API_KEY=your-secure-api-key

# For testing scripts
MCP_PRODUCTION_URL=https://your-vercel-app.vercel.app
```

## Security

- **API Key Authentication**: Production endpoints require `MCP_API_KEY`
- **Environment Variables**: Never commit `.env*` files to version control
- **Cursor Configuration**: Use `cursor-mcp-config.template.json` as a template

## Sample Clients

Test your MCP server with the included scripts:

```sh
# Test locally
node scripts/test-client.mjs

# Test with authentication
node scripts/test-authenticated-client.mjs

# Test production deployment
MCP_PRODUCTION_URL=https://your-app.vercel.app MCP_API_KEY=your-key node scripts/test-cursor-integration.mjs
```
