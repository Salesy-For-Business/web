import { requireAdmin } from "@/lib/admin/require-admin";
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
    total: o.total,
    currency: o.currency,
    channel: o.channel,
    createdAt: o.createdAt,
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
            { reference: { $regex: q, $options: "i" } },
            { storeHandle: { $regex: q, $options: "i" } },
            { "customer.email": { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<OrderLean[]>();

    return jsonOk({ orders: orders.map(toPublic) });
  } catch (err) {
    console.error("[admin/orders GET]", err);
    return jsonError("Could not load orders.", 500);
  }
}
