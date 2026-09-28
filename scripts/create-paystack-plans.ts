/**
 * One-off admin script: creates the 8 Paystack recurring Plans (Boutique +
 * Pro × NGN/GHS/ZAR/KES) that `lib/plan-codes.ts` expects env vars for.
 *
 * Run once per Paystack environment (test mode, then again in live mode
 * before launch) — NOT on every deploy. Safe to re-run: any (tier,
 * currency) pair whose env var is already set is skipped rather than
 * creating a duplicate Plan on Paystack.
 *
 * Usage:
 *   bun run scripts/create-paystack-plans.ts
 *
 * Requires PAYSTACK_SECRET_KEY in `.env.local` (Bun loads it automatically).
 * Edit PRICES below with real per-currency amounts before running — the NGN
 * defaults match what's shown on the pricing page today; the other three
 * currencies are commented out until you decide real prices for them.
 */

import { createPlan } from "@/lib/paystack";
import { CURRENCIES, toMinorUnits, type BusinessCurrency } from "@/lib/currencies";
import { envVarFor, type PaidPlanTier } from "@/lib/plan-codes";

// Whole-currency amounts (e.g. naira, not kobo) — edit before running.
// Leave a currency out (or commented) to skip creating that plan for now.
const PRICES: Record<PaidPlanTier, Partial<Record<BusinessCurrency, number>>> = {
  boutique: {
    NGN: 5000,
    // GHS: 0, // TODO: set a real Boutique price in Ghanaian cedis
    // ZAR: 0, // TODO: set a real Boutique price in South African rand
    // KES: 0, // TODO: set a real Boutique price in Kenyan shillings
  },
  pro: {
    NGN: 15000,
    // GHS: 0, // TODO: set a real Pro price in Ghanaian cedis
    // ZAR: 0, // TODO: set a real Pro price in South African rand
    // KES: 0, // TODO: set a real Pro price in Kenyan shillings
  },
};

const TIER_LABEL: Record<PaidPlanTier, string> = {
  boutique: "Boutique",
  pro: "Pro",
};

async function main() {
  const results: { envVar: string; planCode: string }[] = [];
  const skipped: string[] = [];
  const failed: { envVar: string; error: string }[] = [];

  for (const tier of Object.keys(PRICES) as PaidPlanTier[]) {
    for (const currency of CURRENCIES.map((c) => c.code)) {
      const amount = PRICES[tier][currency];
      const envVar = envVarFor(tier, currency);

      if (amount === undefined) {
        console.log(`— Skipping ${TIER_LABEL[tier]} / ${currency}: no price set in PRICES.`);
        continue;
      }

      if (process.env[envVar]) {
        console.log(`— Skipping ${TIER_LABEL[tier]} / ${currency}: ${envVar} is already set (avoiding a duplicate Plan).`);
        skipped.push(envVar);
        continue;
      }

      const amountMinorUnits = toMinorUnits(amount, currency);
      console.log(
        `→ Creating ${TIER_LABEL[tier]} / ${currency}: ${amount} ${currency} → ${amountMinorUnits} minor units...`,
      );

      try {
        const plan = await createPlan({
          name: `Salesy ${TIER_LABEL[tier]} (${currency})`,
          amountMinorUnits,
          currency,
          interval: "monthly",
        });
        console.log(`  ✓ Created — plan_code: ${plan.plan_code}`);
        results.push({ envVar, planCode: plan.plan_code });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ Failed: ${message}`);
        failed.push({ envVar, error: message });
      }
    }
  }

  console.log("\n--------------------------------------------------");
  if (results.length > 0) {
    console.log("Paste these into .env.local (and your host's env settings):\n");
    for (const { envVar, planCode } of results) {
      console.log(`${envVar}=${planCode}`);
    }
  } else {
    console.log("No new plans were created.");
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped (already configured): ${skipped.join(", ")}`);
  }

  if (failed.length > 0) {
    console.log("\nFailed:");
    for (const { envVar, error } of failed) {
      console.log(`  ${envVar}: ${error}`);
    }
    process.exitCode = 1;
  }
}

main();
