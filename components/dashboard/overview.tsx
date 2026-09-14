"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Plus, Share2, Wallet } from "lucide-react";
import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import {
  formatNaira,
  greetingForHour,
} from "@/lib/dashboard";
import {
  acquisitionChannels,
  demoAvailableBalance,
  demoProductCount,
  demoUniqueBuyers,
  earningsBreakdown,
  getPeriodMetrics,
  recentTransactions,
  revenueTrajectory,
  topProducts,
  type RevenuePeriod,
} from "@/lib/dashboard-demo";
import {
  planLabel,
  productListingLimit,
  useAuthStore,
} from "@/lib/auth-store";

const periods: { id: RevenuePeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "all", label: "All time" },
];

function ShareStoreButton({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/demo`
      : "/demo";

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Salesy store",
          text: `Shop my store (/${handle})`,
          url,
        });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className={clsx(secondaryButtonClass, "w-auto gap-2 px-5")}
    >
      <Share2 className="size-4" aria-hidden />
      {copied ? "Link copied" : "Share store link"}
    </button>
  );
}

function RevenueBars({ points }: { points: typeof revenueTrajectory }) {
  const max = Math.max(...points.map((p) => p.revenue), 1);
  return (
    <div className="flex h-44 items-end gap-3 sm:gap-4">
      {points.map((point) => {
        const height = Math.max(8, Math.round((point.revenue / max) * 100));
        return (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end justify-center">
              <div
                className="w-full max-w-10 rounded-t-md bg-primary/80"
                style={{ height: `${height}%` }}
                title={formatNaira(point.revenue)}
              />
            </div>
            <span className="text-[12px] text-muted">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function OverviewPage() {
  const user = useAuthStore((s) => s.user);
  const business = useAuthStore((s) => s.business);
  const [period, setPeriod] = useState<RevenuePeriod>("30d");

  const plan = business?.plan ?? "free";
  const handle = business?.storeHandle ?? "mystore";
  const metrics = getPeriodMetrics(period);
  const earnings = earningsBreakdown(metrics.revenue, plan);
  const listingLimit = productListingLimit(plan);
  const listingLabel =
    listingLimit === Infinity
      ? `${demoProductCount} / Unlimited`
      : `${demoProductCount} / ${listingLimit}`;
  const listingPct =
    listingLimit === Infinity
      ? 12
      : Math.min(100, Math.round((demoProductCount / listingLimit) * 100));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-pretty text-[28px] leading-9 sm:text-[32px] sm:leading-10">
            {greetingForHour()}, {user?.firstName ?? "there"}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            Here’s how {business?.businessName ?? "your store"} is doing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareStoreButton handle={handle} />
          <Link
            href="/dashboard/products"
            className={clsx(primaryButtonClass, "w-auto gap-2 px-5")}
          >
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-border bg-background p-6 lg:col-span-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
                Total revenue
              </p>
              <p className="mt-2 font-[system-ui] text-[36px] leading-none tracking-tight text-heading sm:text-[44px]">
                {formatNaira(metrics.revenue)}
              </p>
            </div>
            <div
              className="flex rounded-full border border-border p-1"
              role="radiogroup"
              aria-label="Revenue period"
            >
              {periods.map((item) => {
                const selected = period === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPeriod(item.id)}
                    className={clsx(
                      "rounded-full px-3 py-1.5 text-[12px] font-medium",
                      selected
                        ? "bg-tonal text-link"
                        : "text-muted hover:text-heading",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            {[
              { label: "Total orders", value: String(metrics.totalOrders) },
              { label: "Paid orders", value: String(metrics.paidOrders) },
              {
                label: "Avg. order value",
                value: formatNaira(metrics.avgOrderValue),
              },
              {
                label: "Store views conv.",
                value: `${metrics.storeViewsConv.toFixed(1)}%`,
              },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[12px] text-muted">{stat.label}</dt>
                <dd className="mt-1 font-[system-ui] text-[18px] font-medium text-heading">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-background p-6 lg:col-span-2">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
            Account status
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted">Product catalog</span>
              <span className="font-medium text-heading">{listingLabel}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${listingPct}%` }}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <div>
              <p className="text-[13px] text-muted">Unique buyers</p>
              <p className="mt-1 text-[22px] font-medium text-heading">
                {demoUniqueBuyers}
              </p>
            </div>
            <p className="rounded-md bg-surface px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-muted">
              {planLabel(plan)}
            </p>
          </div>
          {plan === "free" ? (
            <Link
              href="/#pricing"
              className={clsx(primaryButtonClass, "mt-6")}
            >
              Upgrade to Boutique
            </Link>
          ) : (
            <p className="mt-6 text-[13px] leading-5 text-muted">
              You’re on {planLabel(plan)}. No Salesy commission on sales.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-background p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[20px] leading-7">Earnings & settlement</h2>
            <p className="mt-1 max-w-2xl text-[14px] leading-6 text-muted">
              What you keep after any plan fee. Payouts are instant — withdraw
              to your bank anytime.
            </p>
          </div>
          <Link
            href="/dashboard/payouts"
            className={clsx(secondaryButtonClass, "w-auto gap-2 px-4")}
          >
            <Wallet className="size-4" aria-hidden />
            Withdraw
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
              Credited to you
            </p>
            <p className="mt-2 font-[system-ui] text-[28px] text-heading">
              {formatNaira(earnings.credited)}
            </p>
            <p className="mt-2 text-[13px] text-muted">
              Available now: {formatNaira(demoAvailableBalance)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
              Salesy fee taken
            </p>
            <p className="mt-2 font-[system-ui] text-[28px] text-heading">
              {formatNaira(earnings.fee)}
            </p>
            <p className="mt-2 text-[13px] text-muted">
              {plan === "free"
                ? "5% per sale on your Free plan"
                : `No commission on ${planLabel(plan)}`}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
              Payout timing
            </p>
            <p className="mt-2 text-[28px] leading-none text-heading">Instant</p>
            <p className="mt-2 text-[13px] text-muted">
              Withdraw earnings anytime to your bank.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-[20px] leading-7">Revenue trajectory</h2>
          <p className="mt-1 text-[14px] text-muted">
            Gross volume over the last 6 months.
          </p>
          <div className="mt-6">
            <RevenueBars points={revenueTrajectory} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-[20px] leading-7">Acquisition channels</h2>
          <p className="mt-1 text-[14px] text-muted">
            Where paying customers came from this month.
          </p>
          <ul className="mt-6 space-y-4">
            {acquisitionChannels.map((channel) => (
              <li key={channel.channel}>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="font-medium text-heading">{channel.channel}</span>
                  <span className="text-muted">
                    {channel.orders} orders · {channel.share}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${channel.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[20px] leading-7">Top revenue products</h2>
            <Link
              href="/dashboard/products"
              className="text-[13px] font-medium text-link hover:text-link-hover"
            >
              View all
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {topProducts.map((product) => (
              <li
                key={product.name}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-heading">
                    {product.name}
                  </p>
                  <p className="text-[13px] text-muted">{product.units} units</p>
                </div>
                <p className="shrink-0 font-[system-ui] text-[14px] font-medium text-heading">
                  {formatNaira(product.revenue)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[20px] leading-7">Recent transactions</h2>
            <Link
              href="/dashboard/orders"
              className="text-[13px] font-medium text-link hover:text-link-hover"
            >
              Orders terminal
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {recentTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-heading">
                    {tx.customer}
                  </p>
                  <p className="truncate text-[13px] text-muted">
                    {tx.product} · {tx.id}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">{tx.date}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[system-ui] text-[14px] font-medium text-heading">
                    {formatNaira(tx.amount)}
                  </p>
                  <p
                    className={clsx(
                      "mt-1 text-[12px] font-medium",
                      tx.status === "Paid" && "text-green-700 dark:text-green-500",
                      tx.status === "Pending" && "text-yellow-700 dark:text-yellow-500",
                      tx.status === "Refunded" && "text-red-600",
                    )}
                  >
                    {tx.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
