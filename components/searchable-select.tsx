"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/auth/styles";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  id: string;
  label?: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  /** How many options show before the user types a search query. */
  visibleCount?: number;
  className?: string;
};

/**
 * A `<select>` styled like a text input that opens a searchable dropdown on
 * click, instead of a native picker — e.g. finding "Opay" or "Firstbank" in
 * a long bank list. Shows the first `visibleCount` options until the user
 * searches, then lists every match.
 */
export function SearchableSelect({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No matches found.",
  loading = false,
  loadingMessage = "Loading…",
  disabled = false,
  error,
  hint,
  visibleCount = 8,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxId = `${id}-listbox`;

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, visibleCount);
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, visibleCount]);

  // Pure side effect: while open, focus the search field and listen for the
  // gestures that close it. Closing itself (and resetting the query) always
  // happens at the event that causes it below, not derived here — so this
  // never needs to call setState on its own.
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function toggle() {
    if (open) close();
    else setOpen(true);
  }

  function pick(option: SearchableSelectOption) {
    onChange(option.value);
    close();
  }

  return (
    <div className={className} ref={rootRef}>
      {label ? (
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
        </label>
      ) : null}

      <div className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled || loading}
          onClick={toggle}
          className={clsx(
            inputClass,
            "flex items-center justify-between gap-2 text-left",
            !selected && "text-muted",
          )}
        >
          <span className="truncate">
            {loading ? loadingMessage : (selected?.label ?? placeholder)}
          </span>
          <ChevronDown
            className={clsx(
              "size-4 shrink-0 text-muted transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
          >
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[14px] text-heading outline-none placeholder:text-muted focus:border-primary"
                />
              </div>
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.length ? (
                filtered.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => pick(option)}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px] text-heading hover:bg-surface"
                      >
                        <span className="flex-1 truncate">{option.label}</span>
                        {isSelected ? (
                          <Check className="size-4 shrink-0 text-link" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-4 text-center text-[13px] text-muted">
                  {emptyMessage}
                </li>
              )}
            </ul>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={fieldHintClass}>{hint}</p>
      ) : null}
    </div>
  );
}
