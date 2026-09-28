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
