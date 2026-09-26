import { connectDb, Business } from "@/lib/db";
import { sendSubscriptionRenewalReminderEmail } from "@/lib/email/brevo";
import { formatMoney } from "@/lib/currencies";
import { planLabel } from "@/lib/plans";
import { planCodeFor, type PaidPlanTier } from "@/lib/plan-codes";
import { jsonError, jsonOk } from "@/lib/api/http";

/**
 * Triggered daily by Vercel Cron (see `vercel.json`). Sends one reminder
 * email per business per day, for the 7 days leading up to their
 * subscription's next renewal — per the confirmed subscription-lifecycle
 * decision. `lastRenewalReminderSentAt` dedupes if the cron ever fires more
 * than once in a day.
 */
export async function GET(request: Request) {
  // Vercel signs cron requests with this header; also accept a manually
  // configured secret for local/manual testing.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    await connectDb();

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const businesses = await Business.find({
      subscriptionStatus: "active",
      subscriptionRenewsAt: { $gte: now, $lte: weekOut },
      $or: [
        { lastRenewalReminderSentAt: { $exists: false } },
        { lastRenewalReminderSentAt: { $lt: startOfToday } },
      ],
    });

    let sent = 0;
    for (const business of businesses) {
      if (!business.subscriptionRenewsAt) continue;
      const tier = business.plan as PaidPlanTier;
      if (tier !== "boutique" && tier !== "pro") continue;

      // Amount label is illustrative — the real charge comes from the
      // Paystack Plan itself; we don't store the plan's price locally.
      const planCode = planCodeFor(tier, business.billingCurrency);
      const amountLabel = planCode
        ? `your ${planLabel(tier)} rate in ${business.billingCurrency}`
        : formatMoney(0, business.billingCurrency);

      try {
        await sendSubscriptionRenewalReminderEmail({
          email: business.ownerEmail || business.businessEmail,
          businessName: business.businessName,
          planLabel: planLabel(tier),
          renewsAt: business.subscriptionRenewsAt,
          amountLabel,
        });
        business.lastRenewalReminderSentAt = now;
        await business.save();
        sent += 1;
      } catch (err) {
        console.error(
          "[cron/subscription-reminders] failed for",
          business._id,
          err,
        );
      }
    }

    return jsonOk({ checked: businesses.length, sent });
  } catch (err) {
    console.error("[cron/subscription-reminders]", err);
    return jsonError("Reminder run failed.", 500);
  }
}
