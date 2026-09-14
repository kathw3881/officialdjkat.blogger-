import { exchangeCode } from "../../../../../lib/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  if (error) {
    return new Response(
      `Google authorization failed: ${error}`,
      { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  if (!code) {
    return new Response(
      "Missing Google authorization code.",
      { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  try {
    const tokens = await exchangeCode(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return new Response(
        "Authorization succeeded, but Google did not return a refresh token. Revoke the app's access in your Google Account, then authorize again with prompt=consent.",
        { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } },
      );
    }

    return new Response(
      [
        "Blogger authorization succeeded.",
        "",
        "Copy the refresh token below into Vercel as GOOGLE_REFRESH_TOKEN, then remove it from this page/history after saving it securely:",
        "",
        refreshToken,
      ].join("\n"),
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OAuth error.";
    return new Response(
      `Google token exchange failed: ${message}`,
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }
}
