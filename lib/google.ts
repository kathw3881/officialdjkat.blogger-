const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const BLOGGER_API = "https://www.googleapis.com/blogger/v3";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function googleClientId() {
  return required("GOOGLE_CLIENT_ID");
}

export function googleClientSecret() {
  return required("GOOGLE_CLIENT_SECRET");
}

export function bloggerBlogId() {
  return required("BLOGGER_BLOG_ID");
}

export function redirectUri() {
  const configured = process.env.GOOGLE_REDIRECT_URI;
  if (configured) return configured;
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!host) throw new Error("GOOGLE_REDIRECT_URI or VERCEL_URL is required.");
  return `https://${host}/api/auth/google/callback`;
}

export function authorizationUrl(state?: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", googleClientId());
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/blogger");
  if (state) url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCode(code: string) {
  const body = new URLSearchParams({
    code,
    client_id: googleClientId(),
    client_secret: googleClientSecret(),
    redirect_uri: redirectUri(),
    grant_type: "authorization_code",
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Google OAuth ${response.status}: ${JSON.stringify(data)}`);
  return data as { access_token: string; refresh_token?: string; expires_in?: number; token_type?: string };
}

export async function accessToken() {
  const refreshToken = required("GOOGLE_REFRESH_TOKEN");
  const body = new URLSearchParams({
    client_id: googleClientId(),
    client_secret: googleClientSecret(),
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(`Google token refresh failed: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

async function bloggerFetch(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${BLOGGER_API}${path}`, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  let data: unknown = text;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) throw new Error(`Blogger API ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  return data;
}

export function getBlog() {
  return bloggerFetch(`/blogs/${encodeURIComponent(bloggerBlogId())}`);
}

export function listPosts(maxResults = 10) {
  const query = new URLSearchParams({ maxResults: String(maxResults), status: "live" });
  return bloggerFetch(`/blogs/${encodeURIComponent(bloggerBlogId())}/posts?${query}`);
}

export function getPost(postId: string) {
  return bloggerFetch(`/blogs/${encodeURIComponent(bloggerBlogId())}/posts/${encodeURIComponent(postId)}`);
}

export function createPost(title: string, content: string, labels?: string[], isDraft = true) {
  const query = new URLSearchParams();
  if (isDraft) query.set("isDraft", "true");
  const suffix = query.toString() ? `?${query}` : "";
  return bloggerFetch(`/blogs/${encodeURIComponent(bloggerBlogId())}/posts/${suffix}`, {
    method: "POST",
    body: JSON.stringify({ title, content, ...(labels?.length ? { labels } : {}) }),
  });
}

export function updatePost(postId: string, title: string, content: string, labels?: string[]) {
  return bloggerFetch(`/blogs/${encodeURIComponent(bloggerBlogId())}/posts/${encodeURIComponent(postId)}`, {
    method: "PUT",
    body: JSON.stringify({ id: postId, title, content, ...(labels?.length ? { labels } : {}) }),
  });
}

export function deletePost(postId: string) {
  return bloggerFetch(`/blogs/${encodeURIComponent(bloggerBlogId())}/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
  });
}
