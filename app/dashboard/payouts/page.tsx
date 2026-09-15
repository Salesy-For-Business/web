"use client";

import { Wallet } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { WithdrawForm } from "@/components/dashboard/withdraw-form";
import { formatNaira } from "@/lib/dashboard";
import { useDashboardOverview } from "@/lib/dashboard/queries";
import { planLabel, salesyFeeRate, useAuthStore } from "@/lib/auth-store";

export default function PayoutsPage() {
  const business = useAuthStore((s) => s.business);
  const plan = business?.plan ?? "free";
  const rate = salesyFeeRate(plan);
  const { data, isPending } = useDashboardOverview("all");
  const available = data?.availableBalance ?? 0;

  return (
    <div>
      <DashboardPageHeader
        title="Payouts"
        description="Instant withdrawals to your Nigerian bank account. Salesy does not hold your funds."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="h-fit rounded-xl border border-border bg-background p-6 lg:col-span-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-tonal text-link">
            <Wallet className="size-5" aria-hidden />
          </div>
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
            Available to withdraw
          </p>
          <p className="mt-2 font-[system-ui] text-[36px] text-heading">
            {isPending ? "…" : formatNaira(available)}
          </p>
          <p className="mt-3 text-[13px] leading-5 text-muted">
            Plan: {planLabel(plan)}.{" "}
            {rate > 0
              ? `${rate * 100}% Salesy fee on Free plan sales.`
              : "No Salesy commission on this plan."}
          </p>
          <p className="mt-2 text-[13px] text-muted">Payout timing: Instant</p>
          <ul className="mt-4 space-y-2 text-[13px] leading-5 text-muted">
            <li>1. Select a supported bank</li>
            <li>2. Enter account number — name resolves automatically</li>
            <li>3. Confirm with your payout PIN</li>
          </ul>
        </section>

        <div className="lg:col-span-3">
          <WithdrawForm availableBalance={available} />
        </div>
      </div>
    </div>
  );
}
