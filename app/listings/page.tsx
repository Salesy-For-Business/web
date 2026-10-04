import type { Metadata } from "next";
import { Header, Footer } from "@/components/landing";
import { MarketplaceBrowser } from "@/components/listings/marketplace-browser";
import { getListingCategories, getMarketplaceFeed } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Shop for Anything — Salesy",
  description:
    "Discover products from independent stores across Salesy — featured picks from sellers who paid to stand out, shown first.",
  alternates: { canonical: "/listings" },
};

export default async function ListingsPage() {
  const [feed, categories] = await Promise.all([
    getMarketplaceFeed(48),
    getListingCategories(),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-[32px] tracking-tight text-heading sm:text-[40px]">
            Shop for Anything
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-muted">
            Products from stores across Salesy — featured picks lead the way.
          </p>

          <div className="mt-8">
            <MarketplaceBrowser initialProducts={feed} categories={categories} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
