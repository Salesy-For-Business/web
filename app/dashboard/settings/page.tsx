"use client";

import Link from "next/link";
import clsx from "clsx";
import { toast } from "sonner";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { LiveChatSettings } from "@/components/dashboard/live-chat-settings";
import {
  PayoutPinChange,
  PayoutPinSetup,
} from "@/components/dashboard/payout-pin";
import { secondaryButtonClass } from "@/components/auth/styles";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSignOutMutation } from "@/lib/auth/queries";
import { planLabel, useAuthStore } from "@/lib/auth-store";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const business = useAuthStore((s) => s.business);
  const payoutPin = useAuthStore((s) => s.payoutPin);
  const clearLocal = useAuthStore((s) => s.signOut);
  const signOutMutation = useSignOutMutation();

  return (
    <div>
      <DashboardPageHeader
        title="Settings"
        description="Account preferences for you and your store."
      />

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-[18px] leading-7">Account</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] uppercase tracking-wide text-muted">Name</dt>
              <dd className="mt-1 text-[14px] text-heading">
                {user?.firstName} {user?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wide text-muted">Email</dt>
              <dd className="mt-1 text-[14px] text-heading">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wide text-muted">Phone</dt>
              <dd className="mt-1 text-[14px] text-heading">{user?.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wide text-muted">Sign-in</dt>
              <dd className="mt-1 text-[14px] capitalize text-heading">
                {user?.provider ?? "email"}
              </dd>
            </div>
          </dl>
        </section>

        <LiveChatSettings />

        {payoutPin ? (
          <PayoutPinChange />
        ) : (
          <PayoutPinSetup description="Required before you can withdraw earnings to your bank." />
        )}

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-[18px] leading-7">Store plan</h2>
          <p className="mt-2 text-[14px] text-muted">
            Current plan:{" "}
            <span className="font-medium text-heading">
              {planLabel(business?.plan ?? "free")}
            </span>
          </p>
          <Link
            href="/#pricing"
            className={clsx(secondaryButtonClass, "mt-4 w-auto px-5")}
          >
            Compare plans
          </Link>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-[18px] leading-7">Appearance</h2>
          <p className="mt-2 text-[14px] text-muted">
            Choose light, dark, or match your device.
          </p>
          <div className="mt-4 max-w-md">
            <ThemeToggle variant="labeled" />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-[18px] leading-7">Session</h2>
          <button
            type="button"
            className="mt-4 text-[14px] font-medium text-red-600 hover:text-red-700"
            onClick={() => {
              void (async () => {
                try {
                  await signOutMutation.mutateAsync();
                  toast.success("Signed out");
                } catch {
                  toast.error("Signed out locally. Session may still be open.");
                }
                clearLocal();
                window.location.href = "/signin";
              })();
            }}
          >
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}
