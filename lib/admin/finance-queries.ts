"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";
import type { BusinessCurrency } from "@/lib/currencies";

export type FinanceData = {
  gmv: number;
  orderPlatformRevenue: number;
  featuredRevenue: number;
  totalPlatformRevenue: number;
  paidOrderCount: number;
  planCounts: { free: number; boutique: number; pro: number };
  mrr: Partial<Record<BusinessCurrency, number>>;
  /** Last 12 months, oldest first. */
  series: { date: string; gmv: number; orderRevenue: number; featuredRevenue: number }[];
  featuredListingWeeklyPriceNGN: number | null;
  businesses: {
    id: string;
    businessName: string;
    storeHandle: string;
    plan: string;
    subscriptionStatus: string;
    subscriptionRenewsAt: string | null;
    billingCurrency: BusinessCurrency;
  }[];
};

export function useAdminFinanceQuery() {
  return useQuery({
    queryKey: ["admin", "finance"],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<FinanceData>>("/admin/finance");
      return data;
    },
  });
}
