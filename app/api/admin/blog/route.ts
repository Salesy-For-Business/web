import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, BlogPost, User, type BlogPostLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { blogPostSchema, slugifyTitle } from "@/lib/blog-schemas";
import { uniqueBlogSlug } from "@/lib/blog";

function toPublic(p: BlogPostLean) {
  return {
    id: String(p._id),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: p.coverImage ?? null,
    status: p.status,
    authorName: p.authorName,
    tags: p.tags,
    publishedAt: p.publishedAt ?? null,
    updatedAt: p.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    await connectDb();
    const filter = q
      ? { title: { $regex: q, $options: "i" } }
      : {};

    const posts = await BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<BlogPostLean[]>();

    return jsonOk({ posts: posts.map(toPublic) });
  } catch (err) {
    console.error("[admin/blog GET]", err);
    return jsonError("Could not load blog posts.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const body = await request.json();
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid post");
    }
    const values = parsed.data;

    await connectDb();
    const baseSlug = slugifyTitle(values.title);
    const slug = await uniqueBlogSlug(baseSlug);
    const author = await User.findById(admin.userId).select("firstName lastName");
    const authorName = author
      ? `${author.firstName} ${author.lastName}`.trim()
      : "Salesy Team";

    const post = await BlogPost.create({
      title: values.title.trim(),
      slug,
      excerpt: values.excerpt.trim(),
      contentMarkdown: values.contentMarkdown,
      coverImage: values.coverImage || undefined,
      status: values.status,
      tags: values.tags,
      authorUserId: admin.userId,
      authorName,
      publishedAt: values.status === "published" ? new Date() : undefined,
    });

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "blog.create",
      targetType: "blog_post",
      targetId: String(post._id),
      metadata: { title: post.title, status: post.status },
    });

    return jsonOk({ post: toPublic(post.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("[admin/blog POST]", err);
    return jsonError("Could not create post.", 500);
  }
}
