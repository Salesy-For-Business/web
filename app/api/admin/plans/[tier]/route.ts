import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { planUpdateSchema } from "@/lib/admin/plan-schemas";
import { connectDb, PlanConfig } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getAdminPlanConfigs, invalidatePlanConfigCache } from "@/lib/plan-config";
import { PLAN_IDS } from "@/lib/plan-defaults";
import type { PlanId } from "@/lib/plans";

function parseTier(value: string): PlanId | null {
  return (PLAN_IDS as string[]).includes(value) ? (value as PlanId) : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tier: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const tier = parseTier((await params).tier);
    if (!tier) return jsonError("Unknown plan.", 404);

    const plans = await getAdminPlanConfigs();
    return jsonOk({ plan: plans.find((p) => p.id === tier) });
  } catch (err) {
    console.error("[admin/plans/:tier GET]", err);
    return jsonError("Could not load plan.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tier: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const tier = parseTier((await params).tier);
    if (!tier) return jsonError("Unknown plan.", 404);

    const parsed = planUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan settings");
    }
    const values = parsed.data;

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, ""> = {};
    const simple = [
      "name",
      "blurb",
      "badge",
      "featured",
      "ctaLabel",
      "features",
      "commissionPercent",
      "listingLimit",
    ] as const;
    for (const key of simple) {
      if (values[key] !== undefined) $set[key] = values[key];
    }
    if (values.active !== undefined && tier !== "free") $set.active = values.active;
    if (values.prices) $set.prices = values.prices;
    if (values.paystackPlanCodes) {
      if (tier === "free") return jsonError("The Free plan has no Paystack plan.");
      for (const [currency, code] of Object.entries(values.paystackPlanCodes)) {
        if (code) $set[`paystackPlanCodes.${currency}`] = code;
        else if (code === null) $unset[`paystackPlanCodes.${currency}`] = "";
      }
    }

    await connectDb();
    await PlanConfig.updateOne(
      { _id: tier },
      {
        ...(Object.keys($set).length ? { $set } : {}),
        ...(Object.keys($unset).length ? { $unset } : {}),
      },
      { upsert: true },
    );
    invalidatePlanConfigCache();
    revalidatePath("/");

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "plan.update",
      targetType: "plan",
      targetId: tier,
      metadata: values,
    });

    const plans = await getAdminPlanConfigs();
    return jsonOk({ plan: plans.find((p) => p.id === tier) });
  } catch (err) {
    console.error("[admin/plans/:tier PATCH]", err);
    return jsonError("Could not update plan.", 500);
  }
}
