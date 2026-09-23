import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/product-detail";
import {
  absoluteStoreUrl,
  formatNaira,
  getProduct,
  resolveStoreOgImage,
  type Storefront,
  type StoreProduct,
} from "@/lib/storefront";
import { resolveStorefront } from "@/lib/storefront-db";

type StoreProductParams = { storeHandle: string; slug: string };

/** JSON-LD Product schema — lets search engines show price/availability. */
function productJsonLd(
  store: Storefront,
  product: StoreProduct,
  url: string,
  image: string | null,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(image ? { image: [image] } : {}),
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: store.businessName },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "NGN",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<StoreProductParams>;
}): Promise<Metadata> {
  const { storeHandle, slug } = await params;
  const store = await resolveStorefront(storeHandle);
  const product = store ? getProduct(store, slug) : null;
  if (!store || !product) {
    return { robots: { index: false, follow: false } };
  }

  const title = `${product.name} — ${store.businessName}`;
  const description = `${product.description} ${formatNaira(product.price)} · ${store.businessName}`.slice(
    0,
    200,
  );
  const url = absoluteStoreUrl(store.handle, `/products/${product.slug}`);
  const image = product.images?.[0] ?? resolveStoreOgImage(store);

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
        ? [{ url: image, width: 1200, height: 630, alt: product.name }]
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

export default async function StoreProductPage({
  params,
}: {
  params: Promise<StoreProductParams>;
}) {
  const { storeHandle, slug } = await params;
  const store = await resolveStorefront(storeHandle);
  // Store missing is handled by the parent layout UI.
  if (!store) notFound();
  const product = getProduct(store, slug);
  if (!product) notFound();

  const url = absoluteStoreUrl(store.handle, `/products/${product.slug}`);
  const image = product.images?.[0] ?? resolveStoreOgImage(store);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(store, product, url, image)),
        }}
      />
      <ProductDetail product={product} />
    </>
  );
}
