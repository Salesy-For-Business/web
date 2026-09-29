"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";
import type { BusinessCurrency } from "@/lib/currencies";

export type PlatformInfo = {
  supportEmail: string;
  defaultStoreCurrency: BusinessCurrency;
};

export const platformInfoKey = ["platform-info"] as const;

export function usePlatformInfo() {
  return useQuery({
    queryKey: platformInfoKey,
    queryFn: async () => {
      const { data } = await api.get<ApiOk<PlatformInfo>>("/platform");
      return { supportEmail: data.supportEmail, defaultStoreCurrency: data.defaultStoreCurrency };
    },
    staleTime: 5 * 60_000,
  });
}
