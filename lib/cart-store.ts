"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  accent: string;
  /** First product image URL when available */
  image?: string;
  qty: number;
};

type CartState = {
  storeHandle: string | null;
  lines: CartLine[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  /** Ensures cart belongs to this store; clears if handle changes. */
  ensureStore: (handle: string) => void;
  addItem: (item: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  itemCount: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      storeHandle: null,
      lines: [],
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      ensureStore: (handle) => {
        const current = get().storeHandle;
        if (current === handle) return;
        set({ storeHandle: handle, lines: [] });
      },

      addItem: (item, qty = 1) => {
        const lines = [...get().lines];
        const existing = lines.find((l) => l.productId === item.productId);
        if (existing) {
          existing.qty += qty;
        } else {
          lines.push({ ...item, qty });
        }
        set({ lines });
      },

      setQty: (productId, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.productId !== productId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.productId === productId ? { ...l, qty } : l,
          ),
        });
      },

      removeItem: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),

      clear: () => set({ lines: [] }),

      itemCount: () => get().lines.reduce((sum, l) => sum + l.qty, 0),

      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    }),
    {
      name: "salesy-cart",
      partialize: (state) => ({
        storeHandle: state.storeHandle,
        lines: state.lines,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
