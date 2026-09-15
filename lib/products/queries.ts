"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { ProductValues } from "@/lib/product-schemas";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  category: string;
  inStock: boolean;
  stockQty: number | null;
  images: string[];
  tags: string[];
  accent: string;
  createdAt: string;
  updatedAt: string;
};

export const productKeys = {
  all: ["products"] as const,
  detail: (id: string) => ["products", id] as const,
};

export function useProductsQuery() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: async () => {
      const { data } = await api.get<
        ApiOk<{
          products: PublicProduct[];
          count: number;
          limit: number;
        }>
      >("/products");
      return data;
    },
  });
}

export function useProductQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ product: PublicProduct }>>(
        `/products/${id}`,
      );
      return data.product;
    },
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProductValues) => {
      const { data } = await api.post<ApiOk<{ product: PublicProduct }>>(
        "/products",
        values,
      );
      return data.product;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProductMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProductValues) => {
      const { data } = await api.patch<ApiOk<{ product: PublicProduct }>>(
        `/products/${id}`,
        values,
      );
      return data.product;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: productKeys.all });
      await qc.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export async function uploadProductImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", "products");
  const res = await fetch("/api/uploads/image", {
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
