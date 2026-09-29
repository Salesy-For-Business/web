import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, Order, type OrderLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

function toPublic(o: OrderLean) {
  return {
    id: String(o._id),
    reference: o.reference,
    storeHandle: o.storeHandle,
    status: o.status,
    customerName: o.customer.name,
    customerEmail: o.customer.email,
    subtotal: o.subtotal,
    total: o.total,
    sellerAmount: o.sellerAmount,
    platformAmount: o.platformAmount,
    currency: o.currency,
    channel: o.channel,
    createdAt: o.createdAt,
  };
}

const updateSchema = z.object({
  status: z.enum(["pending", "paid", "failed"]),
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
    const order = await Order.findById(id).lean<OrderLean | null>();
    if (!order) return jsonError("Order not found.", 404);

    return jsonOk({ order: toPublic(order) });
  } catch (err) {
    console.error("[admin/orders/:id GET]", err);
    return jsonError("Could not load order.", 500);
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
    const order = await Order.findByIdAndUpdate(
      id,
      { status: parsed.data.status },
      { new: true },
    ).lean<OrderLean | null>();
    if (!order) return jsonError("Order not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "order.update_status",
      targetType: "order",
      targetId: id,
      metadata: { status: parsed.data.status },
    });

    return jsonOk({ order: toPublic(order) });
  } catch (err) {
    console.error("[admin/orders/:id PATCH]", err);
    return jsonError("Could not update order.", 500);
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
    const order = await Order.findByIdAndDelete(id).lean<OrderLean | null>();
    if (!order) return jsonError("Order not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "order.delete",
      targetType: "order",
      targetId: id,
      metadata: { reference: order.reference },
    });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[admin/orders/:id DELETE]", err);
    return jsonError("Could not delete order.", 500);
  }
}
