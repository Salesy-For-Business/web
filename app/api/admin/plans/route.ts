import { requireAdmin } from "@/lib/admin/require-admin";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getAdminPlanConfigs } from "@/lib/plan-config";

function paystackMode() {
  const key = process.env.PAYSTACK_SECRET_KEY ?? "";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return null;
}

export async function GET() {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const plans = await getAdminPlanConfigs();
    return jsonOk({ plans, paystackMode: paystackMode() });
  } catch (err) {
    console.error("[admin/plans GET]", err);
    return jsonError("Could not load plans.", 500);
  }
}
