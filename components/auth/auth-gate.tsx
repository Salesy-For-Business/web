"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/auth/queries";
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
  if (status === "pendingPayout") return "/signup/payout";
  if (status === "signedIn") {
    return hasBusiness ? "/dashboard" : "/signup/business";
  }
  return "/signin";
}

export function AuthGate({ children, allow, require }: AuthGateProps) {
  const router = useRouter();
  const { data, isPending, isFetched, isError } = useAuthSession();
  const storeUser = useAuthStore((s) => s.user);
  const storeBusiness = useAuthStore((s) => s.business);
  const storeStatus = useAuthStore((s) => s.status);
  const otpPurpose = useAuthStore((s) => s.otpPurpose);
  const resetEmail = useAuthStore((s) => s.resetEmail);
  const resetReady = useAuthStore((s) => s.resetReady);

  const ready = isFetched || isError || !isPending;
  const status = data?.status ?? (isError ? "anonymous" : storeStatus);
  const user = data?.user ?? storeUser;
  const business = data?.business ?? storeBusiness;
  const effectiveOtpPurpose =
    status === "pendingVerify" ? "signup" : otpPurpose;

  useEffect(() => {
    if (!ready) return;

    if (require?.otpPurpose === "reset") {
      if (resetReady && resetEmail) return;
      if (effectiveOtpPurpose !== "reset" || !resetEmail) {
        router.replace("/forgot-password");
      }
      return;
    }

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

    if (require?.otpPurpose === "signup" && effectiveOtpPurpose !== "signup") {
      if (status === "pendingBusiness") {
        router.replace("/signup/business");
      } else if (!user) {
        router.replace("/signup");
      } else if (user.emailVerified) {
        router.replace("/signup/business");
      }
    }
  }, [
    ready,
    status,
    user,
    business,
    effectiveOtpPurpose,
    resetEmail,
    resetReady,
    allow,
    require,
    router,
  ]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-[14px] text-muted">
        Loading…
      </div>
    );
  }

  if (require?.otpPurpose === "reset") {
    if (resetReady && resetEmail) return <>{children}</>;
    if (effectiveOtpPurpose !== "reset" || !resetEmail) return null;
    return <>{children}</>;
  }

  if (require?.resetReady) {
    if (!resetReady || !resetEmail) return null;
    return <>{children}</>;
  }

  if (allow !== "any" && !allow.includes(status)) return null;
  if (require?.hasUser && !user) return null;
  if (require?.otpPurpose === "signup" && effectiveOtpPurpose !== "signup") {
    if (status === "pendingVerify") return <>{children}</>;
    return null;
  }

  return <>{children}</>;
}
