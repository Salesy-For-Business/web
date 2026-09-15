import { Types } from "mongoose";
import { connectDb, Order, Product, type OrderLean } from "@/lib/db";

export async function markOrderPaid(reference: string): Promise<{
  ok: boolean;
  order?: OrderLean;
  error?: string;
}> {
  await connectDb();
  const order = await Order.findOne({ reference });
  if (!order) {
    return { ok: false, error: "Order not found." };
  }
  if (order.status === "paid") {
    return { ok: true, order: order.toObject() as OrderLean };
  }

  order.status = "paid";
  order.paidAt = new Date();
  await order.save();

  for (const item of order.items) {
    if (!Types.ObjectId.isValid(item.productId)) continue;
    const product = await Product.findById(item.productId);
    if (!product || product.stockQty == null) continue;
    product.stockQty = Math.max(0, product.stockQty - item.qty);
    if (product.stockQty === 0) product.inStock = false;
    await product.save();
  }

  return { ok: true, order: order.toObject() as OrderLean };
}
