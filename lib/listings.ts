import { Types } from "mongoose";
import { connectDb, Business, Product, type ProductLean } from "@/lib/db";
import type { BusinessCurrency } from "@/lib/currencies";
import type { StoreProduct } from "@/lib/storefront";

export type ListingProduct = StoreProduct & {
  storeHandle: string;
  businessName: string;
  /** Each store prices in its own currency — unlike a single-store product
   * grid, a cross-store feed can't assume one ambient currency. */
  currency: BusinessCurrency;
  /** True while a paid featured-listing slot is active — drives the star
   * badge and front-of-feed placement on the Marketplace. */
  isFeatured: boolean;
};

type EligibleBusiness = {
  storeHandle: string;
  businessName: string;
  storeCurrency: BusinessCurrency;
};

function productToListing(
  p: ProductLean,
  business: EligibleBusiness,
): ListingProduct {
  return {
    id: String(p._id),
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    compareAt: p.compareAt || undefined,
    accent: p.accent || "#0F766E",
    category: p.category,
    inStock: p.inStock,
    images: p.images?.length ? p.images : undefined,
    tags: p.tags?.length ? p.tags : undefined,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    storeHandle: business.storeHandle,
    businessName: business.businessName,
    currency: business.storeCurrency || "NGN",
    isFeatured: Boolean(p.featuredUntil && p.featuredUntil > new Date()),
  };
}

/** Only stores that can actually accept a buyer's payment — same gate used
 * to compute `Storefront.acceptsPayments` in `lib/storefront-db.ts`. */
async function eligibleBusinesses() {
  await connectDb();
  return Business.find({
    paystackSubaccountCode: { $exists: true, $ne: null },
  })
    .select("storeHandle businessName storeCurrency")
    .lean<(EligibleBusiness & { _id: Types.ObjectId })[]>();
}

export async function getFeaturedListings(): Promise<ListingProduct[]> {
  const businesses = await eligibleBusinesses();
  if (businesses.length === 0) return [];
  const byId = new Map(businesses.map((b) => [String(b._id), b]));

  const products = await Product.find({
    businessId: { $in: [...byId.keys()] },
    featuredUntil: { $gt: new Date() },
  })
    .sort({ featuredUntil: -1 })
    .lean<ProductLean[]>();

  return products
    .map((p) => {
      const business = byId.get(String(p.businessId));
      return business ? productToListing(p, business) : null;
    })
    .filter((p): p is ListingProduct => p !== null);
}

/** A random cross-store batch — featured products are also eligible to
 * appear here (standard "sponsored + organic" pattern), not excluded. */
export async function getRandomListings(
  limit = 48,
  excludeIds: string[] = [],
): Promise<ListingProduct[]> {
  const businesses = await eligibleBusinesses();
  if (businesses.length === 0) return [];
  const byId = new Map(businesses.map((b) => [String(b._id), b]));

  const match: Record<string, unknown> = {
    businessId: { $in: [...byId.keys()].map((id) => new Types.ObjectId(id)) },
    inStock: true,
  };
  const validExcludeIds = excludeIds.filter((id) => Types.ObjectId.isValid(id));
  if (validExcludeIds.length > 0) {
    match._id = {
      $nin: validExcludeIds.map((id) => new Types.ObjectId(id)),
    };
  }

  const products = await Product.aggregate<ProductLean>([
    { $match: match },
    { $sample: { size: limit } },
  ]);

  return products
    .map((p) => {
      const business = byId.get(String(p.businessId));
      return business ? productToListing(p, business) : null;
    })
    .filter((p): p is ListingProduct => p !== null);
}

/**
 * The Marketplace's single default feed: currently-featured products first
 * (marked `isFeatured` for the star badge), filled out with the random
 * cross-store batch. Featured products only lead the very first page — once
 * `excludeIds` is non-empty (an infinite-scroll "load more" call), the
 * client has already rendered them, so only random fill continues.
 */
export async function getMarketplaceFeed(
  limit = 48,
  excludeIds: string[] = [],
): Promise<ListingProduct[]> {
  const isFirstPage = excludeIds.length === 0;
  const featured = isFirstPage ? (await getFeaturedListings()).slice(0, limit) : [];

  const remaining = limit - featured.length;
  const random =
    remaining > 0
      ? await getRandomListings(remaining, [
          ...excludeIds,
          ...featured.map((f) => f.id),
        ])
      : [];

  return [...featured, ...random];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Text search + category filter, paginated the same exclude-ids way as
 * `getRandomListings` so the Marketplace's infinite scroll works identically
 * whether browsing or searching. Sorted newest-first instead of sampled,
 * since a search result set needs a stable order across pages. */
export async function searchListings({
  query,
  category,
  limit = 24,
  excludeIds = [],
}: {
  query?: string;
  category?: string;
  limit?: number;
  excludeIds?: string[];
}): Promise<ListingProduct[]> {
  const businesses = await eligibleBusinesses();
  if (businesses.length === 0) return [];
  const byId = new Map(businesses.map((b) => [String(b._id), b]));

  const match: Record<string, unknown> = {
    businessId: { $in: [...byId.keys()] },
    inStock: true,
  };
  const validExcludeIds = excludeIds.filter((id) => Types.ObjectId.isValid(id));
  if (validExcludeIds.length > 0) {
    match._id = { $nin: validExcludeIds };
  }
  if (category?.trim()) {
    match.category = category.trim();
  }
  const trimmedQuery = query?.trim();
  if (trimmedQuery) {
    const regex = new RegExp(escapeRegExp(trimmedQuery), "i");
    match.$or = [
      { name: regex },
      { description: regex },
      { category: regex },
      { tags: regex },
    ];
  }

  const products = await Product.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<ProductLean[]>();

  return products
    .map((p) => {
      const business = byId.get(String(p.businessId));
      return business ? productToListing(p, business) : null;
    })
    .filter((p): p is ListingProduct => p !== null);
}
