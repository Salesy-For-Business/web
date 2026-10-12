import { requireAdmin } from "@/lib/admin/require-admin";
import {
  connectDb,
  StoreChangeRequest,
  type StoreChangeRequestLean,
  type StoreChangeRequestStatus,
} from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

const VALID_STATUSES: StoreChangeRequestStatus[] = ["pending", "approved", "rejected"];

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim();
    const validStatus = VALID_STATUSES.find((s) => s === status);

    await connectDb();
    const requests = await StoreChangeRequest.find(validStatus ? { status: validStatus } : {})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<StoreChangeRequestLean[]>();

    return jsonOk({
      requests: requests.map((r) => ({
        id: String(r._id),
        businessId: String(r.businessId),
        currentStoreHandle: r.currentStoreHandle,
        currentBusinessName: r.currentBusinessName,
        requestedStoreHandle: r.requestedStoreHandle,
        requestedBusinessName: r.requestedBusinessName,
        status: r.status,
        reviewNote: r.reviewNote ?? null,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("[admin/store-requests GET]", err);
    return jsonError("Could not load requests.", 500);
  }
}
