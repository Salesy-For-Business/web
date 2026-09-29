import { DEFAULT_PLAN_CONFIGS } from "@/lib/plan-defaults";

export type PlanId = "free" | "boutique" | "pro";

export function planLabel(plan: PlanId) {
  if (plan === "boutique") return "Boutique";
  if (plan === "pro") return "Pro";
  return "Free";
}

/**
 * Code-default commission rate (0–1). Live values are admin-editable — use
 * `usePlansQuery` on the client or `commissionPercentFor` on the server.
 */
export function salesyFeeRate(plan: PlanId) {
  return DEFAULT_PLAN_CONFIGS[plan].commissionPercent / 100;
}

/** Code-default listing limit. Live values: `usePlansQuery` / `listingLimitFor`. */
export function productListingLimit(plan: PlanId) {
  return DEFAULT_PLAN_CONFIGS[plan].listingLimit ?? Infinity;
}
