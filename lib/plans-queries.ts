"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type ApiOk } from "@/lib/api/client";
import {
  DEFAULT_PLAN_CONFIGS,
  defaultPublicPlans,
  listingLimitValue,
  type PublicPlan,
} from "@/lib/plan-defaults";
import type { PlanId } from "@/lib/plans";

export const plansKey = ["plans"] as const;

export function usePlansQuery() {
  return useQuery({
    queryKey: plansKey,
    queryFn: async () => {
      const { data } = await api.get<ApiOk<{ plans: PublicPlan[] }>>("/plans");
      return data.plans;
    },
    staleTime: 60_000,
    placeholderData: defaultPublicPlans,
  });
}

/** Live config for one tier, falling back to code defaults while loading. */
export function usePlanConfig(id: PlanId) {
  const { data } = usePlansQuery();
  const plan = data?.find((p) => p.id === id);
  return plan ?? { ...DEFAULT_PLAN_CONFIGS[id], subscribableCurrencies: [] };
}

/** Listing limit for a tier as a number (`Infinity` = unlimited). */
export function useListingLimit(id: PlanId) {
  return listingLimitValue(usePlanConfig(id).listingLimit);
}
