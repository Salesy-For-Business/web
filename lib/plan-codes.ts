import type { BusinessCurrency } from "@/lib/currencies";

export type PaidPlanTier = "boutique" | "pro";

/**
 * Paystack Plan codes for recurring billing, one per (tier, currency) pair —
 * 2 tiers × 4 currencies = 8. These are created ONCE (via Paystack's
 * dashboard, or a one-off local script using `createPlan` in
 * `lib/paystack.ts`), never at request time — there's no product reason to
 * create them dynamically, and doing so risks orphaned duplicates on retry.
 *
 * Set the matching env var for every currency you actually offer; a tier +
 * currency combination with no env var configured is treated as
 * unavailable (see `planCodeFor`).
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

export function planCodeFor(
  tier: PaidPlanTier,
  currency: BusinessCurrency,
): string | null {
  const envVar = PLAN_CODE_ENV[tier][currency];
  return process.env[envVar] || null;
}
