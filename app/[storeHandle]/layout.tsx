import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontMissing } from "@/components/storefront/storefront-missing";
import { getStoreByHandle, normalizeStoreHandle } from "@/lib/storefront";

type StoreHandleParams = { storeHandle: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<StoreHandleParams>;
}): Promise<Metadata> {
  const { storeHandle } = await params;
  const store = getStoreByHandle(storeHandle);
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
 * Resolve `/{storeHandle}` here so missing stores get the storefront-specific
 * empty state (not the marketing 404). `notFound()` from a layout bubbles to
 * the root `app/not-found.tsx`, which is the wrong UI for this case.
 *
 * Later: swap `getStoreByHandle` for an API/DB fetch; keep this layout shape.
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
  const store = getStoreByHandle(storeHandle);

  if (!store) {
    return <StorefrontMissing handle={storeHandle} />;
  }

  return <StorefrontShell store={store}>{children}</StorefrontShell>;
}
