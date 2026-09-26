"use client";

import { useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import {
  getApiError,
  useCancelSubscriptionMutation,
  useUpgradePlanMutation,
} from "@/lib/auth/queries";
import { planLabel, useAuthStore } from "@/lib/auth-store";

const TIERS: { id: "boutique" | "pro"; label: string }[] = [
  { id: "boutique", label: "Boutique" },
  { id: "pro", label: "Pro" },
];

export function BillingSettings() {
  const business = useAuthStore((s) => s.business);
  const upgrade = useUpgradePlanMutation();
  const cancel = useCancelSubscriptionMutation();
  const [pendingTier, setPendingTier] = useState<"boutique" | "pro" | null>(
    null,
  );

  if (!business) return null;

  const plan = business.plan;
  const status = business.subscriptionStatus;
  const wasEverPaid = status === "past_due" || status === "cancelled";

  async function startUpgrade(tier: "boutique" | "pro") {
    setPendingTier(tier);
    try {
      const data = await upgrade.mutateAsync(tier);
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      toast.error(getApiError(err, "Could not start upgrade."));
      setPendingTier(null);
    }
  }

  async function onCancel() {
    try {
      await cancel.mutateAsync();
      toast.success("Subscription cancelled. You're back on the Free plan.");
    } catch (err) {
      toast.error(getApiError(err, "Could not cancel subscription."));
    }
  }

  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h2 className="text-[18px] leading-7">Store plan</h2>
      <p className="mt-2 text-[14px] text-muted">
        Current plan:{" "}
        <span className="font-medium text-heading">{planLabel(plan)}</span>
        {plan === "free" ? (
          <> — Salesy keeps 5% of every sale.</>
        ) : (
          <> — Salesy takes no commission; billed in {business.billingCurrency}.</>
        )}
      </p>

      {status === "active" && business.subscriptionRenewsAt ? (
        <p className="mt-1 text-[13px] text-muted">
          Renews {new Date(business.subscriptionRenewsAt).toLocaleDateString()}.
        </p>
      ) : null}

      {plan === "free" ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              type="button"
              disabled={upgrade.isPending}
              onClick={() => void startUpgrade(tier.id)}
              className={clsx(primaryButtonClass, "w-auto px-5")}
            >
              {upgrade.isPending && pendingTier === tier.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {wasEverPaid ? "Retry" : "Upgrade to"} {tier.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          disabled={cancel.isPending}
          onClick={() => void onCancel()}
          className={clsx(secondaryButtonClass, "mt-4 w-auto px-5 text-red-600")}
        >
          {cancel.isPending ? "Cancelling…" : "Cancel subscription"}
        </button>
      )}

      {wasEverPaid && plan === "free" ? (
        <p className="mt-3 text-[13px] text-muted">
          Your last subscription payment didn’t go through, so you’re back on
          Free for now — retry anytime once your card is ready.
        </p>
      ) : null}
    </section>
  );
}
