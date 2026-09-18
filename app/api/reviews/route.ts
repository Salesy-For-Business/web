import { Types } from "mongoose";
import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, Order, Review, type ReviewLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createReviewSchema } from "@/lib/review-schemas";

function toPublicReview(doc: ReviewLean) {
  return {
    id: String(doc._id),
    name: doc.customerName,
    rating: doc.rating,
    body: doc.body,
    product: doc.productName,
    productId: doc.productId ? String(doc.productId) : null,
    orderReference: doc.orderReference,
    createdAt: doc.createdAt,
  };
}

/** Seller dashboard — reviews for the signed-in business. */
export async function GET() {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    await connectDb();
    const reviews = await Review.find({ businessId: owned.business._id })
      .sort({ createdAt: -1 })
      .lean<ReviewLean[]>();

    const avg =
      reviews.length === 0
        ? 0
        : Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
          ) / 10;

    return jsonOk({
      reviews: reviews.map(toPublicReview),
      count: reviews.length,
      averageRating: avg,
    });
  } catch (err) {
    console.error("[reviews GET]", err);
    return jsonError("Could not load reviews.", 500);
  }
}

/**
 * Public — buyers leave a review after a paid order (by payment reference).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid review");
    }

    const values = parsed.data;
    await connectDb();

    const order = await Order.findOne({
      reference: values.orderReference.trim(),
      status: "paid",
    });
    if (!order) {
      return jsonError("Paid order not found for that reference.", 404);
    }

    let productName = values.productName?.trim() ?? "";
    let productId: Types.ObjectId | undefined;

    if (values.productId && Types.ObjectId.isValid(values.productId)) {
      const line = order.items.find(
        (i) => String(i.productId) === values.productId,
      );
      if (!line) {
        return jsonError("That product was not on this order.");
      }
      productId = line.productId as Types.ObjectId;
      productName = line.name;
    } else if (productName) {
      const line = order.items.find(
        (i) => i.name.toLowerCase() === productName.toLowerCase(),
      );
      if (line) {
        productId = line.productId as Types.ObjectId;
        productName = line.name;
      }
    } else if (order.items.length === 1) {
      productId = order.items[0].productId as Types.ObjectId;
      productName = order.items[0].name;
    } else {
      return jsonError("Choose which product you’re reviewing.");
    }

    if (!productName) {
      return jsonError("Choose which product you’re reviewing.");
    }

    const duplicate = await Review.findOne({
      orderId: order._id,
      ...(productId
        ? { productId }
        : { productName }),
    });
    if (duplicate) {
      return jsonError("You’ve already reviewed this item for this order.", 409);
    }

    const review = await Review.create({
      businessId: order.businessId,
      orderId: order._id,
      orderReference: order.reference,
      productId,
      productName,
      customerName:
        values.customerName?.trim() || order.customer.name,
      customerEmail: order.customer.email,
      rating: values.rating,
      body: values.body.trim(),
    });

    return jsonOk(
      { review: toPublicReview(review.toObject() as ReviewLean) },
      { status: 201 },
    );
  } catch (err) {
    console.error("[reviews POST]", err);
    const message = String(err);
    if (message.includes("E11000")) {
      return jsonError("You’ve already reviewed this item for this order.", 409);
    }
    return jsonError("Could not submit review.", 500);
  }
}
