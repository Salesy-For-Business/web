import type { BusinessCurrency } from "@/lib/currencies";

export type PaidPlanTier = "boutique" | "pro";

/**
 * Legacy env-var plan codes, one per (tier, currency) pair. Plan codes now
 * live on the `PlanConfig` documents (set by the superadmin "Sync to
 * Paystack" action); these env vars remain a fallback so deployments that
 * were configured with `scripts/create-paystack-plans.ts` keep working.
 * Resolve codes through `resolvePlanCode` in `lib/plan-config.ts`.
 */
const PLAN_CODE_ENV: Record<PaidPlanTier, Record<BusinessCurrency, string>> = {
  boutique: {
    NGN: "PAYSTACK_PLAN_BOUTIQUE_NGN",
    GHS: "PAYSTACK_PLAN_BOUTIQUE_GHS",
    ZAR: "PAYSTACK_PLAN_BOUTIQUE_ZAR",
    KES: "PAYSTACK_PLAN_BOUTIQUE_KES",
  },
  pro: {
    NGN: "PAYSTACK_PLAN_PRO_NGN",
    GHS: "PAYSTACK_PLAN_PRO_GHS",
    ZAR: "PAYSTACK_PLAN_PRO_ZAR",
    KES: "PAYSTACK_PLAN_PRO_KES",
  },
};

export function isPaidPlanTier(value: string): value is PaidPlanTier {
  return value === "boutique" || value === "pro";
}

/** The env-var plan code for a (tier, currency), or `null` when unset. */
export function envPlanCodeFor(
  tier: PaidPlanTier,
  currency: BusinessCurrency,
): string | null {
  const envVar = PLAN_CODE_ENV[tier][currency];
  return process.env[envVar] || null;
}

/** The env var name backing a given (tier, currency) plan code — shared with
 * `scripts/create-paystack-plans.ts` so the two never drift apart. */
export function envVarFor(tier: PaidPlanTier, currency: BusinessCurrency): string {
  return PLAN_CODE_ENV[tier][currency];
}
