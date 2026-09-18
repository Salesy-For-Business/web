"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import clsx from "clsx";
import { ProductGrid } from "@/components/storefront/product-grid";
import { inputClass } from "@/components/auth/styles";
import type { StoreProduct } from "@/lib/storefront";

type TimeFilter = "latest" | "recent" | "oldest";
type PriceFilter = "any" | "low-high" | "high-low";

const TIME_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "recent", label: "Recent" },
  { id: "oldest", label: "Oldest" },
];

const PRICE_OPTIONS: { id: PriceFilter; label: string }[] = [
  { id: "any", label: "Any price" },
  { id: "low-high", label: "Price: low to high" },
  { id: "high-low", label: "Price: high to low" },
];

const RECENT_MS = 30 * 24 * 60 * 60 * 1000;

function productTimestamp(product: StoreProduct) {
  if (product.createdAt) {
    const t = Date.parse(product.createdAt);
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

function matchesQuery(product: StoreProduct, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    product.name,
    product.description,
    product.category,
    ...(product.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function filterAndSort(
  products: StoreProduct[],
  query: string,
  time: TimeFilter,
  price: PriceFilter,
) {
  const now = Date.now();
  let next = products.filter((p) => matchesQuery(p, query));

  if (time === "recent") {
    next = next.filter((p) => {
      const ts = productTimestamp(p);
      return ts === 0 || now - ts <= RECENT_MS;
    });
  }

  next.sort((a, b) => {
    if (price === "low-high") {
      return a.price - b.price || a.name.localeCompare(b.name);
    }
    if (price === "high-low") {
      return b.price - a.price || a.name.localeCompare(b.name);
    }

    if (time === "oldest") {
      return (
        productTimestamp(a) - productTimestamp(b) ||
        a.name.localeCompare(b.name)
      );
    }

    // latest + recent (newest first)
    return (
      productTimestamp(b) - productTimestamp(a) ||
      a.name.localeCompare(b.name)
    );
  });

  return next;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={clsx("relative block", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(inputClass, "appearance-none pr-10")}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </label>
  );
}

export function ShopCatalog({ products }: { products: StoreProduct[] }) {
  const [query, setQuery] = useState("");
  const [time, setTime] = useState<TimeFilter>("latest");
  const [price, setPrice] = useState<PriceFilter>("any");

  const filtered = useMemo(
    () => filterAndSort(products, query, time, price),
    [products, query, time, price],
  );

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-[14px] text-muted">
        This store hasn’t listed products yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search products</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className={clsx(inputClass, "pl-10 pr-10")}
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-surface hover:text-heading"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0">
          <SelectField
            label="Sort by date"
            value={time}
            onChange={(v) => setTime(v as TimeFilter)}
            options={TIME_OPTIONS}
            className="sm:w-40"
          />
          <SelectField
            label="Sort by price"
            value={price}
            onChange={(v) => setPrice(v as PriceFilter)}
            options={PRICE_OPTIONS}
            className="sm:w-52"
          />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-[22px] text-heading">Shop</h2>
        <p className="text-[13px] text-muted">
          {filtered.length === products.length
            ? `${products.length} products`
            : `${filtered.length} of ${products.length} products`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-[14px] text-muted">
          No products match your search or filters. Try adjusting them.
        </p>
      ) : (
        <ProductGrid products={filtered} />
      )}
    </div>
  );
}
