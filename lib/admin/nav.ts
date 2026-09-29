import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Wallet,
  Star,
  Ticket,
  Store,
  Users,
  ShoppingBag,
  Package,
  ShieldCheck,
  Settings,
  ScrollText,
  Layers,
  PlugZap,
} from "lucide-react";
import type { ModeratorRole } from "@/lib/auth-store";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: ModeratorRole[] | "any";
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ["superadmin"] },
  { href: "/admin/finance", label: "Finance", icon: Wallet, roles: ["finance", "superadmin"] },
  { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["support", "superadmin"] },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket, roles: ["support", "superadmin"] },
  { href: "/admin/businesses", label: "Businesses", icon: Store, roles: ["superadmin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["superadmin"] },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, roles: ["superadmin"] },
  { href: "/admin/products", label: "Products", icon: Package, roles: ["superadmin"] },
  { href: "/admin/plans", label: "Plans", icon: Layers, roles: ["superadmin"] },
  { href: "/admin/moderators", label: "Moderators", icon: ShieldCheck, roles: ["superadmin"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["superadmin"] },
  { href: "/admin/integrations", label: "Integrations", icon: PlugZap, roles: ["superadmin"] },
  { href: "/admin/audit-log", label: "Audit log", icon: ScrollText, roles: ["superadmin"] },
];

export function navForRole(role: ModeratorRole): AdminNavItem[] {
  return adminNav.filter((item) => item.roles === "any" || item.roles.includes(role));
}

export function landingPathForRole(role: ModeratorRole): string {
  if (role === "finance") return "/admin/finance";
  if (role === "support") return "/admin/tickets";
  return "/admin";
}
