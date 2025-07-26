import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { NextRequest } from "next/server";
import { db } from "../../lib/db";
import { redis } from "../../lib/redis";
import { neon } from "@neondatabase/serverless";
import { todoist } from "../../lib/todoist";
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
        try {
          await redis.set(key, value);
          return {
            content: [
              { type: "text", text: `Set ${key} to "${value}" in Redis.` },
            ],
          };
        } catch (error) {
          return {
            content: [
              { type: "text", text: `Error setting Redis key: ${error}` },
            ],
          };
        }
      }
    );

    server.tool(
      "redis_get",
      "Get a value from Redis by key",
      {
        key: z.string(),
      },
      async ({ key }) => {
        try {
          const value = await redis.get(key);
          return {
            content: [{ type: "text", text: `Value for ${key}: ${value}` }],
          };
        } catch (error) {
          return {
            content: [
              { type: "text", text: `Error getting Redis key: ${error}` },
            ],
          };
        }
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

    server.tool(
      "create_hobby",
      "Create a new hobby in the database",
      {
        name: z.string(),
        description: z.string(),
        category: z.string(),
        difficulty_level: z.string(),
        is_active: z.boolean().optional().default(true),
      },
      async ({ name, description, category, difficulty_level, is_active }) => {
        const sql = neon(process.env.DATABASE_URL!);
        await sql`
          INSERT INTO hobbies (name, description, category, difficulty_level, is_active)
          VALUES (${name}, ${description}, ${category}, ${difficulty_level}, ${is_active})
        `;
        return {
          content: [
            {
              type: "text",
              text: `Hobby "${name}" has been created successfully.`,
            },
          ],
        };
      }
    );

    server.tool(
      "delete_hobby",
      "Delete a hobby by name from the database",
      {
        name: z.string(),
      },
      async ({ name }) => {
        const sql = neon(process.env.DATABASE_URL!);
        const result = await sql`
          DELETE FROM hobbies WHERE name = ${name} RETURNING id
        `;

        if (result.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: `Hobby "${name}" has been deleted successfully.`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Hobby "${name}" not found.`,
              },
            ],
          };
        }
      }
    );

    server.tool(
      "get_todays_tasks",
      "Get today's tasks from Todoist",
      {},
      async () => {
        try {
          const tasks = await todoist.getTodaysTasks();
          const projects = await todoist.getProjects();
          const formattedTasks = todoist.formatTasksForDisplay(tasks, projects);
          
          return {
            content: [
              {
                type: "text",
                text: formattedTasks,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching today's tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
          };
        }
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
        create_hobby: {
          description: "Create a new hobby in the database",
        },
        delete_hobby: {
          description: "Delete a hobby by name",
        },
        get_todays_tasks: {
          description: "Get today's tasks from Todoist",
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
