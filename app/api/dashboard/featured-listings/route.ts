import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, FeaturedListingOrder, Product, type ProductLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getFeaturedListingWeeklyPrice } from "@/lib/platform-settings";
import { featureProductSchema } from "@/lib/featured-listing-schemas";
import {
  initializeTransaction,
  makeFeaturedListingReference,
} from "@/lib/paystack";

function isCurrentlyFeatured(product: Pick<ProductLean, "featuredUntil">) {
  return Boolean(product.featuredUntil && product.featuredUntil > new Date());
}

export async function GET() {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    await connectDb();
    const currency = owned.business.storeCurrency || "NGN";
    const [products, weeklyPriceMinorUnits] = await Promise.all([
      Product.find({ businessId: owned.business._id })
        .select("name images price featuredUntil")
        .sort({ createdAt: -1 })
        .lean<ProductLean[]>(),
      getFeaturedListingWeeklyPrice(currency),
    ]);

    const currentlyFeatured = products.find(isCurrentlyFeatured) ?? null;

    return jsonOk({
      currency,
      weeklyPriceMinorUnits,
      products: products.map((p) => ({
        id: String(p._id),
        name: p.name,
        image: p.images?.[0] ?? null,
        price: p.price,
        featuredUntil: p.featuredUntil ?? null,
      })),
      currentlyFeatured: currentlyFeatured
        ? {
            productId: String(currentlyFeatured._id),
            featuredUntil: currentlyFeatured.featuredUntil,
          }
        : null,
    });
  } catch (err) {
    console.error("[dashboard/featured-listings GET]", err);
    return jsonError("Could not load featured-listing data.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    // Defense-in-depth: the dashboard shell already blocks any signed-in
    // business without a subaccount from reaching this page at all.
    if (!owned.business.paystackSubaccountCode) {
      return jsonError("Complete payout setup before featuring a product.", 409);
    }

    const body = await request.json();
    const parsed = featureProductSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");
    }
    const { productId, weeks } = parsed.data;

    await connectDb();
    const businessId = owned.business._id;

    const product = await Product.findOne({ _id: productId, businessId });
    if (!product) return jsonError("Product not found.", 404);

    const now = new Date();
    const activeFeatured = await Product.findOne({
      businessId,
      featuredUntil: { $gt: now },
    }).select("_id");
    if (activeFeatured && String(activeFeatured._id) !== String(product._id)) {
      return jsonError(
        "You already have a featured product — wait for it to expire before featuring another.",
        409,
      );
    }

    const currency = owned.business.storeCurrency || "NGN";
    const weeklyPriceMinorUnits = await getFeaturedListingWeeklyPrice(currency);
    if (weeklyPriceMinorUnits == null) {
      return jsonError(`Featured listings aren't available in ${currency} yet.`, 422);
    }
    const amountMinorUnits = weeklyPriceMinorUnits * weeks;

    const reference = makeFeaturedListingReference();
    await FeaturedListingOrder.create({
      businessId,
      productId: product._id,
      reference,
      weeks,
      amountMinorUnits,
      currency,
      status: "pending",
    });

    const appUrl = new URL(request.url).origin;
    const init = await initializeTransaction({
      email: owned.business.ownerEmail || owned.business.businessEmail,
      amountMinorUnits,
      reference,
      callbackUrl: `${appUrl}/dashboard/featured-listings?reference=${encodeURIComponent(reference)}`,
      channels: ["card", "bank_transfer", "ussd"],
      currency,
      metadata: { kind: "featured-listing", productId: String(product._id) },
    });

    return jsonOk({ authorizationUrl: init.authorization_url });
  } catch (err) {
    console.error("[dashboard/featured-listings POST]", err);
    const message =
      err instanceof Error ? err.message : "Could not start payment.";
    return jsonError(message, 500);
  }
}
