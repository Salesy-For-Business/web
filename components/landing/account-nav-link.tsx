"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";

export function AccountNavLink({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const status = useAuthStore((s) => s.status);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    // Ensure hydrated flag even when persist has nothing to rehydrate.
    if (!hydrated) {
      const t = window.setTimeout(() => {
        if (!useAuthStore.getState().hydrated) setHydrated(true);
      }, 50);
      return () => window.clearTimeout(t);
    }
  }, [hydrated, setHydrated]);

  if (!hydrated) {
    return (
      <span className={className} aria-hidden>
        Sign in
      </span>
    );
  }

  if (status === "signedIn") {
    return (
      <Link href="/dashboard" className={className} onClick={onClick}>
        Dashboard
      </Link>
    );
  }

  if (status === "pendingBusiness") {
    return (
      <Link href="/signup/business" className={className} onClick={onClick}>
        Finish setup
      </Link>
    );
  }

  if (status === "pendingPayout") {
    return (
      <Link href="/signup/payout" className={className} onClick={onClick}>
        Finish setup
      </Link>
    );
  }

  if (status === "pendingVerify") {
    return (
      <Link href="/signup/verify" className={className} onClick={onClick}>
        Verify email
      </Link>
    );
  }

  return (
    <Link href="/signin" className={className} onClick={onClick}>
      Sign in
    </Link>
  );
}
