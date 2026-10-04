"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ListingProductGrid } from "@/components/listings/listing-product-card";
import type { ListingProduct } from "@/lib/listings";

export function ListingsBrowser({
  initialProducts,
  query = "",
  category = "",
  layout = "grid",
}: {
  initialProducts: ListingProduct[];
  /** Search text and/or category filter — when either is set, pagination
   * hits the search endpoint instead of the random feed. Pass a `key` that
   * changes with these on the caller side so the component remounts (and
   * its state resets) whenever a filter changes. */
  query?: string;
  category?: string;
  layout?: "grid" | "masonry";
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
      const params = new URLSearchParams({ exclude });
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      const res = await fetch(`/api/listings/more?${params.toString()}`);
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
  }, [loading, hasMore, query, category]);

  // A filtered view (search/category) starts with no server-rendered
  // products, so fetch its first page as soon as it mounts.
  useEffect(() => {
    if (initialProducts.length === 0 && (query || category)) {
      const t = window.setTimeout(() => void loadMore(), 0);
      return () => window.clearTimeout(t);
    }
    // Only on mount for this instance — the parent remounts this component
    // (via a changing `key`) whenever query/category change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {loading
          ? "Loading…"
          : query || category
            ? "No products match your search."
            : "No products to show yet — check back soon."}
      </p>
    );
  }

  return (
    <div>
      <ListingProductGrid products={products} layout={layout} />
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
