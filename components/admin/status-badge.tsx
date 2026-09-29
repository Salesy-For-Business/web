import clsx from "clsx";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface text-muted",
  success: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  info: "bg-tonal text-link",
};

const STATUS_TONE: Record<string, Tone> = {
  paid: "success",
  active: "success",
  resolved: "success",
  pending: "warning",
  past_due: "warning",
  in_progress: "info",
  open: "info",
  failed: "danger",
  suspended: "danger",
  cancelled: "neutral",
  closed: "neutral",
  none: "neutral",
};

export function StatusBadge({
  status,
  tone,
  children,
  className,
}: {
  status?: string;
  tone?: Tone;
  children?: React.ReactNode;
  className?: string;
}) {
  const resolved = tone ?? (status ? STATUS_TONE[status] : undefined) ?? "neutral";
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize",
        TONES[resolved],
        className,
      )}
    >
      {children ?? status?.replace(/_/g, " ")}
    </span>
  );
}
