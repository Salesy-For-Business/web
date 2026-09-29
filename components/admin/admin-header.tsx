"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { adminNav } from "@/lib/admin/nav";
import { useAdminMeQuery } from "@/lib/admin/queries";

function currentLabel(pathname: string) {
  const match = [...adminNav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
  return match?.label ?? "Overview";
}

export function AdminHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const { data } = useAdminMeQuery();
  const role = data?.moderatorRole ?? null;
  const label = currentLabel(pathname);
  const isDetail =
    pathname !== "/admin" &&
    adminNav.every((item) => item.href !== pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="rounded-lg p-2 text-heading hover:bg-surface lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-2 text-[13px]">
              <li className="shrink-0 text-muted">
                <Link href="/admin" className="hover:text-link">
                  Admin
                </Link>
              </li>
              <li className="text-muted" aria-hidden>
                /
              </li>
              <li className="truncate font-medium uppercase tracking-wide text-heading">
                {label}
                {isDetail ? (
                  <span className="font-normal normal-case tracking-normal text-muted">
                    {" "}
                    · Details
                  </span>
                ) : null}
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {role ? (
            <span className="hidden rounded-full bg-tonal px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-link sm:inline-flex">
              {role}
            </span>
          ) : null}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-link hover:bg-tonal"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Seller dashboard</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
