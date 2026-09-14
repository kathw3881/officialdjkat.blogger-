# Official DJ Kat Blogger MCP

Remote MCP server for managing **https://officialdjkat.blogspot.com** with the Google Blogger API.

## MCP tools

- `blogger_get_blog`
- `blogger_list_posts`
- `blogger_get_post`
- `blogger_create_post` — drafts by default
- `blogger_update_post`
- `blogger_publish_post`
- `blogger_delete_post`

## Google Cloud setup

1. Enable **Blogger API v3** in the Google Cloud project.
2. Configure the Google OAuth consent screen.
3. Create an **OAuth 2.0 Client ID** with application type **Web application**.
4. Add this Authorized redirect URI exactly:

   `https://developers.google.com/oauthplayground`

5. In Google OAuth Playground, open Settings and enable **Use your own OAuth credentials**.
6. Enter the Google Client ID and Client Secret.
7. Authorize this scope:

   `https://www.googleapis.com/auth/blogger`

8. Exchange the authorization code and copy the **refresh token**.
9. Store credentials only as Vercel Environment Variables. Never commit real credentials to GitHub.

## Required Vercel environment variables

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=
BLOGGER_BLOG_ID=
MCP_ACCESS_TOKEN=
```

`MCP_ACCESS_TOKEN` protects the MCP endpoint. MCP clients should send it as `Authorization: Bearer <token>`.

## Routes

- `/api/mcp` — remote MCP endpoint
- `/api/health` — configuration health check
- `/api/auth/google/start` — optional Google authorization launcher when the redirect URI is configured

## Safety

Creating a post defaults to a draft. Publishing is a separate MCP tool so content is not accidentally published.
