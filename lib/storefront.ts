import { formatNaira } from "@/lib/dashboard";

export type StoreContact = {
  whatsapp: string;
  telegram: string;
  email: string;
  phone: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAt?: number;
  /** Solid accent for placeholder imagery */
  accent: string;
  category: string;
  inStock: boolean;
  /** Cloudinary (or other CDN) image URLs */
  images?: string[];
  /** Short tags shown on detail */
  tags?: string[];
  /** ISO date for catalog sorting */
  createdAt?: string;
};

export type Storefront = {
  handle: string;
  businessName: string;
  tagline: string;
  description: string;
  /** Data URL or path; null → initials avatar */
  logoDataUrl: string | null;
  /** Brand accent for header chip / logo fallback */
  brandColor: string;
  contact: StoreContact;
  products: StoreProduct[];
};

/** Simple geometric mark used as the demo store logo. */
export const DEMO_LOGO_DATA_URL =
  "data:image/svg+xml," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
  <rect width="80" height="80" rx="20" fill="#0F766E"/>
  <path d="M22 52V28h10.5c6.2 0 10.2 3.2 10.2 8.4 0 5.1-4 8.3-10.2 8.3H30.2V52H22zm8.2-13.2h2c2.6 0 4.1-1.3 4.1-3.4s-1.5-3.4-4.1-3.4h-2v6.8zM46 52l8.8-24h8.4L72 52h-8.2l-1.4-4.2H55.6L54.2 52H46zm11.2-10.4h5.6l-2.8-8.4-2.8 8.4z" fill="#ECFDF5"/>
</svg>`.trim());

export const DEMO_STORE: Storefront = {
  handle: "demo",
  businessName: "Chidi Crafts",
  tagline: "Handmade bags, leather goods & beads from Lagos",
  description:
    "Small-batch crafts made for everyday use. Free Lagos Island pickup on orders over ₦50,000.",
  logoDataUrl: DEMO_LOGO_DATA_URL,
  brandColor: "#0F766E",
  contact: {
    whatsapp: "2348012345678",
    telegram: "chidicrafts",
    email: "hello@chidicrafts.demo",
    phone: "+234 801 234 5678",
  },
  products: [
    {
      id: "p1",
      slug: "ankara-tote-bag",
      name: "Ankara tote bag",
      description:
        "Roomy cotton tote lined with canvas. Fits a 15\" laptop and your market haul. Machine-washable shell.",
      price: 20_000,
      compareAt: 24_000,
      accent: "#C2410C",
      category: "Bags",
      inStock: true,
      tags: ["Bestseller", "Washable"],
      createdAt: "2026-08-01T10:00:00.000Z",
    },
    {
      id: "p2",
      slug: "leather-card-wallet",
      name: "Leather card wallet",
      description:
        "Slim vegetable-tanned leather wallet with six card slots and a cash pocket. Ages to a warm patina.",
      price: 20_000,
      accent: "#78350F",
      category: "Accessories",
      inStock: true,
      tags: ["Genuine leather"],
      createdAt: "2026-08-05T10:00:00.000Z",
    },
    {
      id: "p3",
      slug: "beaded-bracelet-set",
      name: "Beaded bracelet set",
      description:
        "Set of three stretch bracelets in coral, brass, and matte black. One size fits most wrists.",
      price: 8_000,
      accent: "#BE123C",
      category: "Jewelry",
      inStock: true,
      tags: ["Set of 3"],
      createdAt: "2026-08-10T10:00:00.000Z",
    },
    {
      id: "p4",
      slug: "canvas-shopper",
      name: "Canvas shopper",
      description:
        "Heavyweight natural canvas with reinforced handles. Ideal for groceries or a weekend bag.",
      price: 15_000,
      accent: "#365314",
      category: "Bags",
      inStock: true,
      createdAt: "2026-08-15T10:00:00.000Z",
    },
    {
      id: "p5",
      slug: "woven-clutch",
      name: "Woven clutch",
      description:
        "Handwoven raffia clutch with a magnetic closure and removable gold chain strap.",
      price: 18_500,
      accent: "#A16207",
      category: "Bags",
      inStock: true,
      tags: ["Evening"],
      createdAt: "2026-08-20T10:00:00.000Z",
    },
    {
      id: "p6",
      slug: "cowrie-necklace",
      name: "Cowrie necklace",
      description:
        "Layered cowrie and glass-bead necklace on a waxed cotton cord. Adjustable length.",
      price: 12_000,
      accent: "#1D4ED8",
      category: "Jewelry",
      inStock: true,
      createdAt: "2026-08-25T10:00:00.000Z",
    },
    {
      id: "p7",
      slug: "mini-crossbody",
      name: "Mini crossbody",
      description:
        "Compact leather crossbody for phone, cards, and keys. Adjustable strap, zip top.",
      price: 28_000,
      compareAt: 32_000,
      accent: "#115E59",
      category: "Bags",
      inStock: true,
      tags: ["New"],
      createdAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "p8",
      slug: "ankara-scrunchie-pack",
      name: "Ankara scrunchie pack",
      description:
        "Pack of four soft scrunchies in mixed Ankara prints. Gentle on natural hair.",
      price: 4_500,
      accent: "#7C3AED",
      category: "Accessories",
      inStock: true,
      tags: ["Pack of 4"],
      createdAt: "2026-09-10T10:00:00.000Z",
    },
  ],
};

/**
 * App routes that must never be treated as store handles.
 * Static `app/` folders already win in Next.js; this also guards lookups.
 */
export const RESERVED_STORE_HANDLES = new Set([
  "api",
  "dashboard",
  "signin",
  "signup",
  "forgot-password",
  "reset-password",
  "blog",
  "_next",
  "favicon.ico",
]);

function cloneStore(
  base: Storefront,
  overrides: Pick<Storefront, "handle" | "businessName"> &
    Partial<Omit<Storefront, "handle" | "businessName" | "products">>,
): Storefront {
  return {
    ...base,
    ...overrides,
    contact: { ...base.contact, ...overrides.contact },
    products: base.products,
  };
}

/**
 * Seeded storefronts until the API / DB exists.
 * Add handles here to preview real URLs like /chidicrafts.
 */
const SEED_STORES: Record<string, Storefront> = {
  demo: DEMO_STORE,
  chidicrafts: cloneStore(DEMO_STORE, {
    handle: "chidicrafts",
    businessName: "Chidi Crafts",
  }),
};

export function normalizeStoreHandle(raw: string) {
  return raw.trim().toLowerCase();
}

export function isReservedStoreHandle(handle: string) {
  return RESERVED_STORE_HANDLES.has(normalizeStoreHandle(handle));
}

/**
 * Resolve a storefront by handle from seed data only.
 * Prefer `resolveStorefront` from `@/lib/storefront-db` in server layouts.
 */
export function getStoreByHandle(handle: string): Storefront | null {
  const key = normalizeStoreHandle(handle);
  if (!key || isReservedStoreHandle(key)) return null;
  return SEED_STORES[key] ?? null;
}

export function getProduct(store: Storefront, slug: string) {
  return store.products.find((p) => p.slug === slug) ?? null;
}

export function storePath(handle: string, path = "") {
  const base = `/${handle}`;
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function productHref(handle: string, slug: string) {
  return storePath(handle, `/products/${slug}`);
}

export { formatNaira };
