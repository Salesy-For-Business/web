"use client";

import clsx from "clsx";
import { Search } from "lucide-react";
import { inputClass } from "@/components/auth/styles";

export type ResourceColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export function ResourceTable<T extends { id: string }>({
  columns,
  rows,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  loading,
  emptyLabel = "Nothing here yet.",
  onRowClick,
  filters,
  summary,
}: {
  columns: ResourceColumn<T>[];
  rows: T[];
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyLabel?: string;
  onRowClick?: (row: T) => void;
  /** Extra controls (selects, chips) shown beside the search box. */
  filters?: React.ReactNode;
  /** Right-aligned text such as a result count. */
  summary?: React.ReactNode;
}) {
  const hasToolbar = Boolean(onSearchChange || filters || summary);

  return (
    <div>
      {hasToolbar ? (
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          {onSearchChange ? (
            <div className="relative w-full md:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                type="search"
                className={clsx(inputClass, "pl-9")}
                placeholder={searchPlaceholder}
                value={search ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={searchPlaceholder}
              />
            </div>
          ) : null}
          {filters ? (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          ) : null}
          {summary ? (
            <p className="text-[13px] text-muted md:ml-auto">{summary}</p>
          ) : null}
        </div>
      ) : null}

      <div className="-mx-4 overflow-x-auto overscroll-x-contain sm:mx-0">
        <div className="inline-block min-w-full align-middle sm:rounded-xl sm:border sm:border-border">
          <div className="overflow-hidden border-y border-border sm:rounded-xl sm:border">
            <table className="w-full min-w-[36rem] text-left text-[14px]">
              <thead className="border-b border-border bg-surface text-[12px] uppercase tracking-wide text-muted">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-medium">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted"
                    >
                      {emptyLabel}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className={clsx(
                        "hover:bg-surface/60",
                        onRowClick && "cursor-pointer",
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={clsx("px-4 py-3.5", col.className)}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
