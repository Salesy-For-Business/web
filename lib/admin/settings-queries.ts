"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { BusinessCurrency } from "@/lib/currencies";
import { platformInfoKey } from "@/lib/platform-queries";

/** Whole currency units (naira, not kobo). */
export type FeaturedListingPrices = Partial<Record<BusinessCurrency, number>>;

export type AdminSettings = {
  featuredListingWeeklyPrice: FeaturedListingPrices;
  subscriptionReminderDays: number;
  supportEmail: string;
  defaultStoreCurrency: BusinessCurrency;
  adminPinCustomized: boolean;
  updatedAt: string | null;
};

export type AdminSettingsUpdate = Partial<{
  featuredListingWeeklyPrice: Partial<Record<BusinessCurrency, number | null>>;
  subscriptionReminderDays: number;
  supportEmail: string;
  defaultStoreCurrency: BusinessCurrency;
}>;

const adminSettingsKey = ["admin", "settings"] as const;

export function useAdminSettingsQuery() {
  return useQuery({
    queryKey: adminSettingsKey,
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ settings: AdminSettings }>>(
        "/admin/settings",
      );
      return data.settings;
    },
  });
}

export function useUpdateSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: AdminSettingsUpdate) => {
      const { data } = await api.patch<ApiOk<{ settings: AdminSettings }>>(
        "/admin/settings",
        values,
      );
      return data.settings;
    },
    onSuccess: async (settings) => {
      qc.setQueryData(adminSettingsKey, settings);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "finance"] }),
        qc.invalidateQueries({ queryKey: platformInfoKey }),
      ]);
    },
  });
}

export function useUpdateAdminPinMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      await api.post("/admin/settings/pin", { code });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: adminSettingsKey });
    },
  });
}

export { getApiError };
