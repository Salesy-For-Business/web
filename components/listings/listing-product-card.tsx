import Link from "next/link";
import clsx from "clsx";
import { Star } from "lucide-react";
import { ProductImage } from "@/components/storefront/product-grid";
import { formatMoney, productHref } from "@/lib/storefront";
import type { ListingProduct } from "@/lib/listings";

/** Deterministic pick from a small set of aspect ratios, so placeholder
 * (no-photo) cards still get masonry-style height variety instead of all
 * matching the default 4:5 ratio. */
const MASONRY_PLACEHOLDER_RATIOS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/5]"];

function placeholderRatioFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return MASONRY_PLACEHOLDER_RATIOS[hash % MASONRY_PLACEHOLDER_RATIOS.length];
}

function FeaturedBadge() {
  return (
    <span
      className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur-sm"
      title="Featured"
    >
      <Star className="size-4 fill-yellow-400 text-yellow-400" aria-hidden />
    </span>
  );
}

function ListingInfo({ product }: { product: ListingProduct }) {
  return (
    <div className="mt-3 space-y-1">
      <p className="truncate text-[12px] font-medium uppercase tracking-[0.12em] text-muted">
        from {product.businessName}
      </p>
      <h2 className="text-[16px] leading-6 text-heading group-hover:text-link">
        {product.name}
      </h2>
      <p className="flex flex-wrap items-baseline gap-2 text-[15px]">
        <span className="font-medium text-heading">
          {formatMoney(product.price, product.currency)}
        </span>
        {product.compareAt ? (
          <span className="text-[13px] text-muted line-through">
            {formatMoney(product.compareAt, product.currency)}
          </span>
        ) : null}
      </p>
    </div>
  );
}

export function ListingProductCard({ product }: { product: ListingProduct }) {
  return (
    <Link
      href={`${productHref(product.storeHandle, product.slug)}?from=marketplace`}
      className="group block"
    >
      <div className="relative">
        <ProductImage product={product} />
        {product.isFeatured ? <FeaturedBadge /> : null}
      </div>
      <ListingInfo product={product} />
    </Link>
  );
}

function MasonryListingCard({ product }: { product: ListingProduct }) {
  const image = product.images?.[0];
  return (
    <Link
      href={`${productHref(product.storeHandle, product.slug)}?from=marketplace`}
      className="group mb-4 block break-inside-avoid"
    >
      <div className="relative overflow-hidden rounded-xl bg-surface">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} className="block w-full" />
        ) : (
          <div
            className={clsx(
              "relative flex items-end",
              placeholderRatioFor(product.id),
            )}
            style={{
              background: `linear-gradient(145deg, ${product.accent} 0%, color-mix(in srgb, ${product.accent} 55%, #0a0a0a) 100%)`,
            }}
          >
            <p className="relative z-[1] p-4 font-display text-[20px] leading-6 tracking-tight text-white/95">
              {product.name}
            </p>
          </div>
        )}
        {product.isFeatured ? <FeaturedBadge /> : null}
      </div>
      <ListingInfo product={product} />
    </Link>
  );
}

export function ListingProductGrid({
  products,
  layout = "grid",
}: {
  products: ListingProduct[];
  layout?: "grid" | "masonry";
}) {
  if (layout === "masonry") {
    return (
      <div className="columns-2 gap-4 sm:columns-3 xl:columns-4">
        {products.map((product) => (
          <MasonryListingCard
            key={`${product.storeHandle}-${product.id}`}
            product={product}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ListingProductCard
          key={`${product.storeHandle}-${product.id}`}
          product={product}
        />
      ))}
    </div>
  );
}
