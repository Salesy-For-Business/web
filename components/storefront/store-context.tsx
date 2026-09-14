"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import type { Storefront } from "@/lib/storefront";
import { useCartStore } from "@/lib/cart-store";

const StorefrontContext = createContext<Storefront | null>(null);

export function StorefrontProvider({
  store,
  children,
}: {
  store: Storefront;
  children: ReactNode;
}) {
  const ensureStore = useCartStore((s) => s.ensureStore);

  useEffect(() => {
    ensureStore(store.handle);
  }, [ensureStore, store.handle]);

  return (
    <StorefrontContext.Provider value={store}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const store = useContext(StorefrontContext);
  if (!store) {
    throw new Error("useStorefront must be used inside StorefrontProvider");
  }
  return store;
}
