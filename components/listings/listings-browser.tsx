"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ListingProductGrid } from "@/components/listings/listing-product-card";
import type { ListingProduct } from "@/lib/listings";

export function ListingsBrowser({
  initialProducts,
}: {
  initialProducts: ListingProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef(products);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const exclude = productsRef.current.map((p) => p.id).join(",");
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
        setHasMore(false);
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
  }, [loading, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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
      <div ref={sentinelRef} className="h-1" aria-hidden />
      {loading ? (
        <p className="mt-8 text-center text-[13px] text-muted">Loading more…</p>
      ) : !hasMore ? (
        <p className="mt-8 text-center text-[13px] text-muted">
          You’ve reached the end.
        </p>
      ) : null}
    </div>
  );
}
