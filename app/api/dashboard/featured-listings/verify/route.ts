import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, FeaturedListingOrder, Product } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { verifyTransaction } from "@/lib/paystack";
import { markFeaturedListingPaid } from "@/lib/featured-listings";

/**
 * Confirms a featured-listing payment directly from the browser on return
 * from Paystack — the webhook (`/api/paystack/webhook`) does the same job,
 * but can't reach `localhost` in local dev, and may lag in production. This
 * mirrors `/api/checkout/verify`'s pattern so featuring a product works the
 * same way checkout does, independent of whether the webhook ever fires.
 */
export async function GET(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference")?.trim();
    if (!reference) {
      return jsonError("Missing payment reference.");
    }

    await connectDb();
    const order = await FeaturedListingOrder.findOne({
      reference,
      businessId: owned.business._id,
    });
    if (!order) {
      return jsonError("Featured-listing order not found.", 404);
    }

    if (order.status === "paid") {
      const product = await Product.findById(order.productId).select("featuredUntil");
      return jsonOk({
        status: "paid" as const,
        featuredUntil: product?.featuredUntil ?? null,
      });
    }

    const verified = await verifyTransaction(reference);
    if (verified.status !== "success") {
      order.status = "failed";
      await order.save();
      return jsonError("Payment was not successful.", 402);
    }

    const result = await markFeaturedListingPaid(reference);
    if (!result.ok) {
      return jsonError(result.error ?? "Could not confirm payment.", 500);
    }

    const product = await Product.findById(order.productId).select("featuredUntil");
    return jsonOk({
      status: "paid" as const,
      featuredUntil: product?.featuredUntil ?? null,
    });
  } catch (err) {
    console.error("[dashboard/featured-listings/verify]", err);
    const message =
      err instanceof Error ? err.message : "Could not verify payment.";
    return jsonError(message, 500);
  }
}
