"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Minus, Plus } from "lucide-react";
import clsx from "clsx";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ShareButton } from "@/components/storefront/share-sheet";
import { useStorefront } from "@/components/storefront/store-context";
import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { useCartStore } from "@/lib/cart-store";
import {
  formatMoney,
  productHref,
  storePath,
  type StoreProduct,
} from "@/lib/storefront";

export function ProductDetail({ product }: { product: StoreProduct }) {
  const store = useStorefront();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function cartPayload() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      accent: product.accent,
      image: product.images?.[0],
    };
  }

  function addToCart() {
    addItem(cartPayload(), qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function buyNow() {
    addItem(cartPayload(), qty);
    router.push(storePath(store.handle, "/checkout"));
  }

  return (
    <>
      <Link
        href={storePath(store.handle)}
        className="inline-flex h-12 items-center text-[14px] font-medium text-link hover:text-link-hover"
      >
        <ChevronLeft className="size-4" /> All products
      </Link>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery product={product} className="lg:sticky lg:top-24" />
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-[32px] leading-10 tracking-tight text-heading sm:text-[40px] sm:leading-[1.15]">
            {product.name}
          </h1>
          <p className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-[24px] font-medium text-heading">
              {formatMoney(product.price, store.currency)}
            </span>
            {product.compareAt ? (
              <span className="text-[16px] text-muted line-through">
                {formatMoney(product.compareAt, store.currency)}
              </span>
            ) : null}
          </p>
          {product.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-surface px-2.5 py-1 text-[12px] font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-5 max-w-prose text-[16px] leading-6 text-muted">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-lg border border-border">
              <button
                type="button"
                className="px-3 text-heading hover:bg-surface"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-10 text-center text-[16px] font-medium tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                className="px-3 text-heading hover:bg-surface"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
              >
                <Plus className="size-4" />
              </button>
            </div>

            <ShareButton
              url={productHref(store.handle, product.slug)}
              text={`${product.name} — ${formatMoney(product.price, store.currency)} at ${store.businessName}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-surface-muted text-heading hover:bg-surface"
            />
          </div>
          <div className="grid gap-2 grid-cols-2 mt-4">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={addToCart}
              className={clsx(primaryButtonClass, "w-auto min-w-40 px-6")}
            >
              {added ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="size-4" /> Added
                </span>
              ) : product.inStock ? (
                "Add to cart"
              ) : (
                "Out of stock"
              )}
            </button>
            <button
              type="button"
              disabled={!product.inStock}
              onClick={buyNow}
              className={clsx(secondaryButtonClass, "w-auto min-w-40 px-6")}
            >
              Buy now
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={storePath(store.handle, "/cart")}
              className={clsx(secondaryButtonClass, "w-auto px-5")}
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
