import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, Review, type ReviewLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["support", "superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const review = await Review.findByIdAndDelete(id).lean<ReviewLean | null>();
    if (!review) return jsonError("Review not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "review.delete",
      targetType: "review",
      targetId: id,
      metadata: { productName: review.productName, rating: review.rating },
    });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[admin/reviews/:id DELETE]", err);
    return jsonError("Could not delete review.", 500);
  }
}
