"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useStorefront } from "@/components/storefront/store-context";
import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira, productHref, storePath } from "@/lib/storefront";

export function CartView() {
  const store = useStorefront();
  const hydrated = useCartStore((s) => s.hydrated);
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  if (!hydrated) {
    return (
      <p className="text-[14px] text-muted" aria-live="polite">
        Loading cart…
      </p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background px-6 py-14 text-center">
        <h1 className="font-display text-[28px] text-heading">Your cart is empty</h1>
        <p className="mt-2 text-[15px] text-muted">
          Browse {store.businessName} and add something you like.
        </p>
        <Link
          href={storePath(store.handle)}
          className={clsx(primaryButtonClass, "mx-auto mt-6 w-auto px-6")}
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <h1 className="font-display text-[28px] tracking-tight text-heading sm:text-[32px]">
          Cart
        </h1>
        <ul className="divide-y divide-border rounded-xl border border-border bg-background">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-4 p-4 sm:p-5">
              <div
                className="size-20 shrink-0 rounded-lg sm:size-24"
                style={{
                  background: `linear-gradient(145deg, ${line.accent}, color-mix(in srgb, ${line.accent} 50%, #111))`,
                }}
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={productHref(store.handle, line.slug)}
                  className="font-medium text-heading hover:text-link"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-[14px] text-muted">
                  {formatNaira(line.price)} each
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex h-9 items-center rounded-lg border border-border">
                    <button
                      type="button"
                      className="px-2.5 hover:bg-surface"
                      aria-label="Decrease"
                      onClick={() => setQty(line.productId, line.qty - 1)}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-[13px] tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 hover:bg-surface"
                      aria-label="Increase"
                      onClick={() =>
                        setQty(line.productId, Math.min(20, line.qty + 1))
                      }
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-[15px] font-medium text-heading">
                {formatNaira(line.price * line.qty)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-background p-5 lg:col-span-2 lg:sticky lg:top-24">
        <h2 className="text-[16px] font-medium text-heading">Order summary</h2>
        <dl className="mt-4 space-y-2 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-medium text-heading">{formatNaira(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd className="text-muted">Calculated at checkout</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-border pt-4 flex justify-between text-[16px] font-medium text-heading">
          <span>Total</span>
          <span>{formatNaira(subtotal)}</span>
        </p>
        <Link
          href={storePath(store.handle, "/checkout")}
          className={clsx(primaryButtonClass, "mt-5")}
        >
          Checkout
        </Link>
        <Link
          href={storePath(store.handle)}
          className={clsx(secondaryButtonClass, "mt-3")}
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
