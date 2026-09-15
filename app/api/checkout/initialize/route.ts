import { Types } from "mongoose";
import { connectDb, Business, Order, Product } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { checkoutInitializeSchema } from "@/lib/product-schemas";
import { salesyFeeRate } from "@/lib/plans";
import {
  channelsForMethod,
  initializeTransaction,
  makeOrderReference,
} from "@/lib/paystack";
import { normalizeStoreHandle } from "@/lib/storefront";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutInitializeSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Invalid checkout details",
      );
    }

    const values = parsed.data;
    const handle = normalizeStoreHandle(values.storeHandle);
    await connectDb();

    const business = await Business.findOne({ storeHandle: handle });
    if (!business) {
      return jsonError("Store not found.", 404);
    }

    const lineItems: {
      productId: Types.ObjectId;
      name: string;
      slug: string;
      qty: number;
      unitPrice: number;
    }[] = [];

    let subtotal = 0;
    for (const item of values.items) {
      if (!Types.ObjectId.isValid(item.productId)) {
        return jsonError("One of the products is invalid.");
      }
      const product = await Product.findOne({
        _id: item.productId,
        businessId: business._id,
      });
      if (!product) {
        return jsonError("A product in your cart is no longer available.");
      }
      if (!product.inStock) {
        return jsonError(`${product.name} is out of stock.`);
      }
      if (
        product.stockQty != null &&
        product.stockQty < item.qty
      ) {
        return jsonError(`Only ${product.stockQty} left of ${product.name}.`);
      }

      lineItems.push({
        productId: product._id as Types.ObjectId,
        name: product.name,
        slug: product.slug,
        qty: item.qty,
        unitPrice: product.price,
      });
      subtotal += product.price * item.qty;
    }

    const feeRate = salesyFeeRate(business.plan);
    const feeAmount = Math.round(subtotal * feeRate);
    const total = subtotal;
    const reference = makeOrderReference();

    await Order.create({
      businessId: business._id,
      storeHandle: handle,
      reference,
      status: "pending",
      customer: {
        name: values.customer.name.trim(),
        email: values.customer.email.trim().toLowerCase(),
        phone: values.customer.phone.trim(),
      },
      items: lineItems,
      subtotal,
      feeAmount,
      total,
      channel: values.method,
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const callbackUrl = `${appUrl}/${handle}/checkout/success?reference=${encodeURIComponent(reference)}`;

    const init = await initializeTransaction({
      email: values.customer.email.trim().toLowerCase(),
      amountKobo: Math.round(total * 100),
      reference,
      callbackUrl,
      channels: channelsForMethod(values.method),
      metadata: {
        storeHandle: handle,
        businessId: String(business._id),
        address: values.address,
        notes: values.notes ?? "",
      },
    });

    return jsonOk({
      authorizationUrl: init.authorization_url,
      reference: init.reference,
      accessCode: init.access_code,
    });
  } catch (err) {
    console.error("[checkout/initialize]", err);
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    return jsonError(message, 500);
  }
}
