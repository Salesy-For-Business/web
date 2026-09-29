"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, CreditCard, Megaphone, ShoppingBag, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { KpiTile } from "@/components/admin/kpi-tile";
import { AreaTrendChart, CHART_COLORS, ChartEmpty, DonutChart } from "@/components/admin/charts";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth-store";
import { formatMoney, type BusinessCurrency } from "@/lib/currencies";
import { useAdminFinanceQuery } from "@/lib/admin/finance-queries";

type SubscriptionFilter = "all" | "active" | "past_due" | "cancelled";

const FILTER_OPTIONS: { value: SubscriptionFilter; label: string }[] = [
  { value: "all", label: "All paid plans" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past due" },
  { value: "cancelled", label: "Cancelled" },
];

function formatMrr(mrr: Partial<Record<BusinessCurrency, number>>) {
  const entries = Object.entries(mrr).filter(([, v]) => v && v > 0) as [BusinessCurrency, number][];
  if (entries.length === 0) return formatMoney(0, "NGN");
  return entries.map(([c, v]) => formatMoney(v, c)).join(" + ");
}

function FinanceContent() {
  const { data, isPending, isError } = useAdminFinanceQuery();
  const isSuperadmin = useAuthStore((s) => s.user?.moderatorRole === "superadmin");
  const [filter, setFilter] = useState<SubscriptionFilter>("all");

  const subscriptions = useMemo(
    () =>
      (data?.businesses ?? [])
        .filter((b) => b.plan !== "free")
        .filter((b) => filter === "all" || b.subscriptionStatus === filter)
        .sort((a, b) => (a.subscriptionRenewsAt ?? "").localeCompare(b.subscriptionRenewsAt ?? "")),
    [data, filter],
  );

  if (isPending) return <p className="text-[14px] text-muted">Loading finance…</p>;
  if (isError || !data) return <p className="text-[14px] text-red-600">Could not load finance data.</p>;

  const paidPlans = data.planCounts.boutique + data.planCounts.pro;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Finance"
        description="All-time platform money: what flowed through stores, what Salesy kept, and who's paying for a plan."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiTile label="GMV" icon={TrendingUp} value={formatMoney(data.gmv, "NGN")} hint="all paid orders" />
        <KpiTile
          label="Platform revenue"
          icon={Banknote}
          value={formatMoney(data.totalPlatformRevenue, "NGN")}
          hint="commission + featured"
        />
        <KpiTile
          label="Order commission"
          icon={ShoppingBag}
          value={formatMoney(data.orderPlatformRevenue, "NGN")}
          hint={`${data.paidOrderCount.toLocaleString()} paid orders`}
        />
        <KpiTile
          label="Featured listings"
          icon={Megaphone}
          value={formatMoney(data.featuredRevenue, "NGN")}
          hint={
            data.featuredListingWeeklyPriceNGN != null
              ? `${formatMoney(data.featuredListingWeeklyPriceNGN / 100, "NGN")}/week`
              : "price not set"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard
          title="Revenue by month"
          description="Order commission and featured-listing sales over the last 12 months."
          className="min-w-0 lg:col-span-2"
        >
          <AreaTrendChart
            data={data.series}
            bucket="month"
            series={[
              { key: "orderRevenue", label: "Order commission", color: CHART_COLORS.primary },
              { key: "featuredRevenue", label: "Featured listings", color: CHART_COLORS.amber },
            ]}
            emptyMessage="No platform revenue in the last 12 months."
          />
        </AdminCard>
        <AdminCard
          title="Subscriptions"
          description={`${formatMrr(data.mrr)} monthly recurring revenue.`}
          className="min-w-0"
          actions={
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-tonal text-link">
              <CreditCard className="size-4" aria-hidden />
            </span>
          }
        >
          <DonutChart
            centerValue={paidPlans.toLocaleString()}
            centerLabel="paid stores"
            data={[
              { key: "free", label: "Free", value: data.planCounts.free, color: CHART_COLORS.muted },
              { key: "boutique", label: "Boutique", value: data.planCounts.boutique, color: CHART_COLORS.primary },
              { key: "pro", label: "Pro", value: data.planCounts.pro, color: CHART_COLORS.purple },
            ]}
            emptyMessage="No stores yet."
          />
        </AdminCard>
      </div>

      <AdminCard
        title="Paid-plan stores"
        description="Sorted by next renewal."
        actions={
          <Select<SubscriptionFilter>
            ariaLabel="Filter by subscription status"
            size="sm"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
            className="w-full sm:w-48"
          />
        }
      >
        {subscriptions.length === 0 ? (
          <ChartEmpty message="No stores match this filter." />
        ) : (
          <ul className="divide-y divide-border">
            {subscriptions.map((b) => {
              const name = isSuperadmin ? (
                <Link href={`/admin/businesses/${b.id}`} className="hover:text-link hover:underline">
                  {b.businessName}
                </Link>
              ) : (
                b.businessName
              );
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-heading">{name}</p>
                    <p className="text-[12px] text-muted">
                      /{b.storeHandle} · billed in {b.billingCurrency}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                    <StatusBadge tone="info">{b.plan}</StatusBadge>
                    <StatusBadge status={b.subscriptionStatus} />
                    {b.subscriptionRenewsAt ? (
                      <span>renews {new Date(b.subscriptionRenewsAt).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}

export default function AdminFinancePage() {
  return (
    <AdminShell allow={["finance", "superadmin"]}>
      <FinanceContent />
    </AdminShell>
  );
}
