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

## Blogger API verification

The authenticated Blogger account has been successfully verified with the Google Blogger API v3 API Explorer.

For the `Users.get` method, use:

```text
userId: self
```

A successful request returns HTTP `200` and the signed-in Blogger user profile.

To discover the numeric Blog ID for **https://officialdjkat.blogspot.com**, use the Blogger API v3 `Blogs.listByUser` method with:

```text
userId: self
```

Then find the returned blog whose `url` is:

```text
https://officialdjkat.blogspot.com/
```

Copy that blog's `id` value into the Vercel `BLOGGER_BLOG_ID` environment variable.

## Google Cloud setup

1. Enable **Blogger API v3** in the Google Cloud project.
2. Configure the Google OAuth consent screen.
3. Create an **OAuth 2.0 Client ID** with application type **Web application**.
4. Authorize the Blogger scope:

   `https://www.googleapis.com/auth/blogger`

5. Store credentials only as Vercel Environment Variables. Never commit real credentials to GitHub.

## Required Vercel environment variables

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_REFRESH_TOKEN=
BLOGGER_BLOG_ID=
MCP_ACCESS_TOKEN=
```

`MCP_ACCESS_TOKEN` protects the MCP endpoint. MCP clients should send it as `Authorization: Bearer <token>`.

## Pipedream / Runnable integration

If Blogger is connected through a Pipedream Runnable integration, Google OAuth must use the exact redirect URI supplied by that Pipedream connection. The redirect URI must be registered on the same Google OAuth Client ID whose client ID and client secret are entered in Pipedream.

## Routes

- `/api/mcp` — remote MCP endpoint
- `/api/health` — configuration health check
- `/api/auth/google/start` — optional Google authorization launcher
- `/api/auth/google/callback` — Google OAuth callback

## Safety

Creating a post defaults to a draft. Publishing is a separate MCP tool so content is not accidentally published.
