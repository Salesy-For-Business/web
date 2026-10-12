import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, StoreChangeRequest, type StoreChangeRequestLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { storeChangeRequestSchema } from "@/lib/store-change-schemas";
import { normalizeHandle, isHandleTaken } from "@/lib/auth/session-user";
import { isReservedStoreHandle } from "@/lib/storefront";

function toPublic(r: StoreChangeRequestLean) {
  return {
    id: String(r._id),
    currentStoreHandle: r.currentStoreHandle,
    currentBusinessName: r.currentBusinessName,
    requestedStoreHandle: r.requestedStoreHandle,
    requestedBusinessName: r.requestedBusinessName,
    status: r.status,
    reviewNote: r.reviewNote ?? null,
    createdAt: r.createdAt,
  };
}

/** The business's most recent request, so the dashboard can show a pending
 * banner or the last rejection note. */
export async function GET() {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    await connectDb();
    const latest = await StoreChangeRequest.findOne({ businessId: owned.business._id })
      .sort({ createdAt: -1 })
      .lean<StoreChangeRequestLean | null>();

    return jsonOk({ request: latest ? toPublic(latest) : null });
  } catch (err) {
    console.error("[business/store-change-request GET]", err);
    return jsonError("Could not load your request.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const body = await request.json();
    const parsed = storeChangeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");
    }

    await connectDb();
    const businessId = owned.business._id;

    const existingPending = await StoreChangeRequest.findOne({
      businessId,
      status: "pending",
    });
    if (existingPending) {
      return jsonError(
        "You already have a pending request — wait for it to be reviewed, or cancel it first.",
        409,
      );
    }

    const handle = normalizeHandle(parsed.data.requestedStoreHandle);
    if (handle.length < 3) {
      return jsonError("Handle must be at least 3 characters.");
    }
    if (isReservedStoreHandle(handle)) {
      return jsonError("That handle isn't available.");
    }
    if (handle !== owned.business.storeHandle) {
      const taken = await isHandleTaken(handle, owned.userId);
      if (taken) {
        return jsonError("That handle is already in use.");
      }
    }

    const created = await StoreChangeRequest.create({
      businessId,
      currentStoreHandle: owned.business.storeHandle,
      currentBusinessName: owned.business.businessName,
      requestedStoreHandle: handle,
      requestedBusinessName: parsed.data.requestedBusinessName.trim(),
      status: "pending",
    });

    return jsonOk({ request: toPublic(created.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("[business/store-change-request POST]", err);
    return jsonError("Could not submit request.", 500);
  }
}
