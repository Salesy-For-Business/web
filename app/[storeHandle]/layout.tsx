import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontMissing } from "@/components/storefront/storefront-missing";
import { normalizeStoreHandle } from "@/lib/storefront";
import { resolveStorefront } from "@/lib/storefront-db";

type StoreHandleParams = { storeHandle: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<StoreHandleParams>;
}): Promise<Metadata> {
  const { storeHandle } = await params;
  const store = await resolveStorefront(storeHandle);
  if (!store) {
    return {
      title: "Store not found — Salesy",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${store.businessName} — Salesy store`,
    description: store.tagline,
  };
}

/**
 * Resolve `/{storeHandle}` from MongoDB (with seed fallback for demo).
 * Missing stores get the storefront-specific empty state.
 */
export default async function StoreHandleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<StoreHandleParams>;
}) {
  const { storeHandle: raw } = await params;
  const storeHandle = normalizeStoreHandle(raw);
  const store = await resolveStorefront(storeHandle);

  if (!store) {
    return <StorefrontMissing handle={storeHandle} />;
  }

  return <StorefrontShell store={store}>{children}</StorefrontShell>;
}
