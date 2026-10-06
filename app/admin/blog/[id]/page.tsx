"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { secondaryButtonClass } from "@/components/auth/styles";
import {
  getApiError,
  useAdminBlogPostQuery,
  useDeleteBlogPostMutation,
} from "@/lib/admin/blog-queries";

function EditBlogPostContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, isPending } = useAdminBlogPostQuery(id);
  const remove = useDeleteBlogPostMutation();

  async function onDelete() {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Post deleted");
      router.push("/admin/blog");
    } catch (err) {
      toast.error(getApiError(err, "Could not delete post."));
    }
  }

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/blog"
        backLabel="All posts"
        title={data?.title ?? "Edit post"}
        actions={
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={remove.isPending}
            className={clsx(secondaryButtonClass, "w-auto gap-2 px-4 text-red-600")}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Delete
          </button>
        }
      />
      {isPending || !data ? (
        <p className="text-[14px] text-muted">Loading…</p>
      ) : (
        <BlogPostForm post={data} />
      )}
    </div>
  );
}

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell allow={["superadmin"]}>
      <EditBlogPostContent id={id} />
    </AdminShell>
  );
}
