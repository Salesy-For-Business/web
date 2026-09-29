import { connectDb, Business } from "@/lib/db";
import { sendSubscriptionRenewalReminderEmail } from "@/lib/email/brevo";
import { formatMoney } from "@/lib/currencies";
import { isPaidPlanTier } from "@/lib/plan-codes";
import { getPlanConfig } from "@/lib/plan-config";
import { getPlatformSettings } from "@/lib/platform-settings";
import { jsonError, jsonOk } from "@/lib/api/http";

/**
 * Triggered daily by Vercel Cron (see `vercel.json`). Sends one reminder
 * email per business per day, for the admin-configured number of days
 * (default 7) leading up to their subscription's next renewal.
 * `lastRenewalReminderSentAt` dedupes if the cron ever fires more than once
 * in a day.
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

    const { subscriptionReminderDays } = await getPlatformSettings();
    if (subscriptionReminderDays <= 0) {
      return jsonOk({ checked: 0, sent: 0, disabled: true });
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const windowEnd = new Date(
      now.getTime() + subscriptionReminderDays * 24 * 60 * 60 * 1000,
    );

    const businesses = await Business.find({
      subscriptionStatus: "active",
      subscriptionRenewsAt: { $gte: now, $lte: windowEnd },
      $or: [
        { lastRenewalReminderSentAt: { $exists: false } },
        { lastRenewalReminderSentAt: { $lt: startOfToday } },
      ],
    });

    let sent = 0;
    for (const business of businesses) {
      if (!business.subscriptionRenewsAt) continue;
      if (!isPaidPlanTier(business.plan)) continue;

      const plan = await getPlanConfig(business.plan);
      const monthly = plan.prices[business.billingCurrency]?.monthly;
      const amountLabel =
        monthly != null
          ? formatMoney(monthly, business.billingCurrency)
          : `your ${plan.name} rate in ${business.billingCurrency}`;

      try {
        await sendSubscriptionRenewalReminderEmail({
          email: business.ownerEmail || business.businessEmail,
          businessName: business.businessName,
          planLabel: plan.name,
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
