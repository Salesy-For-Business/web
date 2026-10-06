"use client";

import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { secondaryButtonClass } from "@/components/auth/styles";
import { BlogPostGrid } from "@/components/blog/blog-post-card";
import type { PublicBlogPost } from "@/lib/blog";

export function BlogList({
  initialPosts,
  initialHasMore,
}: {
  initialPosts: PublicBlogPost[];
  initialHasMore: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/blog?page=${nextPage}`);
      const data = (await res.json()) as {
        ok: boolean;
        posts?: PublicBlogPost[];
        hasMore?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not load more posts.");
      }
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      setHasMore(Boolean(data.hasMore));
      setPage(nextPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load more posts.");
    } finally {
      setLoading(false);
    }
  }

  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-[14px] text-muted">
        No posts yet — check back soon.
      </p>
    );
  }

  return (
    <div>
      <BlogPostGrid posts={posts} />
      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className={clsx(secondaryButtonClass, "w-auto min-w-40 px-6")}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
