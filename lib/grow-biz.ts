import type { AuthPlan } from "@/lib/auth-store";

/** Free plan: launch Grow Biz ads with uploaded creative. */
export const GROW_BIZ_LAUNCH_PRICE = 10_000;

/** Boutique / Pro: optional boost on top of automatic ads. */
export const GROW_BIZ_BOOST_PRICE = 5_000;

export type GrowBizOffer = {
  /** Automatic ads already included (Boutique / Pro). */
  baseAdsIncluded: boolean;
  /** Amount to pay for the primary action on this plan. */
  price: number;
  /** launch = Free pay-to-run; boost = paid-plan improve. */
  kind: "launch" | "boost";
};

export function growBizOffer(plan: AuthPlan): GrowBizOffer {
  if (plan === "free") {
    return {
      baseAdsIncluded: false,
      price: GROW_BIZ_LAUNCH_PRICE,
      kind: "launch",
    };
  }
  return {
    baseAdsIncluded: true,
    price: GROW_BIZ_BOOST_PRICE,
    kind: "boost",
  };
}

/** Seeded demo metrics for paid-plan automatic ads. */
export const growBizDemoMetrics = {
  impressions: 12_480,
  clicks: 386,
  storeVisits: 214,
};
