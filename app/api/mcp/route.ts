import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  createPost,
  deletePost,
  getBlog,
  getPost,
  listPosts,
  publishPost,
  updatePost,
} from "../../../lib/google";

const handler = createMcpHandler((server) => {
  server.registerTool(
    "blogger_get_blog",
    {
      title: "Get Blogger Blog",
      description: "Get metadata for the configured Blogger blog.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(await getBlog(), null, 2) }],
    }),
  );

  server.registerTool(
    "blogger_list_posts",
    {
      title: "List Blogger Posts",
      description: "List recent live posts from the configured Blogger blog.",
      inputSchema: z.object({
        max_results: z.number().int().min(1).max(50).optional().default(10),
      }),
    },
    async ({ max_results }) => ({
      content: [{ type: "text", text: JSON.stringify(await listPosts(max_results), null, 2) }],
    }),
  );

  server.registerTool(
    "blogger_get_post",
    {
      title: "Get Blogger Post",
      description: "Get one Blogger post by post ID.",
      inputSchema: z.object({
        post_id: z.string().min(1),
      }),
    },
    async ({ post_id }) => ({
      content: [{ type: "text", text: JSON.stringify(await getPost(post_id), null, 2) }],
    }),
  );

  server.registerTool(
    "blogger_create_post",
    {
      title: "Create Blogger Post",
      description: "Create a Blogger post. Defaults to draft so it is not published accidentally.",
      inputSchema: z.object({
        title: z.string().min(1),
        content: z.string().min(1).describe("Post body. Blogger accepts HTML."),
        labels: z.array(z.string()).optional(),
        draft: z.boolean().optional().default(true),
      }),
    },
    async ({ title, content, labels, draft }) => ({
      content: [{ type: "text", text: JSON.stringify(await createPost(title, content, labels, draft), null, 2) }],
    }),
  );

  server.registerTool(
    "blogger_update_post",
    {
      title: "Update Blogger Post",
      description: "Replace the title and body of an existing Blogger post.",
      inputSchema: z.object({
        post_id: z.string().min(1),
        title: z.string().min(1),
        content: z.string().min(1),
        labels: z.array(z.string()).optional(),
      }),
    },
    async ({ post_id, title, content, labels }) => ({
      content: [{ type: "text", text: JSON.stringify(await updatePost(post_id, title, content, labels), null, 2) }],
    }),
  );

  server.registerTool(
    "blogger_publish_post",
    {
      title: "Publish Blogger Post",
      description: "Publish an existing Blogger draft by post ID.",
      inputSchema: z.object({
        post_id: z.string().min(1),
      }),
    },
    async ({ post_id }) => ({
      content: [{ type: "text", text: JSON.stringify(await publishPost(post_id), null, 2) }],
    }),
  );

  server.registerTool(
    "blogger_delete_post",
    {
      title: "Delete Blogger Post",
      description: "Permanently delete a Blogger post by post ID.",
      inputSchema: z.object({
        post_id: z.string().min(1),
      }),
    },
    async ({ post_id }) => {
      await deletePost(post_id);
      return { content: [{ type: "text", text: `Deleted Blogger post ${post_id}.` }] };
    },
  );
});

function authorized(request: Request) {
  const expected = process.env.MCP_ACCESS_TOKEN;
  if (!expected) return true;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

async function protectedHandler(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  return handler(request);
}

export const GET = protectedHandler;
export const POST = protectedHandler;
