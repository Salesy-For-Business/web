import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontMissing } from "@/components/storefront/storefront-missing";
import {
  absoluteStoreUrl,
  normalizeStoreHandle,
  resolveStoreOgImage,
  type Storefront,
} from "@/lib/storefront";
import { resolveStorefront } from "@/lib/storefront-db";

type StoreHandleParams = { storeHandle: string };

/** JSON-LD Organization/Store schema — helps search engines show the
 * store name, logo, and description as rich results. */
function storeJsonLd(store: Storefront) {
  const image = resolveStoreOgImage(store);
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.businessName,
    description: store.description,
    url: absoluteStoreUrl(store.handle),
    ...(image ? { image, logo: image } : {}),
    ...(store.contact.email ? { email: store.contact.email } : {}),
    ...(store.contact.phone ? { telephone: store.contact.phone } : {}),
  };
}

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

  const title = store.businessName;
  const description = store.tagline || store.description;
  const url = absoluteStoreUrl(store.handle);
  const image = resolveStoreOgImage(store);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Salesy",
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: store.businessName }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
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

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd(store)) }}
      />
      <StorefrontShell store={store}>{children}</StorefrontShell>
    </>
  );
}
