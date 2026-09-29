import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, PlanConfig } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { CURRENCIES, toMinorUnits, type BusinessCurrency } from "@/lib/currencies";
import { createPlan, updatePlan } from "@/lib/paystack";
import { isPaidPlanTier } from "@/lib/plan-codes";
import {
  getAdminPlanConfigs,
  invalidatePlanConfigCache,
} from "@/lib/plan-config";

type SyncResult = {
  currency: BusinessCurrency;
  action: "created" | "updated" | "skipped" | "failed";
  code: string | null;
  message?: string;
};

/**
 * Creates (or updates the amount of) the monthly Paystack Plan for every
 * currency with a monthly price on this tier, then stores the plan codes on
 * the `PlanConfig` document — replacing the old script + env-var workflow.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ tier: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const tier = (await params).tier;
    if (!isPaidPlanTier(tier)) {
      return jsonError("Only paid plans are billed through Paystack.", 400);
    }
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return jsonError("PAYSTACK_SECRET_KEY is not configured.", 422);
    }

    const plan = (await getAdminPlanConfigs()).find((p) => p.id === tier);
    if (!plan) return jsonError("Unknown plan.", 404);

    const results: SyncResult[] = [];
    const codesToSave: Partial<Record<BusinessCurrency, string>> = {};

    for (const { code: currency } of CURRENCIES) {
      const monthly = plan.prices[currency]?.monthly;
      const existing = plan.planCodes[currency]?.code ?? null;

      if (monthly == null || monthly <= 0) {
        results.push({
          currency,
          action: "skipped",
          code: existing,
          message: "No monthly price set",
        });
        continue;
      }

      const name = `Salesy ${plan.name} (${currency})`;
      const amountMinorUnits = toMinorUnits(monthly, currency);

      try {
        if (existing) {
          await updatePlan(existing, { name, amountMinorUnits });
          codesToSave[currency] = existing;
          results.push({ currency, action: "updated", code: existing });
        } else {
          const created = await createPlan({
            name,
            amountMinorUnits,
            currency,
            interval: "monthly",
          });
          codesToSave[currency] = created.plan_code;
          results.push({ currency, action: "created", code: created.plan_code });
        }
      } catch (err) {
        results.push({
          currency,
          action: "failed",
          code: existing,
          message: err instanceof Error ? err.message : "Paystack request failed",
        });
      }
    }

    if (Object.keys(codesToSave).length) {
      await connectDb();
      const $set = Object.fromEntries(
        Object.entries(codesToSave).map(([c, code]) => [`paystackPlanCodes.${c}`, code]),
      );
      await PlanConfig.updateOne({ _id: tier }, { $set }, { upsert: true });
      invalidatePlanConfigCache();
      revalidatePath("/");
    }

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "plan.sync_paystack",
      targetType: "plan",
      targetId: tier,
      metadata: { results },
    });

    const updated = (await getAdminPlanConfigs()).find((p) => p.id === tier);
    return jsonOk({ results, plan: updated });
  } catch (err) {
    console.error("[admin/plans/:tier/sync-paystack]", err);
    return jsonError("Could not sync with Paystack.", 500);
  }
}
