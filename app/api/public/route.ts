export async function GET() {
  return Response.json({
    status: "ok",
    message: "Public endpoint working",
    mcp_endpoint: "/mcp",
    api_key_required:
      "Use Authorization: Bearer YOUR_API_KEY or X-API-Key: YOUR_API_KEY",
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return Response.json({
    status: "ok",
    message: "Public POST endpoint working",
    timestamp: new Date().toISOString(),
  });
}
