"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { ModeratorRole } from "@/lib/auth-store";

export type AdminMe = {
  isModerator: boolean;
  moderatorRole: ModeratorRole | null;
  gateVerified: boolean;
};

export const adminKeys = {
  me: ["admin", "me"] as const,
};

export function useAdminMeQuery() {
  return useQuery({
    queryKey: adminKeys.me,
    queryFn: async () => {
      const { data } = await api.get<ApiOk<AdminMe>>("/admin/me");
      return data;
    },
    retry: false,
  });
}

export function useVerifyAdminPinMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post<ApiOk<{ verified: boolean }>>(
        "/admin/verify-pin",
        { code },
      );
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminKeys.me });
    },
  });
}

export { getApiError };
