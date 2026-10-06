"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ResourceTable, type ResourceColumn } from "@/components/admin/resource-table";
import { primaryButtonClass } from "@/components/auth/styles";
import {
  useAdminBlogPostsQuery,
  type AdminBlogPostRow,
} from "@/lib/admin/blog-queries";

const columns: ResourceColumn<AdminBlogPostRow>[] = [
  {
    key: "title",
    label: "Post",
    render: (r) => (
      <div className="flex items-center gap-3">
        {r.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.coverImage} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="size-10 shrink-0 rounded-lg bg-surface" />
        )}
        <div className="min-w-0 max-w-[16rem]">
          <p className="truncate font-medium text-heading">{r.title}</p>
          <p className="truncate text-[12px] text-muted">/blog/{r.slug}</p>
        </div>
      </div>
    ),
  },
  { key: "author", label: "Author", render: (r) => r.authorName },
  {
    key: "status",
    label: "Status",
    render: (r) => <StatusBadge tone={r.status === "published" ? "success" : "neutral"}>{r.status}</StatusBadge>,
  },
  {
    key: "date",
    label: "Published",
    render: (r) => (r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "—"),
  },
];

function BlogListContent() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const { data, isPending } = useAdminBlogPostsQuery(q);

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description="Posts you publish appear at salesy.link/blog."
        actions={
          <Link href="/admin/blog/new" className={clsx(primaryButtonClass, "w-auto gap-2 px-5")}>
            <Plus className="size-4" aria-hidden />
            New post
          </Link>
        }
      />
      <ResourceTable
        columns={columns}
        rows={data ?? []}
        loading={isPending}
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search by title…"
        onRowClick={(r) => router.push(`/admin/blog/${r.id}`)}
        emptyLabel="No posts yet."
      />
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <BlogListContent />
    </AdminShell>
  );
}
