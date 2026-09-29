"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminMeQuery } from "@/lib/admin/queries";
import { landingPathForRole } from "@/lib/admin/nav";
import type { ModeratorRole } from "@/lib/auth-store";

export function AdminGate({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: ModeratorRole[] | "any";
}) {
  const router = useRouter();
  const { data, isPending, isError, isFetched } = useAdminMeQuery();
  const ready = isFetched || isError || !isPending;

  const isModerator = data?.isModerator ?? false;
  const role = data?.moderatorRole ?? null;
  const gateVerified = data?.gateVerified ?? false;
  const allowed = allow === "any" || (role && allow.includes(role));

  useEffect(() => {
    if (!ready) return;
    if (isError || !isModerator) {
      router.replace("/dashboard");
      return;
    }
    if (!gateVerified) {
      router.replace("/admin/gate");
      return;
    }
    if (!allowed && role) {
      router.replace(landingPathForRole(role));
    }
  }, [ready, isError, isModerator, gateVerified, allowed, role, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-[14px] text-muted">
        Loading…
      </div>
    );
  }

  if (isError || !isModerator || !gateVerified || !allowed) return null;

  return <>{children}</>;
}
