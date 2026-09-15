import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, Product, type ProductLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { productSchema } from "@/lib/product-schemas";
import {
  slugifyProductName,
  uniqueProductSlug,
} from "@/lib/auth/owned-business";
import { productListingLimit } from "@/lib/plans";

function toPublicProduct(doc: ProductLean) {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    price: doc.price,
    compareAt: doc.compareAt ?? null,
    category: doc.category,
    inStock: doc.inStock,
    stockQty: doc.stockQty ?? null,
    images: doc.images ?? [],
    tags: doc.tags ?? [],
    accent: doc.accent,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function GET() {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    await connectDb();
    const products = await Product.find({ businessId: owned.business._id })
      .sort({ createdAt: -1 })
      .lean<ProductLean[]>();

    return jsonOk({
      products: products.map(toPublicProduct),
      count: products.length,
      limit: productListingLimit(owned.business.plan),
    });
  } catch (err) {
    console.error("[products GET]", err);
    return jsonError("Could not load products.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const body = await request.json();
    const parsed = productSchema.safeParse({
      ...body,
      price: Number(body.price),
      compareAt:
        body.compareAt === "" || body.compareAt == null
          ? undefined
          : Number(body.compareAt),
      stockQty:
        body.stockQty === "" || body.stockQty == null
          ? undefined
          : Number(body.stockQty),
      images: body.images ?? [],
      tags: body.tags ?? [],
      inStock: body.inStock ?? true,
    });
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid product");
    }

    await connectDb();
    const limit = productListingLimit(owned.business.plan);
    const count = await Product.countDocuments({
      businessId: owned.business._id,
    });
    if (count >= limit) {
      return jsonError(
        `Free plan allows ${limit} listings. Upgrade to add more.`,
        403,
      );
    }

    const values = parsed.data;
    const baseSlug = slugifyProductName(values.name);
    const slug = await uniqueProductSlug(owned.business._id, baseSlug);

    const product = await Product.create({
      businessId: owned.business._id,
      name: values.name.trim(),
      slug,
      description: values.description.trim(),
      price: values.price,
      compareAt: values.compareAt,
      category: values.category.trim(),
      inStock: values.inStock,
      stockQty: values.stockQty,
      images: values.images,
      tags: values.tags,
      accent: values.accent?.trim() || "#0F766E",
    });

    return jsonOk({ product: toPublicProduct(product.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("[products POST]", err);
    return jsonError("Could not create product.", 500);
  }
}
