"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "@/components/theme-toggle";
import { HomeHashLink } from "@/components/landing/home-hash-link";
import { IS_SIGNED_IN } from "@/lib/demo";

const exploreLinks = [
  { hash: "features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { hash: "pricing", label: "Pricing" },
  { hash: "faq", label: "FAQ" },
] as const;

export default function Header() {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  const accountHref = IS_SIGNED_IN ? "/dashboard" : "/signin";
  const accountLabel = IS_SIGNED_IN ? "Dashboard" : "Sign in";

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (
        exploreRef.current &&
        !exploreRef.current.contains(event.target as Node)
      ) {
        setExploreOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExploreOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="font-display text-[22px] tracking-tight text-heading hover:text-heading"
        >
          Salesy
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          <div ref={exploreRef} className="relative">
            <button
              type="button"
              aria-expanded={exploreOpen}
              aria-haspopup="menu"
              onClick={() => setExploreOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-heading hover:text-link"
            >
              Explore
              <ChevronDown
                className={clsx(
                  "size-4 transition-transform",
                  exploreOpen && "rotate-180",
                )}
              />
            </button>
            {exploreOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-3 min-w-52 rounded-lg border border-border bg-background py-2 shadow-sm"
              >
                {exploreLinks.map((link) => {
                  const className =
                    "block px-4 py-2.5 text-[15px] text-heading hover:bg-surface hover:text-heading";
                  return "hash" in link ? (
                    <HomeHashLink
                      key={link.hash}
                      hash={link.hash}
                      role="menuitem"
                      className={className}
                      onClick={() => setExploreOpen(false)}
                    >
                      {link.label}
                    </HomeHashLink>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className={className}
                      onClick={() => setExploreOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <HomeHashLink
            hash="start"
            className="text-[15px] font-medium text-link hover:text-link-hover"
          >
            Start your store
          </HomeHashLink>
          <Link
            href={accountHref}
            className="text-[15px] font-medium text-heading hover:text-link"
          >
            {accountLabel}
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-5 lg:hidden">
          <Link
            href={accountHref}
            className="text-[15px] font-medium text-heading hover:text-link"
          >
            {accountLabel}
          </Link>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="text-heading"
          >
            {menuOpen ? (
              <X className="size-6" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M4 8h16" />
                <path d="M4 16h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="max-h-[calc(100dvh-4.75rem)] overflow-y-auto border-t border-border bg-background px-6 py-6 lg:hidden sm:px-10"
        >
          <p className="mb-2 text-[13px] font-medium uppercase tracking-wide text-muted">
            Explore
          </p>
          <div className="flex flex-col">
            {exploreLinks.map((link) => {
              const className =
                "py-3 text-[16px] font-medium text-heading hover:text-link";
              return "hash" in link ? (
                <HomeHashLink
                  key={link.hash}
                  hash={link.hash}
                  className={className}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </HomeHashLink>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={className}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <HomeHashLink
              hash="start"
              className="py-3 text-[16px] font-medium text-link hover:text-link-hover"
              onClick={() => setMenuOpen(false)}
            >
              Start your store
            </HomeHashLink>
            <Link
              href={accountHref}
              className="py-3 text-[16px] font-medium text-heading hover:text-link"
              onClick={() => setMenuOpen(false)}
            >
              {accountLabel}
            </Link>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-[13px] font-medium uppercase tracking-wide text-muted">
              Theme
            </p>
            <ThemeToggle variant="labeled" />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
