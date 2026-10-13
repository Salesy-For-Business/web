"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Moon,
  Plus,
  Share2,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { dashboardNav } from "@/lib/dashboard";

type PreviewTheme = "light" | "dark";

/**
 * Self-contained copies of the real theme tokens (see `app/globals.css`),
 * applied as inline CSS custom properties scoped to this mockup's own root
 * element. Deliberately NOT reusing the site-wide `bg-background`/
 * `text-heading`/etc. utility classes here — those resolve through the
 * global `[data-theme]` cascade on `<html>`, which this component doesn't
 * control, so a local toggle meant to preview "the other" theme would be
 * fighting the real one instead of overriding it. Inline custom properties
 * on this subtree sidestep that entirely: no cascade ambiguity, no
 * dependency on where `<html data-theme>` happens to be set.
 */
const PALETTES: Record<PreviewTheme, CSSProperties> = {
  light: {
    "--mock-bg": "#ffffff",
    "--mock-fg": "#414141",
    "--mock-heading": "#202124",
    "--mock-muted": "#5f6368",
    "--mock-link": "#1967d2",
    "--mock-tonal": "#e8f0fe",
    "--mock-border": "#dadce0",
    "--mock-surface": "#f8f9fa",
    "--mock-primary": "#1a73e8",
    "--mock-badge-bg": "#fef7e0",
    "--mock-badge-fg": "#b45309",
    "--mock-success-bg": "#e6f4ea",
    "--mock-success-fg": "#188038",
    "--mock-shadow": "0 30px 80px -20px rgba(16,24,40,0.22)",
  } as CSSProperties,
  dark: {
    "--mock-bg": "#202124",
    "--mock-fg": "#e8eaed",
    "--mock-heading": "#e8eaed",
    "--mock-muted": "#9aa0a6",
    "--mock-link": "#8ab4f8",
    "--mock-tonal": "#174ea6",
    "--mock-border": "#3a3d41",
    "--mock-surface": "#303134",
    "--mock-primary": "#1967d2",
    "--mock-badge-bg": "rgba(249,171,0,0.18)",
    "--mock-badge-fg": "#f9ab00",
    "--mock-success-bg": "rgba(52,168,83,0.15)",
    "--mock-success-fg": "#34a853",
    "--mock-shadow": "0 30px 90px -16px rgba(0,0,0,0.55)",
  } as CSSProperties,
};

const bg = { backgroundColor: "var(--mock-bg)" };
const surfaceBg = { backgroundColor: "var(--mock-surface)" };
const tonalBg = { backgroundColor: "var(--mock-tonal)" };
const primaryBg = { backgroundColor: "var(--mock-primary)" };
const borderColor = { borderColor: "var(--mock-border)" };
const heading = { color: "var(--mock-heading)" };
const muted = { color: "var(--mock-muted)" };
const link = { color: "var(--mock-link)" };

function NavRow({
  item,
  active,
}: {
  item: (typeof dashboardNav)[number];
  active?: boolean;
}) {
  const Icon = item.icon;
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium"
      style={active ? { ...tonalBg, ...link } : muted}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span
          className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
          style={{ backgroundColor: "var(--mock-badge-bg)", color: "var(--mock-badge-fg)" }}
        >
          {item.badge}
        </span>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px]" style={muted}>
        {label}
      </p>
      <p className="mt-1 text-[14px] font-medium tabular-nums" style={heading}>
        {value}
      </p>
    </div>
  );
}

function MiniCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg p-3.5" style={surfaceBg}>
      <p className="text-[10px] font-medium uppercase tracking-wide" style={muted}>
        {label}
      </p>
      <p className="mt-1.5 text-[18px] font-medium" style={heading}>
        {value}
      </p>
      <p className="mt-1 text-[11px]" style={muted}>
        {hint}
      </p>
    </div>
  );
}

export default function ProductShowcase() {
  // Default to "light" for a consistent first paint (no SSR/client
  // mismatch), then sync to whatever the visitor's real site theme already
  // is — so the mockup doesn't open looking mismatched against the page
  // around it. The toggle below still freely overrides this afterward.
  const [theme, setTheme] = useState<PreviewTheme>("light");

  useEffect(() => {
    const resolved = document.documentElement.getAttribute("data-theme");
    if (resolved !== "dark" && resolved !== "light") return;
    const t = window.setTimeout(() => setTheme(resolved), 0);
    return () => window.clearTimeout(t);
  }, []);

  const palette = PALETTES[theme];

  return (
    <section
      className="relative overflow-hidden px-6 pb-28 pt-6 sm:px-10 lg:px-16"
      data-aos="fade-up"
    >
      {/* <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent)]"
      /> */}

      <div className="mx-auto max-w-5xl text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
          Your dashboard
        </p>
        <h2 className="mt-3 font-display text-[28px] tracking-tight text-heading sm:text-[34px]">
          Everything about your store, in one place
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-muted">
          Sales, payouts, and your catalog, all in one place. Clear in daylight or at midnight.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-5xl" style={palette}>
        {/* Floating accent card — purely decorative, gives the mockup depth
            instead of reading as a flat panel. */}
        <div
          className="absolute -top-6 right-6 z-10 hidden items-center gap-2.5 rounded-xl border px-3.5 py-2.5 sm:flex"
          style={{ ...bg, ...borderColor, boxShadow: "var(--mock-shadow)" }}
        >
          <span
            className="flex size-7 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--mock-success-bg)", color: "var(--mock-success-fg)" }}
          >
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
          <div className="text-left">
            <p className="text-[12px] font-medium" style={heading}>
              New order received
            </p>
            <p className="text-[11px]" style={muted}>
              ₦24,000 · just now
            </p>
          </div>
        </div>

        {/* Phone mockup — real screenshots (not the hand-built recreation
            above), swapped with the same theme toggle, peeking out from the
            opposite corner for a cross-device feel. */}
        <div
          className="absolute -bottom-8 -left-6 z-20 hidden w-[132px] rotate-[-4deg] overflow-hidden rounded-[24px] border-[6px] sm:block lg:w-[160px]"
          style={{ ...bg, ...borderColor, boxShadow: "var(--mock-shadow)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              theme === "light"
                ? "/mockups/dashboard-mobile-light.png"
                : "/mockups/dashboard-mobile-dark.png"
            }
            alt="Salesy dashboard on mobile"
            className="block w-full"
          />
        </div>

        <div
          className="relative mx-auto overflow-hidden rounded-2xl border sm:rounded-[20px]"
          style={{ ...bg, ...borderColor, boxShadow: "var(--mock-shadow)" }}
        >
          {/* Browser-style chrome bar */}
          <div
            className="flex items-center gap-3 border-b px-4 py-3"
            style={{ ...surfaceBg, ...borderColor }}
          >
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/80" />
              <span className="size-2.5 rounded-full bg-yellow-400/80" />
              <span className="size-2.5 rounded-full bg-green-400/80" />
            </div>
            <div
              className="mx-auto flex w-full max-w-xs items-center justify-center rounded-full border px-3 py-1 text-[11px]"
              style={{ ...bg, ...borderColor, ...muted }}
            >
              salesy.link/dashboard
            </div>
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              aria-label={`Preview the dashboard in ${theme === "light" ? "dark" : "light"} mode`}
              title={`Preview in ${theme === "light" ? "dark" : "light"} mode`}
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium"
              style={{ ...bg, ...borderColor, ...muted }}
            >
              {theme === "light" ? (
                <Moon className="size-3.5" aria-hidden />
              ) : (
                <Sun className="size-3.5" aria-hidden />
              )}
              <span className="hidden sm:inline">
                {theme === "light" ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <aside
              className="hidden w-[200px] shrink-0 border-r px-3 py-4 md:block"
              style={borderColor}
            >
              <span className="inline-flex items-center gap-2">
                <Logo markClassName="size-5" textClassName="hidden" />
                <span className="font-display text-[16px] tracking-tight" style={heading}>
                  Salesy
                </span>
              </span>

              <div
                className="mt-4 flex items-center gap-2.5 rounded-xl border p-2.5"
                style={{ ...surfaceBg, ...borderColor }}
              >
                <div
                  className="flex size-8 items-center justify-center rounded-lg text-[13px] font-medium"
                  style={{ ...tonalBg, ...link }}
                >
                  Q
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium" style={heading}>
                    Quest Store
                  </p>
                  <p className="text-[10px] uppercase tracking-wide" style={muted}>
                    Free
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium" style={link}>
                  <ExternalLink className="size-3.5" aria-hidden />
                  Live storefront
                </div>
                <div
                  className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium"
                  style={{ ...borderColor, ...heading }}
                >
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Admin Panel
                </div>
              </div>

              <p
                className="mt-5 px-2.5 text-[10px] font-medium uppercase tracking-[0.14em]"
                style={muted}
              >
                Platform
              </p>
              <nav className="mt-1.5 space-y-0.5">
                {dashboardNav.map((item, index) => (
                  <NavRow key={item.href} item={item} active={index === 0} />
                ))}
              </nav>

              <div className="mt-4 flex items-center gap-2 px-2.5 text-[12px] font-medium" style={muted}>
                <LogOut className="size-3.5" aria-hidden />
                Sign out
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0 flex-1 p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={muted}>
                  Dashboard / <span className="font-medium" style={heading}>Overview</span>
                </p>
                <span
                  className="flex size-7 items-center justify-center rounded-full border"
                  style={{ ...borderColor, ...muted }}
                >
                  <Bell className="size-3.5" aria-hidden />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-[24px] leading-8 tracking-tight" style={heading}>
                    Good afternoon, Gift
                  </h3>
                  <p className="mt-1 text-[13px]" style={muted}>
                    Here’s how Quest Store is doing.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-medium"
                    style={{ ...borderColor, ...link }}
                  >
                    <Share2 className="size-3.5" aria-hidden />
                    Share store link
                  </span>
                  <span
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium text-white"
                    style={primaryBg}
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Add product
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-xl border p-4 sm:p-5" style={{ ...bg, ...borderColor }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide" style={muted}>
                      Total revenue
                    </p>
                    <div className="inline-flex rounded-full border p-0.5 text-[11px]" style={borderColor}>
                      <span className="px-2.5 py-1" style={muted}>
                        Today
                      </span>
                      <span className="px-2.5 py-1" style={muted}>
                        7d
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 font-medium text-white"
                        style={primaryBg}
                      >
                        30d
                      </span>
                      <span className="px-2.5 py-1" style={muted}>
                        All time
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 font-display text-[34px] leading-none" style={heading}>
                    ₦0
                  </p>
                  <div
                    className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4"
                    style={borderColor}
                  >
                    <Stat label="Total orders" value="2" />
                    <Stat label="Paid orders" value="0" />
                    <Stat label="Avg. order value" value="₦0" />
                    <Stat label="Unique buyers" value="0" />
                  </div>
                </div>

                <div className="rounded-xl border p-4 sm:p-5" style={{ ...bg, ...borderColor }}>
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={muted}>
                    Account status
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[12px]">
                    <span style={muted}>Product catalog</span>
                    <span className="font-medium" style={heading}>
                      3 / 10
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={surfaceBg}>
                    <div className="h-full w-[30%] rounded-full" style={primaryBg} />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px]" style={muted}>
                        Live store
                      </p>
                      <p className="text-[13px] font-medium" style={heading}>
                        /queststore
                      </p>
                    </div>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                      style={{ ...surfaceBg, ...muted }}
                    >
                      FREE
                    </span>
                  </div>
                  <span
                    className="mt-4 flex h-9 items-center justify-center rounded-lg text-[12px] font-medium text-white"
                    style={primaryBg}
                  >
                    Upgrade your plan
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border p-4 sm:p-5" style={{ ...bg, ...borderColor }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[14px] font-medium" style={heading}>
                      Earnings &amp; settlement
                    </h4>
                    <p className="mt-1 max-w-sm text-[12px] leading-5" style={muted}>
                      What you keep after any plan fee. Paystack pays it straight to your
                      bank — Salesy never holds your funds.
                    </p>
                  </div>
                  <span
                    className="inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[11px] font-medium"
                    style={{ ...borderColor, ...link }}
                  >
                    Payout settings
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniCard label="Your earnings" value="₦0" hint="Lifetime: ₦0" />
                  <MiniCard
                    label="Salesy commission"
                    value="₦0"
                    hint="5% per sale on your Free plan"
                  />
                  <MiniCard
                    label="Payout timing"
                    value="~1 business day"
                    hint="Settles automatically"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
