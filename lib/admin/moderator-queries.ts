"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { ModeratorRole } from "@/lib/auth-store";

export type ModeratorRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  moderatorRole: ModeratorRole | null;
};

export function useModeratorsQuery() {
  return useQuery({
    queryKey: ["admin", "moderators"],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ moderators: ModeratorRow[] }>>(
        "/admin/moderators",
      );
      return data.moderators;
    },
  });
}

export function useAssignModeratorMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; moderatorRole: ModeratorRole | null }) => {
      const { data } = await api.post<ApiOk<{ moderator: ModeratorRow }>>(
        "/admin/moderators",
        input,
      );
      return data.moderator;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "moderators"] });
    },
  });
}

export { getApiError };
