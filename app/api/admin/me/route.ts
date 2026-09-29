import { connectDb, User } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getAdminGateFromCookies } from "@/lib/admin/gate";
import { jsonError, jsonOk } from "@/lib/api/http";

/** Tells the client whether to show the "Admin Panel" link/gate/dashboard —
 * intentionally doesn't require the PIN gate itself, since this is what
 * decides whether to show that gate screen in the first place. */
export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) return jsonError("Sign in to continue.", 401);

    await connectDb();
    const user = await User.findById(session.sub);
    if (!user || user.suspended) return jsonError("Sign in to continue.", 401);

    if (!user.isModerator || !user.moderatorRole) {
      return jsonOk({ isModerator: false, moderatorRole: null, gateVerified: false });
    }

    const gateUserId = await getAdminGateFromCookies();
    const gateVerified = gateUserId === String(user._id);

    return jsonOk({
      isModerator: true,
      moderatorRole: user.moderatorRole,
      gateVerified,
    });
  } catch (err) {
    console.error("[admin/me]", err);
    return jsonError("Could not load admin status.", 500);
  }
}
