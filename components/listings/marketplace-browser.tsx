"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Search, SquareStack, X } from "lucide-react";
import clsx from "clsx";
import { inputClass } from "@/components/auth/styles";
import { Select, type SelectOption } from "@/components/ui/select";
import { ListingsBrowser } from "@/components/listings/listings-browser";
import type { ListingProduct } from "@/lib/listings";

type Layout = "grid" | "masonry";

function LayoutToggle({
  layout,
  onChange,
}: {
  layout: Layout;
  onChange: (layout: Layout) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Layout"
      className="inline-flex justify-end shrink-0 rounded-lg border border-border bg-background p-0.5 w-fit"
    >
      {(
        [
          { value: "grid", label: "Grid", icon: LayoutGrid },
          { value: "masonry", label: "Masonry", icon: SquareStack },
        ] as const
      ).map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={layout === value}
          aria-label={`${label} layout`}
          title={`${label} layout`}
          onClick={() => onChange(value)}
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            layout === value
              ? "bg-tonal text-link"
              : "text-muted hover:text-heading",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}

export function MarketplaceBrowser({
  initialProducts,
  categories,
}: {
  initialProducts: ListingProduct[];
  categories: string[];
}) {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [layout, setLayout] = useState<Layout>("masonry");

  // Debounce the free-text search so it doesn't refetch on every keystroke.
  useEffect(() => {
    const t = window.setTimeout(() => setQuery(rawQuery.trim()), 350);
    return () => window.clearTimeout(t);
  }, [rawQuery]);

  const isFiltering = Boolean(query || category);

  const categoryOptions: SelectOption[] = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  function clearFilters() {
    setRawQuery("");
    setQuery("");
    setCategory("");
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            className={clsx(inputClass, "pl-9 pr-9")}
            placeholder="Search products across every store…"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            aria-label="Search the marketplace"
          />
          {rawQuery ? (
            <button
              type="button"
              onClick={() => setRawQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
              aria-label="Clear search"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        {categories.length > 0 ? (
          <Select
            ariaLabel="Filter by category"
            className="sm:w-56"
            placeholder="All categories"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
        ) : null}

        {isFiltering ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[13px] font-medium text-link hover:underline sm:shrink-0"
          >
            Clear
          </button>
        ) : null}

        <div className="flex justify-end">
          
        <LayoutToggle layout={layout} onChange={setLayout} />
</div>
      </div>

      <div className="mt-10">
        <ListingsBrowser
          key={`${query}|${category}`}
          initialProducts={isFiltering ? [] : initialProducts}
          query={query}
          category={category}
          layout={layout}
        />
      </div>
    </div>
  );
}
