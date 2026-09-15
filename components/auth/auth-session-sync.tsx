"use client";

import { useEffect } from "react";
import { useAuthSession } from "@/lib/auth/queries";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Keeps the lightweight client auth store in sync with the server session
 * (cookie + /api/auth/me) so dashboard UI can keep reading useAuthStore.
 */
export function AuthSessionSync() {
  const { data, isSuccess, isError } = useAuthSession();
  const hydrateFromSession = useAuthStore((s) => s.hydrateFromSession);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    if (isSuccess && data) {
      hydrateFromSession(data);
      setHydrated(true);
    } else if (isError) {
      hydrateFromSession({
        status: "anonymous",
        user: null,
        business: null,
      });
      setHydrated(true);
    }
  }, [data, isSuccess, isError, hydrateFromSession, setHydrated]);

  return null;
}
