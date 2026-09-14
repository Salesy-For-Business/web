"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type AuthStatus } from "@/lib/auth-store";

type AuthGateProps = {
  children: React.ReactNode;
  allow: AuthStatus[] | "any";
  require?: {
    otpPurpose?: "signup" | "reset";
    resetReady?: boolean;
    hasUser?: boolean;
  };
};

function destinationFor(status: AuthStatus, hasBusiness: boolean): string {
  if (status === "pendingVerify") return "/signup/verify";
  if (status === "pendingBusiness") return "/signup/business";
  if (status === "signedIn") {
    return hasBusiness ? "/dashboard" : "/signup/business";
  }
  return "/signin";
}

export function AuthGate({ children, allow, require }: AuthGateProps) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const business = useAuthStore((s) => s.business);
  const otpPurpose = useAuthStore((s) => s.otpPurpose);
  const resetEmail = useAuthStore((s) => s.resetEmail);
  const resetReady = useAuthStore((s) => s.resetReady);

  useEffect(() => {
    if (!hydrated) {
      const t = window.setTimeout(() => {
        if (!useAuthStore.getState().hydrated) {
          useAuthStore.getState().setHydrated(true);
        }
      }, 50);
      return () => window.clearTimeout(t);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) {
      const t = window.setTimeout(() => {
        if (!useAuthStore.getState().hydrated) {
          useAuthStore.getState().setHydrated(true);
        }
      }, 50);
      return () => window.clearTimeout(t);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    // Reset OTP verify: anonymous + otpPurpose reset, OR already verified (resetReady)
    if (require?.otpPurpose === "reset") {
      if (resetReady && resetEmail) {
        return;
      }
      if (otpPurpose !== "reset" || !resetEmail) {
        router.replace("/forgot-password");
      }
      return;
    }

    // Reset password form after OTP
    if (require?.resetReady) {
      if (!resetReady || !resetEmail) {
        router.replace("/forgot-password");
      }
      return;
    }

    if (allow !== "any" && !allow.includes(status)) {
      router.replace(destinationFor(status, Boolean(business)));
      return;
    }

    if (require?.hasUser && !user) {
      router.replace("/signup");
      return;
    }

    if (require?.otpPurpose === "signup" && otpPurpose !== "signup") {
      if (status === "pendingBusiness") {
        router.replace("/signup/business");
      } else if (!user) {
        router.replace("/signup");
      } else if (user.emailVerified) {
        router.replace("/signup/business");
      }
    }
  }, [
    hydrated,
    status,
    user,
    business,
    otpPurpose,
    resetEmail,
    resetReady,
    allow,
    require,
    router,
  ]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-[14px] text-muted">
        Loading…
      </div>
    );
  }

  if (require?.otpPurpose === "reset") {
    if (resetReady && resetEmail) return <>{children}</>;
    if (otpPurpose !== "reset" || !resetEmail) return null;
    return <>{children}</>;
  }

  if (require?.resetReady) {
    if (!resetReady || !resetEmail) return null;
    return <>{children}</>;
  }

  if (allow !== "any" && !allow.includes(status)) return null;
  if (require?.hasUser && !user) return null;
  if (require?.otpPurpose === "signup" && otpPurpose !== "signup") return null;

  return <>{children}</>;
}
