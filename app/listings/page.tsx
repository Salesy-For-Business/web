import type { Metadata } from "next";
import { Header, Footer } from "@/components/landing";
import { ListingProductGrid } from "@/components/listings/listing-product-card";
import { ListingsBrowser } from "@/components/listings/listings-browser";
import { getFeaturedListings, getRandomListings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Shop for Anything — Salesy",
  description:
    "Discover products from independent stores across Salesy, picked at random — plus featured picks from sellers who paid to stand out.",
  alternates: { canonical: "/listings" },
};

export default async function ListingsPage() {
  const [featured, random] = await Promise.all([
    getFeaturedListings(),
    getRandomListings(48),
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
            Products from stores across Salesy, in no particular order.
          </p>

          <section className="mt-10">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
              Featured
            </h2>
            {featured.length > 0 ? (
              <div className="mt-4">
                <ListingProductGrid products={featured} />
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-center text-[13px] text-muted">
                This space is reserved for advertisement.
              </div>
            )}
          </section>

          <section className="mt-12">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
              Explore
            </h2>
            <div className="mt-4">
              <ListingsBrowser initialProducts={random} />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
