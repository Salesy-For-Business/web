export const landingOptions = [
  {
    id: "business",
    label: "Feature your products",
    description:
      "Pay a small weekly fee to pin your best products at the top of Salesy's Marketplace, where shoppers from every store come to browse.",
    cta: "Explore Feature Products",
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
