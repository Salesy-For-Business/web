"use client";

import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { primaryButtonClass } from "@/components/auth/styles";

export function SubmitButton({
  children,
  loading,
  disabled,
  className,
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(primaryButtonClass, className)}
      aria-busy={loading || undefined}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
