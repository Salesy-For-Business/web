"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

type ToastTheme = "light" | "dark";

function readTheme(): ToastTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function AppToaster() {
  const [theme, setTheme] = useState<ToastTheme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(readTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      theme={theme}
      position="top-center"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
