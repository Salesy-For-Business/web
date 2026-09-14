import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { primaryButtonClass, secondaryButtonClass } from "@/components/auth/styles";

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-tonal text-link">
        <Icon className="size-5" aria-hidden />
      </div>
      <h2 className="mt-5 text-[22px] leading-8">{title}</h2>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-muted">{description}</p>
      {primaryHref && primaryLabel ? (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className={clsx(primaryButtonClass, "w-auto min-w-40 px-6")}
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className={clsx(secondaryButtonClass, "w-auto min-w-40 px-6")}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-pretty text-[28px] leading-9 sm:text-[32px] sm:leading-10">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
