"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ExternalLink, Menu, Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { dashboardNav } from "@/lib/dashboard";
import { useAuthStore } from "@/lib/auth-store";

export function DashboardHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const business = useAuthStore((s) => s.business);
  const handle = business?.storeHandle ?? "mystore";
  const storeUrl = `https://salesy.link/${handle}`;

  const current =
    dashboardNav.find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? dashboardNav[0]!;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="rounded-lg p-2 text-heading hover:bg-surface lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-2 text-[13px]">
              <li className="text-muted">
                <Link href="/dashboard" className="hover:text-link">
                  Dashboard
                </Link>
              </li>
              <li className="text-muted" aria-hidden>
                /
              </li>
              <li className="truncate font-medium uppercase tracking-wide text-heading">
                {current.label}
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/payouts"
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-heading hover:bg-surface sm:inline-flex"
          >
            <Wallet className="size-4" aria-hidden />
            Withdraw
          </Link>
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-link hover:bg-tonal"
          >
            <span className="hidden sm:inline">Visit store</span>
            <ExternalLink className="size-4" aria-hidden />
          </a>
          <button
            type="button"
            className="rounded-full border border-border p-2 text-muted hover:bg-surface hover:text-heading"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
