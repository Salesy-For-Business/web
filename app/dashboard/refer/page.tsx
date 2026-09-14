"use client";

import { Gift } from "lucide-react";
import {
  DashboardPageHeader,
} from "@/components/dashboard/page-chrome";
import { secondaryButtonClass } from "@/components/auth/styles";
import clsx from "clsx";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

export default function ReferPage() {
  const handle = useAuthStore((s) => s.business?.storeHandle ?? "mystore");
  const [copied, setCopied] = useState(false);
  const code = `SALESY-${handle.slice(0, 6).toUpperCase()}`;

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <DashboardPageHeader
        title="Refer & earn"
        description="Invite another seller. When they publish a store, you both unlock demo rewards."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-background p-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-tonal text-link">
            <Gift className="size-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-[20px] leading-7">Your invite code</h2>
          <p className="mt-2 text-[14px] text-muted">
            Share this code. Referral payouts are simulated until billing goes live.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <code className="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-[15px] text-heading">
              {code}
            </code>
            <button
              type="button"
              onClick={() => void copy()}
              className={clsx(secondaryButtonClass, "w-auto px-5")}
            >
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-[20px] leading-7">How it works</h2>
          <ol className="mt-4 space-y-3 text-[14px] leading-6 text-muted">
            <li>1. Share your code with a seller you know.</li>
            <li>2. They create a store and publish their first product.</li>
            <li>3. You both see a demo credit on Refer & earn.</li>
          </ol>
          <p className="mt-6 text-[13px] text-muted">
            Successful referrals so far: <span className="font-medium text-heading">2</span>
          </p>
        </section>
      </div>
    </div>
  );
}
