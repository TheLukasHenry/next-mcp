import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const origin =
  process.argv[2] || process.env.MCP_PRODUCTION_URL || "http://localhost:3000";
const apiKey =
  process.argv[3] || process.env.MCP_API_KEY || "your-api-key-here";

async function main() {
  // Create transport with API key authentication
  const transport = new StreamableHTTPClientTransport(
    new URL(`${origin}/mcp`),
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-API-Key": apiKey,
      },
    }
  );

  const client = new Client(
    {
      name: "authenticated-test-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    }
  );

  console.log("Connecting to", origin, "with API key authentication");
  await client.connect(transport);

  console.log(
    "Connected! Server capabilities:",
    client.getServerCapabilities()
  );

  // List available tools
  const tools = await client.listTools();
  console.log("Available tools:", tools);

  // Test the echo tool
  if (tools.tools?.length > 0) {
    const result = await client.callTool("echo", {
      message: "Hello from authenticated client!",
    });
    console.log("Echo result:", result);
  }

  await client.close();
}

main().catch(console.error);
