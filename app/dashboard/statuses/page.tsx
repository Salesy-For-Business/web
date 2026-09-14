"use client";

import Link from "next/link";
import clsx from "clsx";
import { CircleDot } from "lucide-react";
import {
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/components/dashboard/page-chrome";
import { primaryButtonClass, secondaryButtonClass } from "@/components/auth/styles";
import { useAuthStore } from "@/lib/auth-store";

export default function StatusesPage() {
  const plan = useAuthStore((s) => s.business?.plan ?? "free");

  if (plan === "free") {
    return (
      <div>
        <DashboardPageHeader
          title="Statuses"
          description="Short store updates that surface on the Status feed — available on Pro."
        />
        <DashboardEmptyState
          icon={CircleDot}
          title="Statuses need Pro"
          description="Post store updates and get featured on the Status feed when you move to Pro."
          primaryHref="/#pricing"
          primaryLabel="Compare plans"
          secondaryHref="/dashboard"
          secondaryLabel="Back to overview"
        />
      </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader
        title="Statuses"
        description="Share short updates with shoppers who follow your store."
        actions={
          <button
            type="button"
            className={clsx(primaryButtonClass, "w-auto px-5")}
            disabled
          >
            New status
          </button>
        }
      />
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
        <p className="text-[15px] font-medium text-heading">No statuses yet</p>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-muted">
          Publish a short update when you drop new stock, run a promo, or want
          more eyes on the feed.
        </p>
        <Link
          href="/dashboard/products"
          className={clsx(secondaryButtonClass, "mx-auto mt-6 w-auto px-5")}
        >
          Manage products
        </Link>
      </div>
    </div>
  );
}
