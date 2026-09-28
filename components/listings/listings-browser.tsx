"use client";

import { useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { secondaryButtonClass } from "@/components/auth/styles";
import { ListingProductGrid } from "@/components/listings/listing-product-card";
import type { ListingProduct } from "@/lib/listings";

export function ListingsBrowser({
  initialProducts,
}: {
  initialProducts: ListingProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const exclude = products.map((p) => p.id).join(",");
      const res = await fetch(
        `/api/listings/more?exclude=${encodeURIComponent(exclude)}`,
      );
      const data = (await res.json()) as {
        ok: boolean;
        products?: ListingProduct[];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not load more products.");
      }
      if (!data.products || data.products.length === 0) {
        toast.message("That’s everything for now.");
      } else {
        setProducts((prev) => [...prev, ...data.products!]);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load more products.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-[14px] text-muted">
        No products to show yet — check back soon.
      </p>
    );
  }

  return (
    <div>
      <ListingProductGrid products={products} />
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loading}
          className={clsx(secondaryButtonClass, "w-auto min-w-40 px-6")}
        >
          {loading ? "Loading…" : "Show more"}
        </button>
      </div>
    </div>
  );
}
