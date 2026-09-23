import type { MetadataRoute } from "next";
import { connectDb, Business, Product } from "@/lib/db";
import { appOrigin, absoluteStoreUrl } from "@/lib/storefront";

/**
 * Every published store and product, plus the marketing pages, so search
 * engines can discover storefronts without a link from the homepage.
 * Regenerated on each request (revalidate) since sellers add stores/products
 * continuously.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = appOrigin();
  const entries: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
  ];

  try {
    await connectDb();
    const businesses = await Business.find({}, "storeHandle updatedAt").lean();

    for (const business of businesses) {
      entries.push({
        url: absoluteStoreUrl(business.storeHandle),
        lastModified: business.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      });

      const products = await Product.find(
        { businessId: business._id },
        "slug updatedAt",
      ).lean();

      for (const product of products) {
        entries.push({
          url: absoluteStoreUrl(business.storeHandle, `/products/${product.slug}`),
          lastModified: product.updatedAt,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch (err) {
    console.error("[sitemap]", err);
  }

  return entries;
}
