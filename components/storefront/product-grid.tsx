"use client";

import Link from "next/link";
import clsx from "clsx";
import { formatNaira, productHref, type StoreProduct } from "@/lib/storefront";
import { useStorefront } from "@/components/storefront/store-context";

export function ProductImage({
  product,
  className,
}: {
  product: StoreProduct;
  className?: string;
}) {
  const image = product.images?.[0];

  if (image) {
    return (
      <div
        className={clsx(
          "relative aspect-[4/5] overflow-hidden rounded-xl bg-surface",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative flex aspect-[4/5] items-end overflow-hidden rounded-xl",
        className,
      )}
      style={{
        background: `linear-gradient(145deg, ${product.accent} 0%, color-mix(in srgb, ${product.accent} 55%, #0a0a0a) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 0%, transparent 45%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)",
        }}
      />
      <p className="relative z-[1] p-4 font-display text-[22px] leading-7 tracking-tight text-white/95 sm:text-[24px]">
        {product.name}
      </p>
    </div>
  );
}

export function ProductCard({ product }: { product: StoreProduct }) {
  const store = useStorefront();
  return (
    <Link
      href={productHref(store.handle, product.slug)}
      className="group block"
    >
      <ProductImage product={product} />
      <div className="mt-3 space-y-1">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">
          {product.category}
        </p>
        <h2 className="text-[16px] leading-6 text-heading group-hover:text-link">
          {product.name}
        </h2>
        <p className="flex flex-wrap items-baseline gap-2 text-[15px]">
          <span className="font-medium text-heading">
            {formatNaira(product.price)}
          </span>
          {product.compareAt ? (
            <span className="text-[13px] text-muted line-through">
              {formatNaira(product.compareAt)}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
