import { requireAdmin } from "@/lib/admin/require-admin";
import { connectDb, Product, type ProductLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

function toPublic(p: ProductLean) {
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
    inStock: p.inStock,
    featuredUntil: p.featuredUntil ?? null,
    businessId: String(p.businessId),
  };
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    await connectDb();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<ProductLean[]>();

    return jsonOk({ products: products.map(toPublic) });
  } catch (err) {
    console.error("[admin/products GET]", err);
    return jsonError("Could not load products.", 500);
  }
}
