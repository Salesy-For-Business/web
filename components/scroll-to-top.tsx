"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Next.js's App Router doesn't reliably reset window scroll on navigations
 * that share a parent layout (e.g. store -> product detail), leaving pages
 * rendered at the previous scroll offset, sometimes under the sticky header.
 * Mounted once at the root so every section resets on every pathname change.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
