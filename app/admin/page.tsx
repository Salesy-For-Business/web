"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Banknote,
  ChevronRight,
  CreditCard,
  LifeBuoy,
  Receipt,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ChangeChip, KpiTile } from "@/components/admin/kpi-tile";
import {
  AreaTrendChart,
  BarTrendChart,
  BreakdownBars,
  CHART_COLORS,
  ChartEmpty,
  DonutChart,
} from "@/components/admin/charts";
import { formatMoney, type BusinessCurrency } from "@/lib/currencies";
import {
  useAdminOverviewQuery,
  type AdminOverview,
  type Kpi,
  type OverviewPeriod,
} from "@/lib/admin/overview-queries";

const PERIODS: { value: OverviewPeriod; label: string; long: string }[] = [
  { value: "7d", label: "7D", long: "the last 7 days" },
  { value: "30d", label: "30D", long: "the last 30 days" },
  { value: "90d", label: "90D", long: "the last 90 days" },
  { value: "all", label: "All", long: "all time" },
];

const PLAN_COLORS: Record<string, string> = {
  free: CHART_COLORS.muted,
  boutique: CHART_COLORS.primary,
  pro: CHART_COLORS.purple,
};

const CHANNEL_LABELS: Record<string, string> = {
  card: "Card",
  transfer: "Bank transfer",
  ussd: "USSD",
};

const STATUS_COLORS: Record<string, string> = {
  paid: CHART_COLORS.green,
  pending: CHART_COLORS.amber,
  failed: CHART_COLORS.red,
};

function PeriodSelector({
  value,
  onChange,
}: {
  value: OverviewPeriod;
  onChange: (value: OverviewPeriod) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Time period"
      className="inline-flex rounded-lg border border-border bg-surface p-0.5"
    >
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          role="radio"
          aria-checked={value === p.value}
          onClick={() => onChange(p.value)}
          className={clsx(
            "h-8 min-w-12 rounded-md px-3 text-[13px] font-medium transition-colors",
            value === p.value
              ? "bg-background text-heading shadow-sm"
              : "text-muted hover:text-heading",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function change(k: Kpi) {
  return <ChangeChip change={k.change} previous={k.previous} value={k.value} />;
}

function formatMrr(mrr: AdminOverview["kpis"]["mrr"]) {
  const entries = Object.entries(mrr).filter(([, v]) => v && v > 0) as [BusinessCurrency, number][];
  if (entries.length === 0) return "No MRR yet";
  return `${entries.map(([c, v]) => formatMoney(v, c)).join(" + ")} MRR`;
}

function ListRowLink({
  href,
  title,
  subtitle,
  right,
}: {
  href: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-heading">{title}</p>
          {subtitle ? <p className="truncate text-[12px] text-muted">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0 text-right">{right}</div> : null}
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[108px] animate-pulse rounded-xl bg-surface sm:h-[124px]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl bg-surface lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}

function OverviewBody({ data, periodLabel }: { data: AdminOverview; periodLabel: string }) {
  const { kpis } = data;
  const mixed = data.currencies.length > 1;
  const totalOrders = data.orderStatus.reduce((s, r) => s + r.count, 0);
  const totalStores = data.planMix.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-6">
      {mixed ? (
        <p className="rounded-lg bg-surface px-4 py-2.5 text-[13px] text-muted">
          Orders come in {data.currencies.join(", ")}. Money totals add these amounts
          without currency conversion and are shown in NGN.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiTile
          label="GMV"
          icon={TrendingUp}
          value={formatMoney(kpis.gmv.value, "NGN")}
          change={change(kpis.gmv)}
          hint="paid order value"
        />
        <KpiTile
          label="Platform revenue"
          icon={Banknote}
          value={formatMoney(kpis.platformRevenue.value, "NGN")}
          change={change(kpis.platformRevenue)}
          hint={`${formatMoney(kpis.featuredRevenue.value, "NGN")} featured`}
        />
        <KpiTile
          label="Paid orders"
          icon={ShoppingBag}
          value={kpis.paidOrders.value.toLocaleString()}
          change={change(kpis.paidOrders)}
        />
        <KpiTile
          label="Avg. order value"
          icon={Receipt}
          value={formatMoney(kpis.aov.value, "NGN")}
          change={change(kpis.aov)}
        />
        <KpiTile
          label="New stores"
          icon={Store}
          value={kpis.newBusinesses.value.toLocaleString()}
          change={change(kpis.newBusinesses)}
        />
        <KpiTile
          label="New users"
          icon={Users}
          value={kpis.newUsers.value.toLocaleString()}
          change={change(kpis.newUsers)}
        />
        <KpiTile
          label="Paid subscriptions"
          icon={CreditCard}
          value={kpis.paidSubscriptions.toLocaleString()}
          hint={formatMrr(kpis.mrr)}
        />
        <KpiTile
          label="Open tickets"
          icon={LifeBuoy}
          value={kpis.openTickets.toLocaleString()}
          hint={`${kpis.ticketsOpened.toLocaleString()} opened in period`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-5">
        {[
          { label: "In-stock products", value: kpis.activeProducts.toLocaleString() },
          { label: "Products added", value: kpis.newProducts.toLocaleString() },
          {
            label: "New reviews",
            value: kpis.newReviews.value.toLocaleString(),
            extra: kpis.averageRating != null ? `★ ${kpis.averageRating.toFixed(1)} avg` : undefined,
          },
          { label: "Order commission", value: formatMoney(kpis.orderRevenue.value, "NGN") },
          {
            label: "Past-due subscriptions",
            value: kpis.pastDueSubscriptions.toLocaleString(),
            warn: kpis.pastDueSubscriptions > 0,
          },
        ].map((s) => (
          <div key={s.label} className="min-w-0">
            <p className="truncate text-[12px] text-muted">{s.label}</p>
            <p
              className={clsx(
                "mt-0.5 truncate text-[16px] font-medium tabular-nums",
                s.warn ? "text-red-600 dark:text-red-400" : "text-heading",
              )}
            >
              {s.value}
              {s.extra ? (
                <span className="ml-1.5 text-[12px] font-normal text-muted">{s.extra}</span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard
          title="GMV & platform revenue"
          description={`Per ${data.bucket} over ${periodLabel}.`}
          className="min-w-0 lg:col-span-2"
        >
          <AreaTrendChart
            data={data.series}
            bucket={data.bucket}
            series={[
              { key: "gmv", label: "GMV", color: CHART_COLORS.primary },
              { key: "revenue", label: "Platform revenue", color: CHART_COLORS.green },
            ]}
            emptyMessage="No paid orders in this period yet."
          />
        </AdminCard>
        <AdminCard title="Plan mix" description="All stores by current plan." className="min-w-0">
          <DonutChart
            centerValue={totalStores.toLocaleString()}
            centerLabel="stores"
            data={data.planMix.map((p) => ({
              key: p.plan,
              label: p.name,
              value: p.count,
              color: PLAN_COLORS[p.plan] ?? CHART_COLORS.muted,
            }))}
            emptyMessage="No stores yet."
          />
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard
          title="Orders & signups"
          description={`Paid orders, new stores, and new users per ${data.bucket}.`}
          className="min-w-0 lg:col-span-2"
        >
          <BarTrendChart
            data={data.series}
            bucket={data.bucket}
            series={[
              { key: "orders", label: "Paid orders", color: CHART_COLORS.primary },
              { key: "businesses", label: "New stores", color: CHART_COLORS.amber },
              { key: "users", label: "New users", color: CHART_COLORS.purple },
            ]}
            emptyMessage="No orders or signups in this period yet."
          />
        </AdminCard>
        <div className="grid min-w-0 gap-6">
          <AdminCard title="Payment channels" description="Paid orders by how buyers paid.">
            <BreakdownBars
              format="money"
              data={data.channels.map((c) => ({
                key: c.channel,
                label: CHANNEL_LABELS[c.channel] ?? c.channel,
                value: c.gmv,
                sublabel: `${c.orders} order${c.orders === 1 ? "" : "s"}`,
              }))}
              emptyMessage="No paid orders yet."
            />
          </AdminCard>
          <AdminCard
            title="Order status"
            description={`${totalOrders.toLocaleString()} checkout${totalOrders === 1 ? "" : "s"} started.`}
          >
            <BreakdownBars
              data={data.orderStatus.map((s) => ({
                key: s.status,
                label: s.status[0]!.toUpperCase() + s.status.slice(1),
                value: s.count,
                sublabel: totalOrders ? `${Math.round((s.count / totalOrders) * 100)}%` : undefined,
                color: STATUS_COLORS[s.status],
              }))}
              emptyMessage="No checkouts yet."
            />
          </AdminCard>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard
          title="Top stores"
          description={`By GMV over ${periodLabel}.`}
          actions={
            <Link href="/admin/businesses" className="text-[13px] font-medium text-link hover:underline">
              All stores
            </Link>
          }
        >
          {data.topBusinesses.length === 0 ? (
            <ChartEmpty message="No sales in this period yet." />
          ) : (
            <ol className="divide-y divide-border">
              {data.topBusinesses.map((b, i) => (
                <ListRowLink
                  key={b.id}
                  href={`/admin/businesses/${b.id}`}
                  title={
                    <>
                      <span className="mr-2 text-muted tabular-nums">{i + 1}.</span>
                      {b.businessName}
                    </>
                  }
                  subtitle={b.storeHandle ? `/${b.storeHandle}` : undefined}
                  right={
                    <>
                      <p className="text-[14px] font-medium tabular-nums text-heading">
                        {formatMoney(b.gmv, "NGN")}
                      </p>
                      <p className="text-[12px] text-muted">
                        {b.orders} order{b.orders === 1 ? "" : "s"}
                      </p>
                    </>
                  }
                />
              ))}
            </ol>
          )}
        </AdminCard>

        <AdminCard
          title="Newest stores"
          actions={
            <Link href="/admin/businesses" className="text-[13px] font-medium text-link hover:underline">
              All stores
            </Link>
          }
        >
          {data.newestBusinesses.length === 0 ? (
            <ChartEmpty message="No stores yet." />
          ) : (
            <ul className="divide-y divide-border">
              {data.newestBusinesses.map((b) => (
                <ListRowLink
                  key={b.id}
                  href={`/admin/businesses/${b.id}`}
                  title={b.businessName}
                  subtitle={`/${b.storeHandle} · ${new Date(b.createdAt).toLocaleDateString()}`}
                  right={<StatusBadge tone={b.plan === "free" ? "neutral" : "info"}>{b.plan}</StatusBadge>}
                />
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <AdminCard
        title="Recent orders"
        actions={
          <Link href="/admin/orders" className="text-[13px] font-medium text-link hover:underline">
            All orders
          </Link>
        }
      >
        {data.recentOrders.length === 0 ? (
          <ChartEmpty message="No orders yet." />
        ) : (
          <ul className="divide-y divide-border">
            {data.recentOrders.map((o) => (
              <ListRowLink
                key={o.id}
                href={`/admin/orders/${o.id}`}
                title={o.customerName || o.reference}
                subtitle={`/${o.storeHandle} · ${new Date(o.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`}
                right={
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-[14px] font-medium tabular-nums text-heading">
                      {formatMoney(o.total, o.currency)}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                }
              />
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}

function OverviewContent() {
  const [period, setPeriod] = useState<OverviewPeriod>("30d");
  const { data, isPending, isError, isPlaceholderData } = useAdminOverviewQuery(period);
  const periodLabel = PERIODS.find((p) => p.value === period)!.long;

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description={
          period === "all"
            ? "How Salesy has done since launch."
            : `How Salesy is doing over ${periodLabel}. Changes compare against the ${periodLabel.replace("the last ", "")} before.`
        }
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />
      {isPending ? (
        <OverviewSkeleton />
      ) : isError || !data ? (
        <p className="text-[14px] text-red-600">Could not load the overview.</p>
      ) : (
        <div className={clsx("transition-opacity", isPlaceholderData && "opacity-60")}>
          <OverviewBody data={data} periodLabel={periodLabel} />
        </div>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <OverviewContent />
    </AdminShell>
  );
}
