export type PlanId = "free" | "boutique" | "pro";

export function planLabel(plan: PlanId) {
  if (plan === "boutique") return "Boutique";
  if (plan === "pro") return "Pro";
  return "Free";
}

/** Salesy platform fee rate — Free only. Boutique and Pro: no commission. */
export function salesyFeeRate(plan: PlanId) {
  return plan === "free" ? 0.05 : 0;
}

export function productListingLimit(plan: PlanId) {
  return plan === "free" ? 5 : Infinity;
}
