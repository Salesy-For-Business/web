"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <AdminPageHeader
        backHref="/admin/blog"
        backLabel="All posts"
        title="New post"
      />
      <BlogPostForm />
    </AdminShell>
  );
}
