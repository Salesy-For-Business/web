import type { Metadata } from "next";
import { DEMO_STORE } from "@/lib/storefront";
import { StorefrontShell } from "@/components/storefront/storefront-shell";

export const metadata: Metadata = {
  title: `${DEMO_STORE.businessName} — Salesy store`,
  description: DEMO_STORE.tagline,
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorefrontShell store={DEMO_STORE}>{children}</StorefrontShell>;
}
