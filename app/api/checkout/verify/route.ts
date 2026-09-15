import { connectDb, Order } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { verifyTransaction } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/orders";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference")?.trim();
    if (!reference) {
      return jsonError("Missing payment reference.");
    }

    await connectDb();
    const existing = await Order.findOne({ reference }).lean();
    if (!existing) {
      return jsonError("Order not found.", 404);
    }

    if (existing.status === "paid") {
      return jsonOk({
        status: "paid" as const,
        reference,
        orderId: String(existing._id),
        total: existing.total,
        storeHandle: existing.storeHandle,
      });
    }

    const verified = await verifyTransaction(reference);
    if (verified.status !== "success") {
      await Order.updateOne({ reference }, { status: "failed" });
      return jsonError("Payment was not successful.", 402);
    }

    const result = await markOrderPaid(reference);
    if (!result.ok || !result.order) {
      return jsonError(result.error ?? "Could not confirm order.", 500);
    }

    return jsonOk({
      status: "paid" as const,
      reference,
      orderId: String(result.order._id),
      total: result.order.total,
      storeHandle: result.order.storeHandle,
    });
  } catch (err) {
    console.error("[checkout/verify]", err);
    const message =
      err instanceof Error ? err.message : "Could not verify payment.";
    return jsonError(message, 500);
  }
}
