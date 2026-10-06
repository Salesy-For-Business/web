import { Types } from "mongoose";
import { connectDb, BlogPost, type BlogPostLean } from "@/lib/db";

export async function uniqueBlogSlug(
  base: string,
  excludeId?: Types.ObjectId | string,
) {
  await connectDb();
  let slug = base;
  let n = 0;
  for (;;) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await BlogPost.exists(query);
    if (!exists) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  coverImage: string | null;
  authorName: string;
  tags: string[];
  publishedAt: string;
};

function toPublic(p: BlogPostLean): PublicBlogPost {
  return {
    id: String(p._id),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    contentMarkdown: p.contentMarkdown,
    coverImage: p.coverImage || null,
    authorName: p.authorName,
    tags: p.tags,
    publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
  };
}

const PAGE_SIZE = 9;

export async function getPublishedPosts(page = 1): Promise<{
  posts: PublicBlogPost[];
  hasMore: boolean;
}> {
  await connectDb();
  const skip = Math.max(0, page - 1) * PAGE_SIZE;
  const posts = await BlogPost.find({ status: "published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE + 1)
    .lean<BlogPostLean[]>();

  return {
    posts: posts.slice(0, PAGE_SIZE).map(toPublic),
    hasMore: posts.length > PAGE_SIZE,
  };
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublicBlogPost | null> {
  await connectDb();
  const post = await BlogPost.findOne({
    slug: slug.toLowerCase().trim(),
    status: "published",
  }).lean<BlogPostLean | null>();
  return post ? toPublic(post) : null;
}

export async function getRelatedPosts(
  slug: string,
  limit = 3,
): Promise<PublicBlogPost[]> {
  await connectDb();
  const posts = await BlogPost.find({ status: "published", slug: { $ne: slug } })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean<BlogPostLean[]>();
  return posts.map(toPublic);
}
