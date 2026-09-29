"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";

export type IntegrationStatus = "ok" | "warning" | "missing" | "off";

export type IntegrationCheck = {
  id: string;
  label: string;
  status: IntegrationStatus;
  detail: string;
  hint?: string;
};

export type IntegrationGroup = {
  id: string;
  title: string;
  description: string;
  checks: IntegrationCheck[];
};

export function useIntegrationsQuery() {
  return useQuery({
    queryKey: ["admin", "integrations"],
    queryFn: async () => {
      const { data } = await api.get<
        ApiOk<{ groups: IntegrationGroup[]; checkedAt: string }>
      >("/admin/integrations");
      return data;
    },
  });
}
