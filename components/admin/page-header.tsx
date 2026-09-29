import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel = "Back",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-link"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-pretty break-words text-[24px] leading-8 text-heading sm:text-[28px] sm:leading-9">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-border bg-background p-4 sm:p-6",
        className,
      )}
    >
      {title || actions ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[17px] leading-7 text-heading">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
