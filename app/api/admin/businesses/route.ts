import { requireAdmin } from "@/lib/admin/require-admin";
import { connectDb, Business, type BusinessLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

function toPublic(b: BusinessLean) {
  return {
    id: String(b._id),
    businessName: b.businessName,
    businessEmail: b.businessEmail,
    businessPhone: b.businessPhone,
    plan: b.plan,
    storeHandle: b.storeHandle,
    subscriptionStatus: b.subscriptionStatus,
    suspended: Boolean(b.suspended),
    hasPayoutSetup: Boolean(b.paystackSubaccountCode),
    createdAt: b.createdAt,
  };
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    await connectDb();
    const filter = q
      ? {
          $or: [
            { businessName: { $regex: q, $options: "i" } },
            { businessEmail: { $regex: q, $options: "i" } },
            { storeHandle: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const businesses = await Business.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<BusinessLean[]>();

    return jsonOk({ businesses: businesses.map(toPublic) });
  } catch (err) {
    console.error("[admin/businesses GET]", err);
    return jsonError("Could not load businesses.", 500);
  }
}
