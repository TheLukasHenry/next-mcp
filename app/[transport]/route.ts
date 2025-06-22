import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { NextRequest } from "next/server";

// API Key validation function
function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("x-api-key");
  const url = new URL(request.url);
  const urlApiKey = url.searchParams.get("key");

  const apiKey =
    authHeader?.replace("Bearer ", "") || apiKeyHeader || urlApiKey;

  const validApiKey = process.env.MCP_API_KEY;

  // If no API key is configured, allow access (for development)
  if (!validApiKey) {
    return true;
  }

  return apiKey === validApiKey;
}

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "echo",
      "Echo a message back to the user",
      {
        message: z.string(),
      },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      })
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
  }
);

// Wrap the handler with authentication
async function authenticatedHandler(request: NextRequest) {
  // Check API key for production
  if (process.env.NODE_ENV === "production" && !validateApiKey(request)) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message:
          "Valid API key required. Include in Authorization header as 'Bearer YOUR_KEY' or X-API-Key header.",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Call the original handler
  return handler(request);
}

export {
  authenticatedHandler as GET,
  authenticatedHandler as POST,
  authenticatedHandler as DELETE,
};
