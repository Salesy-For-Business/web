import { requireAdmin } from "@/lib/admin/require-admin";
import { connectDb, Business, Review, type ReviewLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["support", "superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    await connectDb();
    const filter = q
      ? {
          $or: [
            { productName: { $regex: q, $options: "i" } },
            { customerName: { $regex: q, $options: "i" } },
            { body: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<ReviewLean[]>();

    const businessIds = [...new Set(reviews.map((r) => String(r.businessId)))];
    const businesses = await Business.find({ _id: { $in: businessIds } })
      .select("businessName")
      .lean();
    const nameById = new Map(businesses.map((b) => [String(b._id), b.businessName]));

    return jsonOk({
      reviews: reviews.map((r) => ({
        id: String(r._id),
        businessName: nameById.get(String(r.businessId)) ?? "Unknown store",
        productName: r.productName,
        customerName: r.customerName,
        rating: r.rating,
        body: r.body,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("[admin/reviews GET]", err);
    return jsonError("Could not load reviews.", 500);
  }
}
