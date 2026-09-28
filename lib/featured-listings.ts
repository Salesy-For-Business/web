import { connectDb, FeaturedListingOrder, Product } from "@/lib/db";

export async function markFeaturedListingPaid(reference: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  await connectDb();
  const order = await FeaturedListingOrder.findOne({ reference });
  if (!order) {
    return { ok: false, error: "Featured-listing order not found." };
  }
  if (order.status === "paid") {
    return { ok: true };
  }

  order.status = "paid";
  order.paidAt = new Date();
  await order.save();

  const product = await Product.findById(order.productId);
  if (product) {
    const now = new Date();
    // Renewing before the current slot expires extends it rather than
    // wasting the remaining days.
    const base =
      product.featuredUntil && product.featuredUntil > now
        ? product.featuredUntil
        : now;
    product.featuredUntil = new Date(
      base.getTime() + order.weeks * 7 * 24 * 60 * 60 * 1000,
    );
    await product.save();
  }

  return { ok: true };
}
