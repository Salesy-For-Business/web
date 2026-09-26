import { Types } from "mongoose";
import { connectDb, Business, Order, Product } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { checkoutInitializeSchema } from "@/lib/product-schemas";
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
    // Hard gate: no subaccount means there's nowhere to send the seller's
    // share of the money, so don't let a buyer pay into the void.
    if (!business.paystackSubaccountCode) {
      return jsonError("This store isn't ready to accept payments yet.", 409);
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

    // The subaccount's cached percentage_charge is the authoritative split
    // rate — not `salesyFeeRate(business.plan)`, which is just what the
    // dashboard used to *display*. This is what Paystack is actually about
    // to split at the gateway.
    const percentageCharge = business.paystackSubaccountPercentageCharge ?? 5;
    const feeAmount = Math.round(subtotal * (percentageCharge / 100));
    const sellerAmount = subtotal - feeAmount;
    const total = subtotal;
    const currency = business.storeCurrency || "NGN";
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
      currency,
      sellerAmount,
      platformAmount: feeAmount,
      total,
      channel: values.method,
    });

    // Derive from the incoming request, not NEXT_PUBLIC_APP_URL: that env
    // var points at the canonical public domain, but a Paystack callback
    // must round-trip to whichever environment actually started checkout
    // (localhost in dev, a preview deploy, production). Hardcoding it here
    // sent local test-mode payments back to production, whose verify call
    // then used the live secret key against a test-mode reference — which
    // Paystack correctly reports as "Transaction reference not found".
    const appUrl = new URL(request.url).origin;
    const callbackUrl = `${appUrl}/${handle}/checkout/success?reference=${encodeURIComponent(reference)}`;

    const init = await initializeTransaction({
      email: values.customer.email.trim().toLowerCase(),
      amountMinorUnits: Math.round(total * 100),
      reference,
      callbackUrl,
      channels: channelsForMethod(values.method),
      currency,
      subaccount: business.paystackSubaccountCode,
      bearer: "account",
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
