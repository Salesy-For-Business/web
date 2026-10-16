import { Business, User, connectDb } from "@/lib/db";
import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { deliveryLocationsSchema } from "@/lib/delivery-location-schemas";
import { jsonError, jsonOk } from "@/lib/api/http";
import { statusFor, toPublicBusiness, toPublicUser } from "@/lib/auth/session-user";

/**
 * Self-service: replaces the seller's full list of delivery locations in one
 * call — no admin approval needed, unlike store handle/name changes.
 */
export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const body = await request.json();
    const parsed = deliveryLocationsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Invalid delivery locations",
      );
    }
    const values = parsed.data;

    await connectDb();

    const updated = await Business.findByIdAndUpdate(
      owned.business._id,
      { deliveryLocations: values.deliveryLocations },
      { new: true },
    ).lean();
    if (!updated) return jsonError("Business not found.", 404);

    const user = await User.findById(owned.userId).lean();
    if (!user) return jsonError("Sign in to continue.", 401);

    return jsonOk({
      next: statusFor(user, updated),
      user: toPublicUser(user),
      business: toPublicBusiness(updated),
    });
  } catch (err) {
    console.error("[business/delivery-locations]", err);
    const message =
      err instanceof Error ? err.message : "Could not save delivery locations.";
    return jsonError(message, 500);
  }
}
