"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";

export type RevenuePeriod = "today" | "7d" | "30d" | "all";

export type DashboardOverview = {
  period: RevenuePeriod;
  metrics: {
    revenue: number;
    totalOrders: number;
    paidOrders: number;
    avgOrderValue: number;
    storeViews: number;
    storeViewsConv: number;
  };
  earnings: {
    gross: number;
    platformFee: number;
    net: number;
    feeRate: number;
  };
  availableBalance: number;
  productCount: number;
  uniqueBuyers: number;
  topProducts: { name: string; units: number; revenue: number }[];
  revenueTrajectory: { label: string; revenue: number }[];
  recentOrders: {
    id: string;
    customer: string;
    product: string;
    amount: number;
    status: "Paid" | "Pending" | "Failed";
    date: string;
    channel: string;
  }[];
};

export const dashboardKeys = {
  overview: (period: RevenuePeriod) =>
    ["dashboard", "overview", period] as const,
};

export function useDashboardOverview(period: RevenuePeriod) {
  return useQuery({
    queryKey: dashboardKeys.overview(period),
    queryFn: async () => {
      const { data } = await api.get<ApiOk<DashboardOverview>>(
        "/dashboard/overview",
        { params: { period } },
      );
      return data;
    },
    staleTime: 30_000,
  });
}
