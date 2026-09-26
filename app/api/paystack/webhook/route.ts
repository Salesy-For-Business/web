import { createHmac, timingSafeEqual } from "crypto";
import { jsonError, jsonOk } from "@/lib/api/http";
import { markOrderPaid } from "@/lib/orders";
import { connectDb, Business, type BusinessDocument } from "@/lib/db";
import { updateSubaccountPercentageCharge } from "@/lib/paystack";
import { planCodeFor, type PaidPlanTier } from "@/lib/plan-codes";
import {
  sendSubscriptionPaymentFailedEmail,
} from "@/lib/email/brevo";
import { planLabel } from "@/lib/plans";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    plan?: { plan_code?: string } | string;
    subscription_code?: string;
    customer?: { email?: string; customer_code?: string };
    next_payment_date?: string;
  };
};

function planCodeFromEventData(
  data: NonNullable<PaystackWebhookEvent["data"]>,
) {
  return typeof data.plan === "string" ? data.plan : data.plan?.plan_code;
}

/** Which (tier, currency) a Paystack plan code belongs to, per the static
 * map in `lib/plan-codes.ts`. */
function tierForPlanCode(planCode: string): PaidPlanTier | null {
  const tiers: PaidPlanTier[] = ["boutique", "pro"];
  const currencies = ["NGN", "GHS", "ZAR", "KES"] as const;
  for (const tier of tiers) {
    for (const currency of currencies) {
      if (planCodeFor(tier, currency) === planCode) return tier;
    }
  }
  return null;
}

async function findBusinessForEvent(
  data: NonNullable<PaystackWebhookEvent["data"]>,
): Promise<BusinessDocument | null> {
  await connectDb();
  if (data.customer?.customer_code) {
    const byCustomer = await Business.findOne({
      paystackCustomerCode: data.customer.customer_code,
    });
    if (byCustomer) return byCustomer;
  }
  if (data.subscription_code) {
    const bySubscription = await Business.findOne({
      paystackSubscriptionCode: data.subscription_code,
    });
    if (bySubscription) return bySubscription;
  }
  if (data.customer?.email) {
    const byEmail = await Business.findOne({
      businessEmail: data.customer.email.trim().toLowerCase(),
    });
    if (byEmail) return byEmail;
  }
  return null;
}

/** Per the confirmed product decision: a failed/lapsed renewal charge
 * downgrades to Free immediately (no grace period) — the seller can retry
 * manually once their card is sorted, from the dashboard. */
async function downgradeToFree(business: BusinessDocument) {
  const wasPlan = business.plan;
  business.plan = "free";
  business.subscriptionStatus = "past_due";
  business.paystackSubaccountPercentageCharge = 5;
  await business.save();

  if (business.paystackSubaccountCode) {
    try {
      await updateSubaccountPercentageCharge(
        business.paystackSubaccountCode,
        5,
      );
    } catch (err) {
      console.error(
        "[paystack/webhook] failed to revert subaccount split",
        err,
      );
    }
  }

  try {
    await sendSubscriptionPaymentFailedEmail({
      email: business.businessEmail,
      businessName: business.businessName,
      planLabel: planLabel(wasPlan),
    });
  } catch (err) {
    console.error("[paystack/webhook] failed to send downgrade email", err);
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!secret) {
      // Fail closed: this webhook now grants/revokes paid-plan access and
      // flips subaccount split rates — accepting an unsigned payload would
      // let anyone POST themselves a free upgrade. Misconfiguration must be
      // loud, not silently permissive.
      console.error(
        "[paystack/webhook] PAYSTACK_WEBHOOK_SECRET is not set — rejecting all events",
      );
      return jsonError("Webhook is not configured.", 500);
    }

    const raw = await request.text();
    const signature = request.headers.get("x-paystack-signature") ?? "";
    const hash = createHmac("sha512", secret).update(raw).digest("hex");
    const a = Buffer.from(hash);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return jsonError("Invalid signature.", 401);
    }

    const event = JSON.parse(raw) as PaystackWebhookEvent;
    const data = event.data ?? {};

    switch (event.event) {
      case "charge.success": {
        // Also fires for a subscription's first charge, but that
        // activation is handled by `subscription.create` below — a
        // plan-tagged charge won't match any Order by reference, so this
        // is a no-op for it.
        if (data.reference && data.status === "success") {
          await markOrderPaid(data.reference);
        }
        break;
      }

      case "subscription.create": {
        const planCode = planCodeFromEventData(data);
        const tier = planCode ? tierForPlanCode(planCode) : null;
        const business = await findBusinessForEvent(data);
        if (!business || !tier) break;

        business.plan = tier;
        business.subscriptionStatus = "active";
        business.paystackSubscriptionCode = data.subscription_code;
        business.paystackSubscriptionPlanCode = planCode;
        business.subscriptionRenewsAt = data.next_payment_date
          ? new Date(data.next_payment_date)
          : undefined;
        business.paystackSubaccountPercentageCharge = 0;
        await business.save();

        if (business.paystackSubaccountCode) {
          try {
            await updateSubaccountPercentageCharge(
              business.paystackSubaccountCode,
              0,
            );
          } catch (err) {
            console.error(
              "[paystack/webhook] failed to update subaccount split on upgrade",
              err,
            );
          }
        }
        break;
      }

      // NOTE: verify these exact event names against current Paystack
      // docs before relying on this in production — Paystack's recurring-
      // billing failure event naming has varied across API versions
      // (candidates include `invoice.payment_failed` and `charge.failed`
      // scoped to a subscription). `subscription.disable` covers both a
      // seller-initiated cancellation and Paystack disabling a
      // subscription after repeated failed charges.
      case "subscription.disable":
      case "invoice.payment_failed": {
        const business = await findBusinessForEvent(data);
        if (!business) break;
        await downgradeToFree(business);
        break;
      }

      default:
        break;
    }

    return jsonOk({ received: true });
  } catch (err) {
    console.error("[paystack/webhook]", err);
    return jsonError("Webhook failed.", 500);
  }
}
