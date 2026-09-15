import { Types } from "mongoose";
import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import {
  slugifyProductName,
  uniqueProductSlug,
} from "@/lib/auth/owned-business";
import { connectDb, Product, type ProductLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { productSchema } from "@/lib/product-schemas";

type Params = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, { params }: Params) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return jsonError("Product not found.", 404);
    }

    await connectDb();
    const product = await Product.findOne({
      _id: id,
      businessId: owned.business._id,
    }).lean<ProductLean | null>();

    if (!product) return jsonError("Product not found.", 404);
    return jsonOk({ product: toPublicProduct(product) });
  } catch (err) {
    console.error("[products/:id GET]", err);
    return jsonError("Could not load product.", 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return jsonError("Product not found.", 404);
    }

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
    const existing = await Product.findOne({
      _id: id,
      businessId: owned.business._id,
    });
    if (!existing) return jsonError("Product not found.", 404);

    const values = parsed.data;
    const baseSlug = slugifyProductName(values.name);
    const slug = await uniqueProductSlug(
      owned.business._id,
      baseSlug,
      existing._id,
    );

    existing.name = values.name.trim();
    existing.slug = slug;
    existing.description = values.description.trim();
    existing.price = values.price;
    existing.compareAt = values.compareAt;
    existing.category = values.category.trim();
    existing.inStock = values.inStock;
    existing.stockQty = values.stockQty;
    existing.images = values.images;
    existing.tags = values.tags;
    existing.accent = values.accent?.trim() || existing.accent || "#0F766E";
    await existing.save();

    return jsonOk({ product: toPublicProduct(existing.toObject()) });
  } catch (err) {
    console.error("[products/:id PATCH]", err);
    return jsonError("Could not update product.", 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return jsonError("Product not found.", 404);
    }

    await connectDb();
    const result = await Product.findOneAndDelete({
      _id: id,
      businessId: owned.business._id,
    });
    if (!result) return jsonError("Product not found.", 404);

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[products/:id DELETE]", err);
    return jsonError("Could not delete product.", 500);
  }
}
