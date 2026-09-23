export const landingOptions = [
  {
    id: "business",
    label: "Grow my business",
    description:
      "Tools and guidance to market, manage, and scale the business you already have.",
    cta: "Explore Grow my business",
  },
  {
    id: "store",
    label: "Online Store",
    badge: "+ growth",
    description:
      "Create a store with a unique, shareable URL — then grow it with the same platform.",
    cta: "Explore Online Store",
  },
  {
    id: "partnership",
    label: "Partnership & affiliate program",
    badge: "New",
    description:
      "Invite other sellers to Salesy and earn rewards when their stores go live. Share your code, track referrals, and grow together.",
    cta: "Explore Partnership & affiliate program",
  },
] as const;

export type LandingOptionId = (typeof landingOptions)[number]["id"];
