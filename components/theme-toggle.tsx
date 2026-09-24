"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  applyTheme,
  getThemePreference,
  subscribeThemeChange,
  type ThemePreference,
} from "@/lib/theme";

const modes: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

/** Matches the server-rendered (and pre-hydration) attribute state — see
 * `THEME_INIT_SCRIPT`, which already paints the real theme before React
 * hydrates. This is only what the toggle itself shows as "selected". */
function getServerSnapshot(): ThemePreference {
  return "system";
}

export function ThemeToggle({
  variant = "icons",
}: {
  variant?: "icons" | "labeled";
}) {
  // Reads the persisted preference without stashing it in useState: React
  // renders `getServerSnapshot()` during SSR and the initial client
  // hydration pass (so there's no mismatch), then swaps in the real
  // `getThemePreference()` value itself — no manual setState-in-effect
  // needed to sync it.
  const preference = useSyncExternalStore(
    subscribeThemeChange,
    getThemePreference,
    getServerSnapshot,
  );

  // Pure side effect: keep the resolved theme in sync with the OS-level
  // scheme while "System" is selected. Doesn't read/write React state, so
  // it's just synchronizing with an external system (the media query and
  // the DOM), not deriving state React already has.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getThemePreference() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Open state for the mobile dropdown menu only.
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(next: ThemePreference) {
    applyTheme(next);
    setOpen(false);
  }

  if (variant === "labeled") {
    return (
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
        {modes.map(({ value, label, icon: Icon }) => {
          const selected = preference === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => select(value)}
              className={clsx(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-[14px] font-medium",
                selected
                  ? "border-transparent bg-tonal text-link"
                  : "border-border text-heading hover:bg-surface",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  const CurrentIcon = modes.find((mode) => mode.value === preference)?.icon ?? Monitor;

  return (
    <>
      {/* Mobile: a compact button that opens a dropdown menu, so the toggle
          doesn't crowd the toolbar. */}
      <div ref={menuRef} className="relative sm:hidden">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Theme"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-heading hover:bg-surface"
        >
          <CurrentIcon className="size-4 text-muted" aria-hidden />
          <ChevronDown
            className={clsx(
              "size-3.5 text-muted transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              role="menu"
              aria-label="Theme"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full z-20 mt-2 min-w-40 origin-top-right overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg"
            >
              {modes.map(({ value, label, icon: Icon }) => {
                const selected = preference === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => select(value)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[14px] text-heading hover:bg-surface"
                  >
                    <Icon className="size-4 text-muted" aria-hidden />
                    <span className="flex-1 text-left">{label}</span>
                    {selected ? (
                      <Check className="size-4 text-link" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Larger screens: icon-segmented control. */}
      <div
        className="hidden items-center rounded-full border border-border p-1 sm:flex"
        role="radiogroup"
        aria-label="Theme"
      >
        {modes.map(({ value, label, icon: Icon }) => {
          const selected = preference === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label}
              title={label}
              onClick={() => select(value)}
              className={clsx(
                "flex size-9 items-center justify-center rounded-full",
                selected
                  ? "bg-tonal text-link"
                  : "text-muted hover:bg-surface hover:text-heading",
              )}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
    </>
  );
}
