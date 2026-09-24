import clsx from "clsx";

/**
 * Salesy wordmark for the platform's own chrome (landing header/footer,
 * auth header, dashboard sidebar) — the S mark plus the text wordmark, per
 * the brand guidelines' anatomy for compact placements ("product icons,
 * avatars and small spaces"). Not for storefront headers, which brand
 * themselves with the seller's own logo.
 */
export function Logo({
  className,
  markClassName = "size-6",
  textClassName = "font-display text-[22px] tracking-tight",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand-assets/mark-blue.svg"
        alt=""
        className={clsx("shrink-0", markClassName)}
      />
      <span className={clsx("text-heading", textClassName)}>Salesy</span>
    </span>
  );
}
