import Link from "next/link";
import type { PublicBlogPost } from "@/lib/blog";

function BlogCoverImage({ post }: { post: PublicBlogPost }) {
  if (post.coverImage) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage}
          alt={post.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }
  return (
    <div
      className="relative flex aspect-[16/10] items-end overflow-hidden rounded-xl"
      style={{
        background:
          "linear-gradient(145deg, #0F766E 0%, color-mix(in srgb, #0F766E 55%, #0a0a0a) 100%)",
      }}
    >
      <p className="relative z-[1] p-4 font-display text-[20px] leading-6 tracking-tight text-white/95">
        {post.title}
      </p>
    </div>
  );
}

export function BlogPostCard({ post }: { post: PublicBlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <BlogCoverImage post={post} />
      <div className="mt-4 space-y-2">
        {post.tags.length > 0 ? (
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">
            {post.tags[0]}
          </p>
        ) : null}
        <h2 className="font-display text-[19px] leading-6 tracking-tight text-heading group-hover:text-link">
          {post.title}
        </h2>
        <p className="line-clamp-2 text-[14px] leading-6 text-muted">{post.excerpt}</p>
        <p className="text-[13px] text-muted">
          {post.authorName} ·{" "}
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}

export function BlogPostGrid({ posts }: { posts: PublicBlogPost[] }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
