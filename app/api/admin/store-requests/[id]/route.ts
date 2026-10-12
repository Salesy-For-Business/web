import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, Business, StoreChangeRequest } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { reviewStoreChangeRequestSchema } from "@/lib/store-change-schemas";
import { isHandleTaken } from "@/lib/auth/session-user";
import { isReservedStoreHandle } from "@/lib/storefront";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = reviewStoreChangeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");
    }

    await connectDb();
    const changeRequest = await StoreChangeRequest.findById(id);
    if (!changeRequest) return jsonError("Request not found.", 404);
    if (changeRequest.status !== "pending") {
      return jsonError("This request has already been reviewed.", 409);
    }

    if (parsed.data.action === "approve") {
      // Re-validate — time has passed since submission, and the handle
      // could legitimately belong to someone else by now.
      if (isReservedStoreHandle(changeRequest.requestedStoreHandle)) {
        return jsonError("That handle isn't available anymore.", 409);
      }
      const business = await Business.findById(changeRequest.businessId);
      if (!business) return jsonError("Business no longer exists.", 404);

      if (changeRequest.requestedStoreHandle !== business.storeHandle) {
        const taken = await isHandleTaken(
          changeRequest.requestedStoreHandle,
          String(business.userId),
        );
        if (taken) {
          return jsonError(
            "That handle has since been taken by another store — reject and ask the seller to try a different one.",
            409,
          );
        }
      }

      business.storeHandle = changeRequest.requestedStoreHandle;
      business.businessName = changeRequest.requestedBusinessName;
      await business.save();
    }

    changeRequest.status = parsed.data.action === "approve" ? "approved" : "rejected";
    changeRequest.reviewedByUserId = new Types.ObjectId(admin.userId);
    changeRequest.reviewNote = parsed.data.note;
    await changeRequest.save();

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: parsed.data.action === "approve" ? "store_request.approve" : "store_request.reject",
      targetType: "store_change_request",
      targetId: id,
      metadata: {
        requestedStoreHandle: changeRequest.requestedStoreHandle,
        requestedBusinessName: changeRequest.requestedBusinessName,
        note: parsed.data.note,
      },
    });

    return jsonOk({ status: changeRequest.status });
  } catch (err) {
    console.error("[admin/store-requests/:id PATCH]", err);
    return jsonError("Could not review request.", 500);
  }
}
