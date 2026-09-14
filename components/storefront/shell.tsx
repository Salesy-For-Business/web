"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useStorefront } from "@/components/storefront/store-context";
import { useCartStore } from "@/lib/cart-store";
import { storeInitial } from "@/lib/dashboard";
import { storePath } from "@/lib/storefront";

/** Body branding block on the store home — header mirrors it when this leaves view. */
export const STOREFRONT_BRAND_ID = "storefront-brand";

export function StorefrontHeader() {
  const store = useStorefront();
  const pathname = usePathname();
  const hydrated = useCartStore((s) => s.hydrated);
  const lines = useCartStore((s) => s.lines);
  const count = hydrated
    ? lines.reduce((sum, l) => sum + l.qty, 0)
    : 0;

  const isStoreHome = pathname === storePath(store.handle);
  /** True while the page hero brand is still in view (home only). */
  const [heroBrandInView, setHeroBrandInView] = useState(true);
  const showBrand = !isStoreHome || !heroBrandInView;

  useEffect(() => {
    if (!isStoreHome) return;

    const brand = document.getElementById(STOREFRONT_BRAND_ID);
    if (!brand) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroBrandInView(Boolean(entry?.isIntersecting));
      },
      {
        root: null,
        rootMargin: "-72px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(brand);
    return () => observer.disconnect();
  }, [isStoreHome]);

  return (
    <header
      className={
        showBrand
          ? "sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm"
          : "sticky top-0 z-40 border-b border-transparent bg-background/90 backdrop-blur-sm"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="relative flex min-h-10 min-w-0 flex-1 items-center">
          <AnimatePresence initial={false}>
            {showBrand ? (
              <motion.div
                key="header-brand"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0"
              >
                <Link
                  href={storePath(store.handle)}
                  className="flex min-w-0 items-center gap-3"
                >
                  {store.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logoDataUrl}
                      alt=""
                      className="size-10 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[16px] font-medium text-white"
                      style={{ backgroundColor: store.brandColor }}
                      aria-hidden
                    >
                      {storeInitial(store.businessName)}
                    </span>
                  )}
                  <span className="truncate font-display text-[18px] tracking-tight text-heading sm:text-[20px]">
                    {store.businessName}
                  </span>
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href={storePath(store.handle, "/cart")}
            className="relative inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[13px] font-medium text-heading hover:bg-surface"
          >
            <ShoppingBag className="size-4" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-white">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  const store = useStorefront();
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {store.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoDataUrl}
              alt=""
              className="size-8 rounded-lg object-cover"
            />
          ) : null}
          <div>
            <p className="font-display text-[16px] text-heading">
              {store.businessName}
            </p>
            <p className="text-[12px] text-muted">Powered by Salesy</p>
          </div>
        </div>
        <p className="text-[13px] text-muted">
          Questions? Reach us on WhatsApp, Telegram, email — or live chat when
          available.
        </p>
      </div>
    </footer>
  );
}
