import { jsonError, jsonOk } from "@/lib/api/http";
import { getPublicPlans } from "@/lib/plan-config";

/** Public plan catalog — prices, limits, features. Never includes plan codes. */
export async function GET() {
  try {
    const plans = await getPublicPlans();
    return jsonOk({ plans });
  } catch (err) {
    console.error("[plans GET]", err);
    return jsonError("Could not load plans.", 500);
  }
}
