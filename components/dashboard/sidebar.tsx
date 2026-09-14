"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  dashboardNav,
  storeInitial,
} from "@/lib/dashboard";
import {
  planLabel,
  useAuthStore,
} from "@/lib/auth-store";

export function DashboardSidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const business = useAuthStore((s) => s.business);
  const signOut = useAuthStore((s) => s.signOut);

  const name = business?.businessName ?? "Your store";
  const plan = business?.plan ?? "free";
  const handle = business?.storeHandle ?? "mystore";
  const storeUrl = `/${handle}`;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link
          href="/dashboard"
          className="font-display text-[22px] tracking-tight text-heading hover:text-heading"
          onClick={onClose}
        >
          Salesy
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-heading lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <div className="mx-5 rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-3">
          {business?.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoDataUrl}
              alt=""
              className="size-11 rounded-lg object-cover"
            />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-lg bg-tonal text-[18px] font-medium text-link">
              {storeInitial(name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-heading">{name}</p>
            <p className="mt-0.5 text-[12px] uppercase tracking-wide text-muted">
              {planLabel(plan)}
            </p>
            <p className="truncate text-[12px] text-muted">/{handle}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1 px-3">
        <Link
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium text-link hover:bg-tonal"
          onClick={onClose}
        >
          <ExternalLink className="size-4 shrink-0" aria-hidden />
          Live storefront
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium text-heading hover:bg-surface"
          onClick={() => {
            signOut();
            window.location.href = "/signin";
          }}
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Sign out
        </button>
      </div>

      <p className="mt-6 px-6 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        Platform
      </p>
      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {dashboardNav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium",
                active
                  ? "bg-tonal text-link"
                  : "text-heading hover:bg-surface hover:text-heading",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-md bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-500">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto">{content}</div>
      </aside>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" key="mobile-sidebar">
            <motion.button
              type="button"
              className="absolute inset-0 bg-heading/40"
              aria-label="Close menu"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[min(20rem,88vw)] bg-background shadow-lg"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {content}
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
