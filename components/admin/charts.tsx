"use client";

import { useId } from "react";
import clsx from "clsx";
import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/currencies";

/** Series colors that read in both light and dark themes. */
export const CHART_COLORS = {
  primary: "var(--primary)",
  green: "#1e8e3e",
  amber: "#f9ab00",
  red: "#d93025",
  purple: "#9334e6",
  muted: "var(--muted)",
} as const;

export type ChartBucket = "day" | "week" | "month";
export type ValueFormat = "money" | "number";

export type ChartSeries = { key: string; label: string; color: string };

function formatCompactMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatBucketLabel(key: string, bucket: ChartBucket, long = false) {
  const date = new Date(`${key}T00:00:00Z`);
  if (bucket === "month") {
    return date.toLocaleDateString("en-GB", { month: long ? "long" : "short", year: "numeric", timeZone: "UTC" });
  }
  const label = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(long ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
  return bucket === "week" && long ? `Week of ${label}` : label;
}

export function ChartEmpty({ message = "No data for this period yet.", className }: { message?: string; className?: string }) {
  return (
    <div
      className={clsx(
        "flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface py-6 text-center",
        className,
      )}
    >
      <BarChart3 className="size-5 text-muted" aria-hidden />
      <p className="px-4 text-[13px] text-muted">{message}</p>
    </div>
  );
}

function TooltipCard({
  active,
  label,
  rows,
  series,
  format,
  currency,
  bucket,
}: {
  active?: boolean;
  label?: string | number;
  rows: { key: string; value: number }[];
  series: ChartSeries[];
  format: ValueFormat;
  currency: string;
  bucket: ChartBucket;
}) {
  if (!active || rows.length === 0) return null;
  return (
    <div className="min-w-40 rounded-lg border border-border bg-background px-3 py-2 text-[12px] shadow-lg">
      <p className="mb-1.5 font-medium text-heading">
        {label != null ? formatBucketLabel(String(label), bucket, true) : ""}
      </p>
      <ul className="space-y-1">
        {rows.map((row) => {
          const s = series.find((x) => x.key === row.key);
          return (
            <li key={row.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="size-2 rounded-full" style={{ background: s?.color }} />
                {s?.label ?? row.key}
              </span>
              <span className="font-medium tabular-nums text-heading">
                {format === "money" ? formatMoney(row.value, currency) : row.value.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Legend({ series }: { series: ChartSeries[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
      {series.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

type TrendProps = {
  data: Record<string, number | string>[];
  series: ChartSeries[];
  bucket: ChartBucket;
  format?: ValueFormat;
  currency?: string;
  height?: number;
  emptyMessage?: string;
};

function hasValues(data: TrendProps["data"], series: ChartSeries[]) {
  return data.some((row) => series.some((s) => Number(row[s.key]) > 0));
}

const axisTick = { fill: "var(--muted)", fontSize: 11 };

export function AreaTrendChart({
  data,
  series,
  bucket,
  format = "money",
  currency = "NGN",
  height = 260,
  emptyMessage,
}: TrendProps) {
  const gradientId = useId().replace(/:/g, "");
  if (!hasValues(data, series)) {
    return <ChartEmpty message={emptyMessage} className="h-[260px]" />;
  }
  return (
    <div>
      <Legend series={series} />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`${gradientId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              minTickGap={24}
              tickFormatter={(v: string) => formatBucketLabel(v, bucket)}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(v: number) =>
                format === "money" ? formatCompactMoney(v, currency) : formatCompactNumber(v)
              }
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              content={({ active, payload, label }) => (
                <TooltipCard
                  active={active}
                  label={label}
                  rows={(payload ?? []).map((p) => ({ key: String(p.dataKey), value: Number(p.value ?? 0) }))}
                  series={series}
                  format={format}
                  currency={currency}
                  bucket={bucket}
                />
              )}
            />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#${gradientId}-${s.key})`}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BarTrendChart({
  data,
  series,
  bucket,
  format = "number",
  currency = "NGN",
  height = 260,
  emptyMessage,
}: TrendProps) {
  if (!hasValues(data, series)) {
    return <ChartEmpty message={emptyMessage} className="h-[260px]" />;
  }
  return (
    <div>
      <Legend series={series} />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              minTickGap={24}
              tickFormatter={(v: string) => formatBucketLabel(v, bucket)}
            />
            <YAxis
              width={40}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(v: number) =>
                format === "money" ? formatCompactMoney(v, currency) : formatCompactNumber(v)
              }
            />
            <Tooltip
              cursor={{ fill: "var(--surface)" }}
              content={({ active, payload, label }) => (
                <TooltipCard
                  active={active}
                  label={label}
                  rows={(payload ?? []).map((p) => ({ key: String(p.dataKey), value: Number(p.value ?? 0) }))}
                  series={series}
                  format={format}
                  currency={currency}
                  bucket={bucket}
                />
              )}
            />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DonutChart({
  data,
  centerValue,
  centerLabel,
  emptyMessage,
}: {
  data: { key: string; label: string; value: number; color: string }[];
  centerValue?: string;
  centerLabel?: string;
  emptyMessage?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <ChartEmpty message={emptyMessage} className="h-[200px]" />;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={data.filter((d) => d.value > 0).length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerValue ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-medium leading-7 tabular-nums text-heading">{centerValue}</span>
            {centerLabel ? <span className="text-[11px] text-muted">{centerLabel}</span> : null}
          </div>
        ) : null}
      </div>
      <ul className="w-full space-y-2 text-[13px]">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="tabular-nums text-muted">
              <span className="font-medium text-heading">{d.value.toLocaleString()}</span>
              {" · "}
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BreakdownBars({
  data,
  format = "number",
  currency = "NGN",
  emptyMessage,
}: {
  data: { key: string; label: string; value: number; sublabel?: string; color?: string }[];
  format?: ValueFormat;
  currency?: string;
  emptyMessage?: string;
}) {
  const max = Math.max(0, ...data.map((d) => d.value));
  if (max === 0) return <ChartEmpty message={emptyMessage} className="h-[160px]" />;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-foreground">{d.label}</span>
            <span className="tabular-nums text-muted">
              <span className="font-medium text-heading">
                {format === "money" ? formatMoney(d.value, currency) : d.value.toLocaleString()}
              </span>
              {d.sublabel ? ` · ${d.sublabel}` : ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(2, (d.value / max) * 100)}%`,
                background: d.color ?? CHART_COLORS.primary,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
