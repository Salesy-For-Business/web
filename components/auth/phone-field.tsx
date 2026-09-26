"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/auth/styles";
import {
  defaultPhoneCountry,
  detectPhoneCountry,
  flagSrc,
  PHONE_COUNTRIES,
  type PhoneCountry,
} from "@/lib/phone-countries";

/** Real flag SVG, not the Unicode flag emoji — Windows has no flag glyphs
 * in its default emoji font, so browsers there render bare letters
 * ("NG") instead of a flag for the emoji version. */
function FlagIcon({ iso2, className }: { iso2: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagSrc(iso2)}
      alt=""
      className={clsx("inline-block rounded-[2px] object-cover", className)}
    />
  );
}

type PhoneFieldProps = {
  label: string;
  name: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** Full value including the "+" and dial code, e.g. "+2348012345678". */
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
};

function composeValue(country: PhoneCountry, digits: string) {
  return `+${country.dialCode}${digits}`;
}

/** Splits a full value into its country + local-number parts. Fully
 * derived from `value` on every render — no internal echo state to keep
 * in sync, so external resets (react-hook-form's `reset()`) just work. */
function splitValue(value: string | undefined) {
  const country = detectPhoneCountry(value) ?? defaultPhoneCountry();
  const digits = (value ?? "").replace(/\D/g, "");
  const local = digits.startsWith(country.dialCode)
    ? digits.slice(country.dialCode.length)
    : digits;
  return { country, local };
}

export function PhoneField({
  label,
  name,
  autoComplete = "tel",
  /** Falls back to the selected country's own example format when unset —
   * only pass this to force a fixed placeholder regardless of country. */
  placeholder,
  hint = "Select your country, then enter your number.",
  error,
  disabled,
  value,
  onChange,
  onBlur,
  className,
}: PhoneFieldProps) {
  const id = name;
  const { country, local } = splitValue(value);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase() === q,
    );
  }, [query]);

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

  function pickCountry(next: PhoneCountry) {
    close();
    onChange?.(composeValue(next, local));
  }

  function onLocalChange(raw: string) {
    // A leading trunk "0" (how most people write/dial a local number, e.g.
    // "0801 234 5678") should be dropped once combined with a country code.
    const digits = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12);
    onChange?.(composeValue(country, digits));
  }

  return (
    <div className={className} ref={rootRef}>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <div className="flex">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Country code, currently ${country.name}`}
            className="flex h-12 items-center gap-1.5 rounded-l-lg border border-r-0 border-border bg-surface px-3 text-[14px] text-heading hover:bg-tonal disabled:opacity-60"
          >
            <FlagIcon iso2={country.iso2} className="h-3.5 w-5 shrink-0" />
            <span>+{country.dialCode}</span>
            <ChevronDown
              className={clsx(
                "size-3.5 text-muted transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {open ? (
            <div
              role="listbox"
              aria-label="Country"
              className="absolute left-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
            >
              <div className="border-b border-border p-2">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country or code…"
                  autoComplete="off"
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[14px] text-heading outline-none placeholder:text-muted focus:border-primary"
                />
              </div>
              <ul className="max-h-64 overflow-y-auto py-1">
                {filtered.length ? (
                  filtered.map((c) => (
                    <li key={c.iso2}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={c.iso2 === country.iso2}
                        onClick={() => pickCountry(c)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] text-heading hover:bg-surface"
                      >
                        <FlagIcon iso2={c.iso2} className="h-3.5 w-5 shrink-0" />
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="text-muted">+{c.dialCode}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-4 text-center text-[13px] text-muted">
                    No matching country.
                  </li>
                )}
              </ul>
            </div>
          ) : null}
        </div>

        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          placeholder={placeholder ?? country.example}
          disabled={disabled}
          value={local}
          onChange={(e) => onLocalChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={clsx(inputClass, "rounded-l-none")}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={fieldHintClass}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
