"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/auth/styles";

export type SelectOption<V extends string = string> = {
  value: V;
  label: React.ReactNode;
  /** Plain-text label used for type-ahead and the closed trigger when `label` isn't a string. */
  textLabel?: string;
  disabled?: boolean;
};

type SelectProps<V extends string> = {
  id?: string;
  name?: string;
  label?: React.ReactNode;
  /** Accessible name when there's no visible label. */
  ariaLabel?: string;
  options: SelectOption<V>[];
  value: V | "";
  onChange: (value: V) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  size?: "md" | "sm";
  className?: string;
  triggerClassName?: string;
};

const MENU_MAX_HEIGHT = 280;

function optionText(option: SelectOption) {
  if (option.textLabel) return option.textLabel;
  return typeof option.label === "string" ? option.label : option.value;
}

/**
 * Custom single-value select: a button trigger with a ChevronDown and a
 * keyboard-navigable listbox. Use `SearchableSelect` for long lists.
 */
export function Select<V extends string = string>({
  id,
  name,
  label,
  ariaLabel,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select…",
  disabled = false,
  error,
  hint,
  size = "md",
  className,
  triggerClassName,
}: SelectProps<V>) {
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const listboxId = `${triggerId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", at: 0 });

  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onBlur]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function firstEnabled(from: number, step: 1 | -1) {
    let i = from;
    for (let n = 0; n < options.length; n += 1) {
      if (i < 0) i = options.length - 1;
      if (i >= options.length) i = 0;
      if (!options[i]?.disabled) return i;
      i += step;
    }
    return -1;
  }

  function openMenu(startIndex?: number) {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setOpenUp(below < MENU_MAX_HEIGHT && rect.top > below);
    }
    setActiveIndex(
      startIndex ?? (selectedIndex >= 0 ? selectedIndex : firstEnabled(0, 1)),
    );
    setOpen(true);
  }

  function closeMenu(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function pick(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    closeMenu();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => firstEnabled(i + 1, 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => firstEnabled(i - 1, -1));
        return;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(firstEnabled(0, 1));
        }
        return;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(firstEnabled(options.length - 1, -1));
        }
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) pick(activeIndex);
        else openMenu();
        return;
      case "Escape":
        if (open) {
          event.preventDefault();
          closeMenu();
        }
        return;
      case "Tab":
        if (open) setOpen(false);
        return;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
          const now = Date.now();
          const state = typeahead.current;
          state.text = now - state.at > 600 ? event.key : state.text + event.key;
          state.at = now;
          const q = state.text.toLowerCase();
          const match = options.findIndex(
            (o) => !o.disabled && optionText(o).toLowerCase().startsWith(q),
          );
          if (match >= 0) {
            if (open) setActiveIndex(match);
            else onChange(options[match]!.value);
          }
        }
    }
  }

  const triggerBase =
    size === "sm"
      ? clsx(
          "h-10 w-full rounded-lg border border-border bg-background px-3 text-[14px] text-foreground",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )
      : inputClass;

  return (
    <div className={clsx("relative", className)} ref={rootRef}>
      {label ? (
        <label htmlFor={triggerId} className={fieldLabelClass}>
          {label}
        </label>
      ) : null}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          name={name}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
          }
          disabled={disabled}
          onClick={() => (open ? closeMenu(false) : openMenu())}
          onKeyDown={onKeyDown}
          className={clsx(
            triggerBase,
            "flex items-center justify-between gap-2 text-left",
            !selected && "text-muted",
            triggerClassName,
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={clsx(
              "size-4 shrink-0 text-muted transition-transform duration-150",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {open ? (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            style={{ maxHeight: MENU_MAX_HEIGHT }}
            className={clsx(
              "absolute left-0 z-30 min-w-full overflow-y-auto rounded-lg border border-border bg-background py-1 shadow-lg",
              openUp ? "bottom-full mb-2" : "top-full mt-2",
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${listboxId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onPointerEnter={() => !option.disabled && setActiveIndex(index)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => pick(index)}
                  className={clsx(
                    "flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-[14px]",
                    option.disabled
                      ? "cursor-not-allowed text-muted opacity-60"
                      : "text-heading",
                    isActive && !option.disabled && "bg-surface",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected ? (
                    <Check className="size-4 shrink-0 text-link" aria-hidden />
                  ) : null}
                </li>
              );
            })}
          </ul>
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
