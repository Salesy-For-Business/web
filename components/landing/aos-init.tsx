"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * Initializes [AOS](https://michalsnik.github.io/aos/) on the landing page.
 * Call once near the top of the home tree.
 */
export function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: false,
      offset: 80,
      disable: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    const t = window.setTimeout(() => AOS.refresh(), 400);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
