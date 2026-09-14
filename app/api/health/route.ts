export async function GET() {
  return Response.json({
    ok: true,
    service: "officialdjkat-blogger-mcp",
    googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    refreshTokenConfigured: Boolean(process.env.GOOGLE_REFRESH_TOKEN),
    blogConfigured: Boolean(process.env.BLOGGER_BLOG_ID),
    protected: Boolean(process.env.MCP_ACCESS_TOKEN),
  });
}
