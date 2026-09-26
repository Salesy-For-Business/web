import { connectDb, Business, Product, type ProductLean } from "@/lib/db";
import {
  getStoreByHandle,
  isReservedStoreHandle,
  normalizeStoreHandle,
  type Storefront,
  type StoreProduct,
} from "@/lib/storefront";

function productToStore(p: ProductLean): StoreProduct {
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
    createdAt: p.createdAt
      ? new Date(p.createdAt).toISOString()
      : undefined,
  };
}

/**
 * Resolve a public storefront: MongoDB Business + Products first,
 * then seed fallback (`demo` / `chidicrafts`) for marketing.
 */
export async function resolveStorefront(
  rawHandle: string,
): Promise<Storefront | null> {
  const handle = normalizeStoreHandle(rawHandle);
  if (!handle || isReservedStoreHandle(handle)) return null;

  try {
    await connectDb();
    const business = await Business.findOne({ storeHandle: handle }).lean();
    if (business) {
      const products = await Product.find({ businessId: business._id })
        .sort({ createdAt: -1 })
        .lean<ProductLean[]>();

      // businessPhone is now always a full international number (e.g.
      // "+2348012345678" or "+15551234567") composed by PhoneField, so the
      // digits alone are exactly what wa.me/<digits> expects — no more
      // Nigeria-specific "add 234" fallback needed.
      const waDigits = (business.businessPhone || "").replace(/\D/g, "");

      return {
        handle: business.storeHandle,
        businessName: business.businessName,
        tagline: business.description.slice(0, 120),
        description: business.description,
        logoDataUrl: business.logoDataUrl || null,
        socialImageUrl: business.socialImageUrl || null,
        brandColor: "#0F766E",
        contact: {
          whatsapp: waDigits,
          telegram: "",
          email: business.businessEmail,
          phone: business.businessPhone,
        },
        products: products.map(productToStore),
      };
    }
  } catch (err) {
    console.error("[resolveStorefront]", err);
  }

  return getStoreByHandle(handle);
}
