import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import {
  createCustomer,
  initializeSubscriptionCharge,
} from "@/lib/paystack";
import { planCodeFor, type PaidPlanTier } from "@/lib/plan-codes";
import { jsonError, jsonOk } from "@/lib/api/http";
import { Business } from "@/lib/db";

const upgradeSchema = z.object({
  tier: z.enum(["boutique", "pro"]),
});

/**
 * Kicks off a Paystack-hosted checkout tied to a recurring Plan for the
 * requested tier. Does NOT flip `business.plan` or the subaccount split
 * itself — only the confirmed `subscription.create` webhook event does
 * that (see `/api/paystack/webhook`), so an abandoned browser tab can't
 * desync state. Also used by the "Retry payment" dashboard action after a
 * failed/lapsed subscription — same flow, fresh checkout.
 */
export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    if (!owned.business.paystackSubaccountCode) {
      return jsonError("Add your payout details before upgrading.", 409);
    }

    const body = await request.json();
    const parsed = upgradeSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid plan");
    }
    const tier: PaidPlanTier = parsed.data.tier;
    const billingCurrency = owned.business.billingCurrency || "NGN";

    const planCode = planCodeFor(tier, billingCurrency);
    if (!planCode) {
      return jsonError(
        `${tier === "boutique" ? "Boutique" : "Pro"} isn't available in ${billingCurrency} yet.`,
        422,
      );
    }

    await connectDb();

    let customerCode = owned.business.paystackCustomerCode;
    if (!customerCode) {
      const [firstName, ...rest] = owned.business.ownerFirstName
        ? [owned.business.ownerFirstName, owned.business.ownerLastName]
        : [];
      const customer = await createCustomer({
        email: owned.business.ownerEmail || owned.business.businessEmail,
        firstName,
        lastName: rest.join(" ") || undefined,
        phone: owned.business.ownerPhone,
      });
      customerCode = customer.customer_code;
      await Business.updateOne(
        { _id: owned.business._id },
        { paystackCustomerCode: customerCode },
      );
    }

    const appUrl = new URL(request.url).origin;
    const reference = `SLY-SUB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const callbackUrl = `${appUrl}/dashboard/settings?upgraded=1`;

    const init = await initializeSubscriptionCharge({
      email: owned.business.ownerEmail || owned.business.businessEmail,
      reference,
      callbackUrl,
      planCode,
      currency: billingCurrency,
    });

    return jsonOk({ authorizationUrl: init.authorization_url });
  } catch (err) {
    console.error("[business/upgrade]", err);
    const message =
      err instanceof Error ? err.message : "Could not start upgrade.";
    return jsonError(message, 500);
  }
}
