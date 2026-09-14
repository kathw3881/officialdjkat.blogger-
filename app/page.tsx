export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 760, margin: "48px auto", padding: 24 }}>
      <h1>Official DJ Kat Blogger MCP</h1>
      <p>Remote MCP service for managing https://officialdjkat.blogspot.com through the Google Blogger API.</p>
      <p>MCP endpoint: <code>/api/mcp</code></p>
      <p>Health check: <code>/api/health</code></p>
    </main>
  );
}
