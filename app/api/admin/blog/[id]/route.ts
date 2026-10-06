import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, BlogPost, type BlogPostLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { blogPostSchema, slugifyTitle } from "@/lib/blog-schemas";
import { uniqueBlogSlug } from "@/lib/blog";

function toPublic(p: BlogPostLean) {
  return {
    id: String(p._id),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    contentMarkdown: p.contentMarkdown,
    coverImage: p.coverImage ?? null,
    status: p.status,
    authorName: p.authorName,
    tags: p.tags,
    publishedAt: p.publishedAt ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const post = await BlogPost.findById(id).lean<BlogPostLean | null>();
    if (!post) return jsonError("Post not found.", 404);

    return jsonOk({ post: toPublic(post) });
  } catch (err) {
    console.error("[admin/blog/:id GET]", err);
    return jsonError("Could not load post.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid post");
    }
    const values = parsed.data;

    await connectDb();
    const existing = await BlogPost.findById(id);
    if (!existing) return jsonError("Post not found.", 404);

    let slug = existing.slug;
    if (slugifyTitle(values.title) !== slugifyTitle(existing.title)) {
      slug = await uniqueBlogSlug(slugifyTitle(values.title), existing._id);
    }

    existing.title = values.title.trim();
    existing.slug = slug;
    existing.excerpt = values.excerpt.trim();
    existing.contentMarkdown = values.contentMarkdown;
    existing.coverImage = values.coverImage || undefined;
    existing.tags = values.tags;
    if (values.status === "published" && existing.status !== "published") {
      existing.publishedAt = new Date();
    }
    existing.status = values.status;
    await existing.save();

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "blog.update",
      targetType: "blog_post",
      targetId: id,
      metadata: { title: existing.title, status: existing.status },
    });

    return jsonOk({ post: toPublic(existing.toObject()) });
  } catch (err) {
    console.error("[admin/blog/:id PATCH]", err);
    return jsonError("Could not update post.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const post = await BlogPost.findByIdAndDelete(id).lean<BlogPostLean | null>();
    if (!post) return jsonError("Post not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "blog.delete",
      targetType: "blog_post",
      targetId: id,
      metadata: { title: post.title },
    });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[admin/blog/:id DELETE]", err);
    return jsonError("Could not delete post.", 500);
  }
}
