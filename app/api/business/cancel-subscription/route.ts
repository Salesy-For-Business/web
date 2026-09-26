import { connectDb, Business } from "@/lib/db";
import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import {
  disableSubscription,
  fetchSubscription,
  updateSubaccountPercentageCharge,
} from "@/lib/paystack";
import { jsonError, jsonOk } from "@/lib/api/http";

/** User-initiated cancellation. Fetches the subscription first for its
 * `email_token` (required by Paystack's disable endpoint, not something we
 * store), then applies the same downgrade-to-Free steps the webhook uses
 * for a lapsed subscription. */
export async function POST() {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const subscriptionCode = owned.business.paystackSubscriptionCode;
    if (!subscriptionCode) {
      return jsonError("No active subscription to cancel.", 409);
    }

    const subscription = await fetchSubscription(subscriptionCode);
    const emailToken = (subscription as { email_token?: string }).email_token;
    if (!emailToken) {
      return jsonError("Could not verify your subscription. Try again.", 500);
    }

    await disableSubscription({ code: subscriptionCode, token: emailToken });

    await connectDb();
    await Business.updateOne(
      { _id: owned.business._id },
      {
        plan: "free",
        subscriptionStatus: "cancelled",
        paystackSubaccountPercentageCharge: 5,
      },
    );
    if (owned.business.paystackSubaccountCode) {
      await updateSubaccountPercentageCharge(
        owned.business.paystackSubaccountCode,
        5,
      );
    }

    return jsonOk({ cancelled: true });
  } catch (err) {
    console.error("[business/cancel-subscription]", err);
    const message =
      err instanceof Error ? err.message : "Could not cancel subscription.";
    return jsonError(message, 500);
  }
}
