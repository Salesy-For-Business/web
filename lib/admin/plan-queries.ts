"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { BusinessCurrency } from "@/lib/currencies";
import type { PlanConfigData } from "@/lib/plan-defaults";
import type { PlanUpdateValues } from "@/lib/admin/plan-schemas";
import type { PlanId } from "@/lib/plans";
import { plansKey } from "@/lib/plans-queries";

export type PlanCodeSource = "database" | "env" | null;

export type AdminPlan = PlanConfigData & {
  planCodes: Partial<
    Record<BusinessCurrency, { code: string | null; source: PlanCodeSource }>
  >;
  updatedAt: string | null;
};

export type PaystackSyncResult = {
  currency: BusinessCurrency;
  action: "created" | "updated" | "skipped" | "failed";
  code: string | null;
  message?: string;
};

const adminPlansKey = ["admin", "plans"] as const;

export function useAdminPlansQuery() {
  return useQuery({
    queryKey: adminPlansKey,
    queryFn: async () => {
      const { data } = await api.get<
        ApiOk<{ plans: AdminPlan[]; paystackMode: "live" | "test" | null }>
      >("/admin/plans");
      return data;
    },
  });
}

export function useAdminPlanQuery(tier: PlanId) {
  return useQuery({
    queryKey: [...adminPlansKey, tier],
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ plan: AdminPlan }>>(
        `/admin/plans/${tier}`,
      );
      return data.plan;
    },
  });
}

export function useUpdatePlanMutation(tier: PlanId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: PlanUpdateValues) => {
      const { data } = await api.patch<ApiOk<{ plan: AdminPlan }>>(
        `/admin/plans/${tier}`,
        values,
      );
      return data.plan;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: adminPlansKey }),
        qc.invalidateQueries({ queryKey: plansKey }),
      ]);
    },
  });
}

export function useSyncPlanMutation(tier: PlanId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<
        ApiOk<{ results: PaystackSyncResult[]; plan: AdminPlan }>
      >(`/admin/plans/${tier}/sync-paystack`);
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: adminPlansKey }),
        qc.invalidateQueries({ queryKey: plansKey }),
      ]);
    },
  });
}

export { getApiError };
