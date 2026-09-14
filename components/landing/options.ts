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
] as const;

export type LandingOptionId = (typeof landingOptions)[number]["id"];
