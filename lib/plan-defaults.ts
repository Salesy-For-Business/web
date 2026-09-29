import type { BusinessCurrency } from "@/lib/currencies";
import type { PlanId } from "@/lib/plans";

export const PLAN_IDS: PlanId[] = ["free", "boutique", "pro"];

export type PlanPrice = {
  /** Whole currency units (e.g. naira, not kobo). `null` = not offered. */
  monthly: number | null;
  yearly: number | null;
};

export type PlanPrices = Partial<Record<BusinessCurrency, PlanPrice>>;

/** Everything about a tier that is safe to show publicly. */
export type PlanConfigData = {
  id: PlanId;
  name: string;
  blurb: string;
  badge: string | null;
  featured: boolean;
  ctaLabel: string;
  features: string[];
  /** Percentage Salesy keeps from each sale on this plan (0–100). */
  commissionPercent: number;
  /** `null` = unlimited listings. */
  listingLimit: number | null;
  prices: PlanPrices;
  active: boolean;
};

/** Public plan plus the currencies a seller can actually subscribe in. */
export type PublicPlan = PlanConfigData & {
  subscribableCurrencies: BusinessCurrency[];
};

/** Code defaults — what the platform uses until a superadmin edits a plan. */
export const DEFAULT_PLAN_CONFIGS: Record<PlanId, PlanConfigData> = {
  free: {
    id: "free",
    name: "Free",
    blurb: "Everything you need to start selling.",
    badge: null,
    featured: false,
    ctaLabel: "Start free",
    features: [
      "5 product listings",
      "Secure checkout",
      "Order alerts on WhatsApp, Telegram, and email",
      "Basic analytics",
      "Buyer reviews",
      "A salesy.link handle",
    ],
    commissionPercent: 5,
    listingLimit: 5,
    prices: { NGN: { monthly: 0, yearly: 0 } },
    active: true,
  },
  boutique: {
    id: "boutique",
    name: "Boutique",
    blurb: "For sellers who are in it for the long run.",
    badge: "Popular",
    featured: true,
    ctaLabel: "Choose Boutique",
    features: [
      "Unlimited listings",
      "Everything in Free",
      "Priority support",
      "Bulk CSV product upload",
      "CSV sales report export",
      "Remove Salesy branding",
    ],
    commissionPercent: 0,
    listingLimit: null,
    prices: { NGN: { monthly: 5000, yearly: 50000 } },
    active: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    blurb: "More visibility and reach for your shop.",
    badge: "Top plan",
    featured: false,
    ctaLabel: "Choose Pro",
    features: [
      "Everything in Boutique",
      "Store Status posts",
      "Product video",
      "Featured on the Status feed",
    ],
    commissionPercent: 0,
    listingLimit: null,
    prices: { NGN: { monthly: 15000, yearly: 150000 } },
    active: true,
  },
};

export function defaultPublicPlans(): PublicPlan[] {
  return PLAN_IDS.map((id) => ({
    ...DEFAULT_PLAN_CONFIGS[id],
    subscribableCurrencies: [],
  }));
}

/** Listing limit as a number the UI can compare against (`Infinity` = unlimited). */
export function listingLimitValue(limit: number | null | undefined) {
  return limit == null ? Infinity : limit;
}
