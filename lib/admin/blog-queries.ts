"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { BlogPostValues } from "@/lib/blog-schemas";

export type AdminBlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  status: "draft" | "published";
  authorName: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string;
};

export type AdminBlogPostDetail = AdminBlogPostRow & {
  contentMarkdown: string;
};

export const adminBlogKeys = {
  list: (q: string) => ["admin", "blog", "list", q] as const,
  detail: (id: string) => ["admin", "blog", "detail", id] as const,
};

export function useAdminBlogPostsQuery(q: string) {
  return useQuery({
    queryKey: adminBlogKeys.list(q),
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ posts: AdminBlogPostRow[] }>>(
        "/admin/blog",
        { params: q ? { q } : undefined },
      );
      return data.posts;
    },
  });
}

export function useAdminBlogPostQuery(id: string | null) {
  return useQuery({
    queryKey: adminBlogKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ post: AdminBlogPostDetail }>>(
        `/admin/blog/${id}`,
      );
      return data.post;
    },
    enabled: Boolean(id),
  });
}

export function useCreateBlogPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BlogPostValues) => {
      const { data } = await api.post<ApiOk<{ post: AdminBlogPostDetail }>>(
        "/admin/blog",
        values,
      );
      return data.post;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "blog", "list"] });
    },
  });
}

export function useUpdateBlogPostMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BlogPostValues) => {
      const { data } = await api.patch<ApiOk<{ post: AdminBlogPostDetail }>>(
        `/admin/blog/${id}`,
        values,
      );
      return data.post;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "blog", "list"] });
      await qc.invalidateQueries({ queryKey: adminBlogKeys.detail(id) });
    },
  });
}

export function useDeleteBlogPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/blog/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "blog", "list"] });
    },
  });
}

export async function uploadBlogImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/blog/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = (await res.json()) as ApiOk<{ url: string; publicId: string }> & {
    error?: string;
  };
  if (!res.ok || !("ok" in data) || !data.ok) {
    throw new Error(data.error || "Upload failed");
  }
  return data;
}

export { getApiError };
