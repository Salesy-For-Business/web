import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, Business, type BusinessLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

function toPublic(b: BusinessLean) {
  return {
    id: String(b._id),
    businessName: b.businessName,
    businessEmail: b.businessEmail,
    businessPhone: b.businessPhone,
    description: b.description,
    plan: b.plan,
    storeHandle: b.storeHandle,
    subscriptionStatus: b.subscriptionStatus,
    suspended: Boolean(b.suspended),
    hasPayoutSetup: Boolean(b.paystackSubaccountCode),
    storeCurrency: b.storeCurrency,
    billingCurrency: b.billingCurrency,
    createdAt: b.createdAt,
  };
}

const updateSchema = z.object({
  businessName: z.string().trim().min(1).optional(),
  businessEmail: z.string().trim().email().optional(),
  businessPhone: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  plan: z.enum(["free", "boutique", "pro"]).optional(),
  subscriptionStatus: z.enum(["none", "active", "past_due", "cancelled"]).optional(),
  suspended: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const business = await Business.findById(id).lean<BusinessLean | null>();
    if (!business) return jsonError("Business not found.", 404);

    return jsonOk({ business: toPublic(business) });
  } catch (err) {
    console.error("[admin/businesses/:id GET]", err);
    return jsonError("Could not load business.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid update");
    }

    await connectDb();
    const before = await Business.findById(id).lean<BusinessLean | null>();
    if (!before) return jsonError("Business not found.", 404);

    const business = await Business.findByIdAndUpdate(id, parsed.data, {
      new: true,
    }).lean<BusinessLean | null>();
    if (!business) return jsonError("Business not found.", 404);

    const changedKeys = Object.keys(parsed.data);
    const beforeValues = Object.fromEntries(
      changedKeys.map((k) => [k, (before as unknown as Record<string, unknown>)[k]]),
    );
    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "business.update",
      targetType: "business",
      targetId: id,
      metadata: { before: beforeValues, after: parsed.data },
    });

    return jsonOk({ business: toPublic(business) });
  } catch (err) {
    console.error("[admin/businesses/:id PATCH]", err);
    return jsonError("Could not update business.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const business = await Business.findByIdAndDelete(id).lean<BusinessLean | null>();
    if (!business) return jsonError("Business not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "business.delete",
      targetType: "business",
      targetId: id,
      metadata: { businessName: business.businessName, storeHandle: business.storeHandle },
    });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[admin/businesses/:id DELETE]", err);
    return jsonError("Could not delete business.", 500);
  }
}
