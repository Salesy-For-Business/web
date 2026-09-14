import clsx from "clsx";

export const fieldLabelClass =
  "mb-1.5 block text-[14px] font-medium text-heading";

export const fieldHintClass = "mt-1.5 text-[13px] text-muted";

export const fieldErrorClass = "mt-1.5 text-[13px] text-red-600 dark:text-red-500";

export const inputClass = clsx(
  "h-12 w-full rounded-lg border border-border bg-background px-4 text-[15px] text-foreground",
  "placeholder:text-muted",
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30",
);

export const textareaClass = clsx(
  "min-h-28 w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground",
  "placeholder:text-muted",
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30",
);

export const primaryButtonClass = clsx(
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-primary",
  "bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-hover",
  "disabled:pointer-events-none disabled:opacity-60",
);

export const secondaryButtonClass = clsx(
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border",
  "bg-background px-6 text-[15px] font-medium text-link hover:bg-surface hover:text-link",
  "disabled:pointer-events-none disabled:opacity-60",
);
