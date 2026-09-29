import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
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

const updateSchema = z.object({
  inStock: z.boolean().optional(),
  category: z.string().trim().min(1).optional(),
  // Setting to null manually revokes an active featured slot.
  featuredUntil: z.string().datetime().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const product = await Product.findById(id).lean<ProductLean | null>();
    if (!product) return jsonError("Product not found.", 404);

    return jsonOk({ product: toPublic(product) });
  } catch (err) {
    console.error("[admin/products/:id GET]", err);
    return jsonError("Could not load product.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid update");
    }

    const { featuredUntil, ...rest } = parsed.data;
    const update: Record<string, unknown> = { ...rest };
    if (featuredUntil !== undefined) {
      update.featuredUntil = featuredUntil ? new Date(featuredUntil) : null;
    }

    await connectDb();
    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
    }).lean<ProductLean | null>();
    if (!product) return jsonError("Product not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "product.update",
      targetType: "product",
      targetId: id,
      metadata: { after: parsed.data },
    });

    return jsonOk({ product: toPublic(product) });
  } catch (err) {
    console.error("[admin/products/:id PATCH]", err);
    return jsonError("Could not update product.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const product = await Product.findByIdAndDelete(id).lean<ProductLean | null>();
    if (!product) return jsonError("Product not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "product.delete",
      targetType: "product",
      targetId: id,
      metadata: { name: product.name },
    });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[admin/products/:id DELETE]", err);
    return jsonError("Could not delete product.", 500);
  }
}
