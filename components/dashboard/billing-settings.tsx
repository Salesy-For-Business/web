"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, Loader2 } from "lucide-react";
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
import { useAuthStore } from "@/lib/auth-store";
import { formatMoney } from "@/lib/currencies";
import { usePlanConfig, usePlansQuery } from "@/lib/plans-queries";

type PaidTier = "boutique" | "pro";

export function BillingSettings() {
  const business = useAuthStore((s) => s.business);
  const upgrade = useUpgradePlanMutation();
  const cancel = useCancelSubscriptionMutation();
  const { data: plans, isPlaceholderData } = usePlansQuery();
  const current = usePlanConfig(business?.plan ?? "free");
  const [pendingTier, setPendingTier] = useState<PaidTier | null>(null);

  if (!business) return null;

  const plan = business.plan;
  const status = business.subscriptionStatus;
  const wasEverPaid = status === "past_due" || status === "cancelled";
  const currency = business.billingCurrency;

  const paidTiers = (plans ?? []).filter(
    (p): p is typeof p & { id: PaidTier } =>
      (p.id === "boutique" || p.id === "pro") &&
      p.active &&
      p.subscribableCurrencies.includes(currency),
  );

  async function startUpgrade(tier: PaidTier) {
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
    <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
      <h2 className="text-[18px] leading-7">Store plan</h2>
      <p className="mt-2 text-[14px] text-muted">
        Current plan:{" "}
        <span className="font-medium text-heading">{current.name}</span>
        {current.commissionPercent > 0 ? (
          <> — Salesy keeps {current.commissionPercent}% of every sale.</>
        ) : (
          <> — Salesy takes no commission; billed in {currency}.</>
        )}
      </p>

      {status === "active" && business.subscriptionRenewsAt ? (
        <p className="mt-1 text-[13px] text-muted">
          Renews {new Date(business.subscriptionRenewsAt).toLocaleDateString()}.
        </p>
      ) : null}

      {plan === "free" ? (
        isPlaceholderData ? (
          <p className="mt-4 text-[14px] text-muted">Loading plans…</p>
        ) : paidTiers.length === 0 ? (
          <p className="mt-4 text-[14px] text-muted">
            Paid plans aren’t available in {currency} yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {paidTiers.map((tier) => {
              const monthly = tier.prices[currency]?.monthly;
              return (
                <div
                  key={tier.id}
                  className={clsx(
                    "flex flex-col rounded-lg border p-4",
                    tier.featured ? "border-primary" : "border-border",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[15px] font-medium text-heading">{tier.name}</p>
                    {monthly != null ? (
                      <p className="text-[14px] text-heading">
                        {formatMoney(monthly, currency)}
                        <span className="text-muted">/mo</span>
                      </p>
                    ) : null}
                  </div>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {tier.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={upgrade.isPending}
                    onClick={() => void startUpgrade(tier.id)}
                    className={clsx(primaryButtonClass, "mt-4 h-11")}
                  >
                    {upgrade.isPending && pendingTier === tier.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {wasEverPaid ? "Retry" : "Upgrade to"} {tier.name}
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <button
          type="button"
          disabled={cancel.isPending}
          onClick={() => void onCancel()}
          className={clsx(secondaryButtonClass, "mt-4 px-5 text-red-600 sm:w-auto")}
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
