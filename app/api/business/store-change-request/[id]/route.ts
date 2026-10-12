import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, StoreChangeRequest } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { id } = await params;
    await connectDb();
    const existing = await StoreChangeRequest.findOne({
      _id: id,
      businessId: owned.business._id,
    });
    if (!existing) return jsonError("Request not found.", 404);
    if (existing.status !== "pending") {
      return jsonError("Only a pending request can be cancelled.", 409);
    }

    await existing.deleteOne();
    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[business/store-change-request/:id DELETE]", err);
    return jsonError("Could not cancel request.", 500);
  }
}
