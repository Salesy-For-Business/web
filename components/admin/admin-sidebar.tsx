"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, LogOut, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { navForRole } from "@/lib/admin/nav";
import { useAdminMeQuery } from "@/lib/admin/queries";
import { useSignOutMutation } from "@/lib/auth/queries";
import { useAuthStore } from "@/lib/auth-store";
import { Logo } from "@/components/logo";

export function AdminSidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useAdminMeQuery();
  const user = useAuthStore((s) => s.user);
  const clearLocal = useAuthStore((s) => s.signOut);
  const signOutMutation = useSignOutMutation();
  const role = data?.moderatorRole ?? null;
  const items = role ? navForRole(role) : [];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function signOut() {
    try {
      await signOutMutation.mutateAsync();
    } catch {
      toast.error("Signed out locally. Session may still be open.");
    }
    clearLocal();
    queryClient.clear();
    router.replace("/signin");
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="hover:opacity-90" onClick={onClose}>
          <Logo />
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

      <div className="mx-5 rounded-xl border border-border bg-surface px-3 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          Signed in as
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-heading">
          {user?.firstName
            ? `${user.firstName} ${user.lastName}`.trim()
            : (user?.email ?? "Moderator")}
        </p>
        <p className="mt-0.5 text-[12px] capitalize text-muted">
          {role ?? "…"}
        </p>
      </div>

      <p className="mt-6 px-6 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        Admin
      </p>
      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
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
                  ? "bg-tonal text-link dark:bg-primary dark:text-white"
                  : "text-heading hover:bg-surface hover:text-heading",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium text-link hover:bg-tonal"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Seller dashboard
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium text-heading hover:bg-surface"
          onClick={() => void signOut()}
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto">{content}</div>
      </aside>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" key="admin-mobile-sidebar">
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
