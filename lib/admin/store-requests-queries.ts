"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";

export type AdminStoreRequestRow = {
  id: string;
  businessId: string;
  currentStoreHandle: string;
  currentBusinessName: string;
  requestedStoreHandle: string;
  requestedBusinessName: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  createdAt: string;
};

export function useAdminStoreRequestsQuery(status: string) {
  return useQuery({
    queryKey: ["admin", "store-requests", status],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ requests: AdminStoreRequestRow[] }>>(
        "/admin/store-requests",
        { params: status ? { status } : undefined },
      );
      return data.requests;
    },
  });
}

export function useReviewStoreRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      note,
    }: {
      id: string;
      action: "approve" | "reject";
      note?: string;
    }) => {
      const { data } = await api.patch<ApiOk<{ status: string }>>(
        `/admin/store-requests/${id}`,
        { action, note },
      );
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "store-requests"] });
    },
  });
}

export { getApiError };
