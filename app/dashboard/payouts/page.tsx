"use client";

import { CheckCircle2, Wallet } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { planLabel, useAuthStore } from "@/lib/auth-store";
import { findCurrency } from "@/lib/currencies";

export default function PayoutsPage() {
  const business = useAuthStore((s) => s.business);
  const plan = business?.plan ?? "free";
  const percentage = business?.subaccountPercentageCharge ?? 5;
  const storeCurrency = findCurrency(business?.storeCurrency);

  return (
    <div>
      <DashboardPageHeader
        title="Payouts"
        description="Paystack pays your share of every sale directly to your bank account — Salesy never holds your funds."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-background p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-tonal text-link">
            <Wallet className="size-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-[18px] leading-7">Bank account on file</h2>
          {business?.bankAccountName ? (
            <dl className="mt-4 space-y-3 text-[14px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Account name</dt>
                <dd className="font-medium text-heading">
                  {business.bankAccountName}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Account number</dt>
                <dd className="font-medium text-heading">
                  •••• {business.bankAccountNumberLast4}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Currency</dt>
                <dd className="font-medium text-heading">
                  {storeCurrency.symbol} {storeCurrency.name}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-[14px] text-muted">
              No bank account on file yet.
            </p>
          )}
          <p className="mt-6 text-[13px] leading-5 text-muted">
            To change your bank details, contact support — we lock this after
            setup to protect your payouts from account takeover.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-tonal text-link">
            <CheckCircle2 className="size-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-[18px] leading-7">How you get paid</h2>
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-muted">
            <li>
              Every sale splits automatically at checkout — you keep{" "}
              <span className="font-medium text-heading">
                {100 - percentage}%
              </span>
              {percentage > 0 ? (
                <> ({percentage}% Salesy fee on the {planLabel(plan)} plan).</>
              ) : (
                <> (no Salesy commission on the {planLabel(plan)} plan).</>
              )}
            </li>
            <li>
              Paystack settles your share straight to the account above,
              typically within one business day.
            </li>
            <li>There’s nothing to withdraw manually — it just arrives.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
