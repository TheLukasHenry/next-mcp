import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const PRODUCTION_URL =
  process.env.MCP_PRODUCTION_URL || "http://localhost:3000";
const API_KEY = process.env.MCP_API_KEY || "your-api-key-here";

async function testHealthEndpoint() {
  console.log("🏥 Testing health endpoint...");
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/public`);
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Health endpoint working:", data);
      return true;
    } else {
      console.log(
        "❌ Health endpoint failed:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.log("❌ Health endpoint error:", error.message);
    return false;
  }
}

async function testMCPConnection() {
  console.log("🔌 Testing MCP connection...");
  try {
    const transport = new StreamableHTTPClientTransport(
      new URL(`${PRODUCTION_URL}/mcp`),
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
      }
    );

    const client = new Client(
      {
        name: "cursor-integration-test",
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

    await client.connect(transport);
    console.log("✅ MCP connection successful!");

    // Test server capabilities
    const capabilities = client.getServerCapabilities();
    console.log(
      "📋 Server capabilities:",
      JSON.stringify(capabilities, null, 2)
    );

    // List available tools
    const tools = await client.listTools();
    console.log("🛠️  Available tools:", tools);

    // Test echo tool
    if (tools.tools?.length > 0) {
      const echoResult = await client.callTool("echo", {
        message: "Hello from Cursor integration test!",
      });
      console.log("🔊 Echo tool result:", echoResult);
    }

    await client.close();
    return true;
  } catch (error) {
    console.log("❌ MCP connection failed:", error.message);
    return false;
  }
}

async function testWithoutAuth() {
  console.log("🔒 Testing without authentication (should fail)...");
  try {
    const transport = new StreamableHTTPClientTransport(
      new URL(`${PRODUCTION_URL}/mcp`)
    );

    const client = new Client(
      {
        name: "no-auth-test",
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

    await client.connect(transport);
    console.log(
      "❌ Connection without auth succeeded (this should not happen!)"
    );
    await client.close();
    return false;
  } catch (error) {
    console.log("✅ Connection without auth properly rejected:", error.message);
    return true;
  }
}

async function main() {
  console.log("🧪 Testing MCP Server for Cursor Integration");
  console.log("=".repeat(50));

  const healthOk = await testHealthEndpoint();
  console.log("");

  if (!healthOk) {
    console.log(
      "⚠️  Health check failed - Vercel Authentication might still be enabled"
    );
    console.log(
      "Please disable 'Vercel Authentication' in your dashboard and try again."
    );
    return;
  }

  const mcpOk = await testMCPConnection();
  console.log("");

  const authOk = await testWithoutAuth();
  console.log("");

  if (healthOk && mcpOk && authOk) {
    console.log("🎉 ALL TESTS PASSED!");
    console.log("✅ Your MCP server is ready for Cursor integration!");
    console.log("");
    console.log("📋 Configuration for Cursor:");
    console.log("URL:", `${PRODUCTION_URL}/mcp`);
    console.log("API Key:", API_KEY);
    console.log("");
    console.log(
      "💡 Add this server to Cursor using the configuration in cursor-mcp-config.json"
    );
  } else {
    console.log("❌ Some tests failed. Please check the issues above.");
  }
}

main().catch(console.error);
