"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { StoreChangeRequestValues } from "@/lib/store-change-schemas";

export type StoreChangeRequestStatus = "pending" | "approved" | "rejected";

export type StoreChangeRequest = {
  id: string;
  currentStoreHandle: string;
  currentBusinessName: string;
  requestedStoreHandle: string;
  requestedBusinessName: string;
  status: StoreChangeRequestStatus;
  reviewNote: string | null;
  createdAt: string;
};

const key = ["business", "store-change-request"] as const;

export function useStoreChangeRequestQuery() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ request: StoreChangeRequest | null }>>(
        "/business/store-change-request",
      );
      return data.request;
    },
  });
}

export function useSubmitStoreChangeRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: StoreChangeRequestValues) => {
      const { data } = await api.post<ApiOk<{ request: StoreChangeRequest }>>(
        "/business/store-change-request",
        values,
      );
      return data.request;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useCancelStoreChangeRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/business/store-change-request/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: key });
    },
  });
}

export { getApiError };
