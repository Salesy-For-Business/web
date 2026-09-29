"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";
import type { BusinessCurrency } from "@/lib/currencies";

export type OverviewPeriod = "7d" | "30d" | "90d" | "all";

export type Kpi = {
  value: number;
  previous: number | null;
  /** Percent change against the previous period; null when there's nothing to compare. */
  change: number | null;
};

export type OverviewSeriesPoint = {
  date: string;
  gmv: number;
  revenue: number;
  orders: number;
  businesses: number;
  users: number;
};

export type AdminOverview = {
  period: OverviewPeriod;
  bucket: "day" | "week" | "month";
  range: { start: string; end: string };
  /** Currencies present among paid orders; totals add them without conversion. */
  currencies: BusinessCurrency[];
  kpis: {
    gmv: Kpi;
    platformRevenue: Kpi;
    orderRevenue: Kpi;
    featuredRevenue: Kpi;
    paidOrders: Kpi;
    aov: Kpi;
    newBusinesses: Kpi;
    newUsers: Kpi;
    newReviews: Kpi;
    averageRating: number | null;
    activeProducts: number;
    newProducts: number;
    openTickets: number;
    ticketsOpened: number;
    paidSubscriptions: number;
    pastDueSubscriptions: number;
    mrr: Partial<Record<BusinessCurrency, number>>;
  };
  series: OverviewSeriesPoint[];
  planMix: { plan: string; name: string; count: number }[];
  channels: { channel: string; orders: number; gmv: number }[];
  orderStatus: { status: string; count: number }[];
  topBusinesses: {
    id: string;
    businessName: string;
    storeHandle: string;
    gmv: number;
    orders: number;
  }[];
  recentOrders: {
    id: string;
    reference: string;
    customerName: string;
    storeHandle: string;
    total: number;
    currency: BusinessCurrency;
    status: string;
    createdAt: string;
  }[];
  newestBusinesses: {
    id: string;
    businessName: string;
    storeHandle: string;
    plan: string;
    createdAt: string;
  }[];
};

export function useAdminOverviewQuery(period: OverviewPeriod) {
  return useQuery({
    queryKey: ["admin", "overview", period],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<AdminOverview>>("/admin/overview", {
        params: { period },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
