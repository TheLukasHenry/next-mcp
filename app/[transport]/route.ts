import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { NextRequest } from "next/server";
import { db } from "../../lib/db";
import { redis } from "../../lib/redis";
import { neon } from "@neondatabase/serverless";
// import { messages } from "../../lib/db/schema";

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

    // server.tool(
    //   "db_write",
    //   "Write a message to the database",
    //   {
    //     message: z.string(),
    //   },
    //   async ({ message }) => {
    //     await db.insert(messages).values({ text: message });
    //     return {
    //       content: [
    //         { type: "text", text: `Message "${message}" written to DB.` },
    //       ],
    //     };
    //   }
    // );

    // server.tool(
    //   "db_read_all",
    //   "Read all messages from the database",
    //   {},
    //   async () => {
    //     const allMessages = await db.select().from(messages);
    //     return {
    //       content: [
    //         {
    //           type: "text",
    //           text:
    //             "Messages: \n" +
    //             allMessages
    //               .map((m: typeof messages.$inferSelect) => ` - ${m.text}`)
    //               .join("\n"),
    //         },
    //       ],
    //     };
    //   }
    // );

    server.tool(
      "redis_set",
      "Set a key-value pair in Redis",
      {
        key: z.string(),
        value: z.string(),
      },
      async ({ key, value }) => {
        await redis.set(key, value);
        return {
          content: [
            { type: "text", text: `Set ${key} to "${value}" in Redis.` },
          ],
        };
      }
    );

    server.tool(
      "redis_get",
      "Get a value from Redis by key",
      {
        key: z.string(),
      },
      async ({ key }) => {
        const value = await redis.get(key);
        return {
          content: [{ type: "text", text: `Value for ${key}: ${value}` }],
        };
      }
    );

    server.tool(
      "show_hobbies",
      "List all hobbies from the database",
      {},
      async () => {
        const sql = neon(process.env.DATABASE_URL!);
        const hobbies = await sql`
          SELECT id, name, description, category, difficulty_level, is_active, created_at
          FROM hobbies
          ORDER BY name ASC
        `;

        const hobbyList = hobbies
          .map(
            (hobby) =>
              `${hobby.id}. ${hobby.name} (${hobby.category}) - ${
                hobby.difficulty_level
              } level${hobby.is_active ? "" : " [inactive]"}`
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Hobbies (${hobbies.length} total):\n${hobbyList}`,
            },
          ],
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
        db_write: {
          description: "Write a message to the database",
        },
        db_read_all: {
          description: "Read all messages from the database",
        },
        redis_set: {
          description: "Set a key-value pair in Redis",
        },
        redis_get: {
          description: "Get a value from Redis by key",
        },
        show_hobbies: {
          description: "List all hobbies from the database",
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
