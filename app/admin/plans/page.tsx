"use client";

import Link from "next/link";
import clsx from "clsx";
import { ChevronRight, Infinity as InfinityIcon, Percent, Tag } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CURRENCIES, formatMoney } from "@/lib/currencies";
import { useAdminPlansQuery } from "@/lib/admin/plan-queries";

function PlansContent() {
  const { data, isPending, isError } = useAdminPlansQuery();

  return (
    <div>
      <AdminPageHeader
        title="Plans"
        description="Prices, commission, listing limits, and features for Free, Boutique, and Pro. Changes show on the pricing page and seller billing within a minute."
        actions={
          data?.paystackMode ? (
            <StatusBadge tone={data.paystackMode === "live" ? "success" : "warning"}>
              Paystack {data.paystackMode} mode
            </StatusBadge>
          ) : data ? (
            <StatusBadge tone="danger">Paystack not configured</StatusBadge>
          ) : null
        }
      />

      {isPending ? (
        <p className="text-[14px] text-muted">Loading plans…</p>
      ) : isError || !data ? (
        <p className="text-[14px] text-red-600">Could not load plans.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {data.plans.map((plan) => {
            const ngn = plan.prices.NGN;
            const isPaid = plan.id !== "free";
            return (
              <Link
                key={plan.id}
                href={`/admin/plans/${plan.id}`}
                className={clsx(
                  "group flex flex-col rounded-xl border bg-background p-4 transition-colors hover:bg-surface sm:p-5",
                  plan.featured ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[18px] font-medium leading-7 text-heading">
                      {plan.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-muted">{plan.blurb}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {plan.active ? (
                      <StatusBadge tone="success">Active</StatusBadge>
                    ) : (
                      <StatusBadge tone="neutral">Hidden</StatusBadge>
                    )}
                    {plan.badge ? <StatusBadge tone="info">{plan.badge}</StatusBadge> : null}
                  </div>
                </div>

                <p className="mt-4 font-[system-ui] text-[26px] leading-none text-heading">
                  {formatMoney(ngn?.monthly ?? 0, "NGN")}
                  <span className="text-[13px] text-muted"> /month</span>
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
                  <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
                    <Percent className="size-3.5 text-muted" aria-hidden />
                    <dt className="sr-only">Commission</dt>
                    <dd className="text-heading">{plan.commissionPercent}% fee</dd>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
                    {plan.listingLimit == null ? (
                      <InfinityIcon className="size-3.5 text-muted" aria-hidden />
                    ) : (
                      <Tag className="size-3.5 text-muted" aria-hidden />
                    )}
                    <dt className="sr-only">Listings</dt>
                    <dd className="text-heading">
                      {plan.listingLimit == null ? "Unlimited" : `${plan.listingLimit} listings`}
                    </dd>
                  </div>
                </dl>

                {isPaid ? (
                  <div className="mt-4">
                    <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
                      Paystack billing
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {CURRENCIES.map(({ code }) => {
                        const planCode = plan.planCodes[code];
                        return (
                          <StatusBadge
                            key={code}
                            tone={planCode?.code ? "success" : "neutral"}
                          >
                            {code} {planCode?.code ? "✓" : "—"}
                          </StatusBadge>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-link">
                  Edit plan
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminPlansPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <PlansContent />
    </AdminShell>
  );
}
