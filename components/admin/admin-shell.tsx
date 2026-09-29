"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminGate } from "@/components/admin/admin-gate";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { ModeratorRole } from "@/lib/auth-store";

export function AdminShell({
  allow,
  children,
}: {
  allow: ModeratorRole[] | "any";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The drawer is open only for the path it was opened on, so navigating closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <AdminGate allow={allow}>
      <div className="flex min-h-full flex-1 bg-background">
        <AdminSidebar open={menuOpen} onClose={() => setMenuPath(null)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onMenuOpen={() => setMenuPath(pathname)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminGate>
  );
}
