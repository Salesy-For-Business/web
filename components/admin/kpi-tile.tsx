import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

export function ChangeChip({
  change,
  previous,
  value,
  invert = false,
}: {
  change: number | null;
  previous?: number | null;
  value?: number;
  /** For metrics where going down is good (e.g. open tickets). */
  invert?: boolean;
}) {
  if (change == null) {
    if (previous === 0 && value && value > 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-500/15 dark:text-green-400">
          New
        </span>
      );
    }
    return null;
  }
  const rounded = Math.round(change * 10) / 10;
  const flat = Math.abs(rounded) < 0.1;
  const good = invert ? rounded < 0 : rounded > 0;
  const Icon = flat ? Minus : rounded > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        flat
          ? "bg-surface text-muted"
          : good
            ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
      )}
      title="Change vs. the previous period"
    >
      <Icon className="size-3" aria-hidden />
      {flat ? "0%" : `${Math.abs(rounded).toLocaleString()}%`}
    </span>
  );
}

export function KpiTile({
  label,
  value,
  icon: Icon,
  change,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  change?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex min-w-0 flex-col rounded-xl border border-border bg-background p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12px] font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        {Icon ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-tonal text-link">
            <Icon className="size-3.5" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-2 truncate text-[20px] font-medium leading-7 tabular-nums text-heading sm:text-[24px] sm:leading-8">
        {value}
      </p>
      {change || hint ? (
        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[12px] text-muted">
          {change}
          {hint ? <span className="min-w-0 truncate">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
