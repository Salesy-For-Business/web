"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";

/** Generic list/detail/update/delete hooks shared by every superadmin CRUD
 * screen (Businesses, Users, Orders, Products) — each just supplies its own
 * `resource` path and the response key its API route uses. */

export function useAdminResourceList<T>(
  resource: string,
  listKey: string,
  q: string,
) {
  return useQuery({
    queryKey: ["admin", resource, "list", q],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<Record<string, T[]>>>(
        `/admin/${resource}`,
        { params: q ? { q } : undefined },
      );
      return data[listKey] ?? [];
    },
  });
}

export function useAdminResourceDetail<T>(
  resource: string,
  detailKey: string,
  id: string | null,
) {
  return useQuery({
    queryKey: ["admin", resource, "detail", id],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<Record<string, T>>>(
        `/admin/${resource}/${id}`,
      );
      return data[detailKey];
    },
    enabled: Boolean(id),
  });
}

export function useAdminResourceUpdate<T>(
  resource: string,
  detailKey: string,
  id: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { data } = await api.patch<ApiOk<Record<string, T>>>(
        `/admin/${resource}/${id}`,
        values,
      );
      return data[detailKey];
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", resource] });
    },
  });
}

export function useAdminResourceDelete(resource: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/${resource}/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", resource] });
    },
  });
}

export { getApiError };
