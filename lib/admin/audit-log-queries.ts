"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";

export type AuditLogEntry = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export function useAuditLogQuery() {
  return useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ entries: AuditLogEntry[] }>>(
        "/admin/audit-log",
      );
      return data.entries;
    },
  });
}
