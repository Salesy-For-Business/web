"use client";

import { useLayoutEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import {
  applyTheme,
  getThemePreference,
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

export function ThemeToggle({
  variant = "icons",
}: {
  variant?: "icons" | "labeled";
}) {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useLayoutEffect(() => {
    const next = getThemePreference();
    setPreference(next);
    applyTheme(next);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getThemePreference() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function select(next: ThemePreference) {
    setPreference(next);
    applyTheme(next);
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

  return (
    <div
      className="flex items-center rounded-full border border-border p-1"
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
  );
}
