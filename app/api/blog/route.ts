import { jsonError, jsonOk } from "@/lib/api/http";
import { getPublishedPosts } from "@/lib/blog";

/** Public — backs the "Load more" button on /blog. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const { posts, hasMore } = await getPublishedPosts(page);
    return jsonOk({ posts, hasMore });
  } catch (err) {
    console.error("[blog GET]", err);
    return jsonError("Could not load posts.", 500);
  }
}
