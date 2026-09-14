"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { HomeHashLink } from "@/components/landing/home-hash-link";
import { AccountNavLink } from "@/components/landing/account-nav-link";

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
              <motion.span
                animate={{ rotate: exploreOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronDown className="size-4" />
              </motion.span>
            </button>
            <AnimatePresence>
              {exploreOpen ? (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full z-20 mt-3 min-w-52 origin-top-right rounded-lg border border-border bg-background py-2 shadow-sm"
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
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <Link
            href="/signup"
            className="text-[15px] font-medium text-link hover:text-link-hover"
          >
            Start your store
          </Link>
          <AccountNavLink className="text-[15px] font-medium text-heading hover:text-link" />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-5 lg:hidden">
          <AccountNavLink className="text-[15px] font-medium text-heading hover:text-link" />
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

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.nav
            id="mobile-nav"
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="max-h-[calc(100dvh-4.75rem)] overflow-y-auto px-6 py-6 sm:px-10">
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
                <Link
                  href="/signup"
                  className="py-3 text-[16px] font-medium text-link hover:text-link-hover"
                  onClick={() => setMenuOpen(false)}
                >
                  Start your store
                </Link>
                <AccountNavLink
                  className="py-3 text-[16px] font-medium text-heading hover:text-link"
                  onClick={() => setMenuOpen(false)}
                />
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <p className="mb-3 text-[13px] font-medium uppercase tracking-wide text-muted">
                  Theme
                </p>
                <ThemeToggle variant="labeled" />
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
