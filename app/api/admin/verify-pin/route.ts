import { z } from "zod";
import { connectDb, User } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { verifyAdminPin } from "@/lib/admin/pin";
import { createAdminGateToken, setAdminGateCookie } from "@/lib/admin/gate";
import { jsonError, jsonOk } from "@/lib/api/http";

const verifyPinSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return jsonError("Sign in to continue.", 401);

    await connectDb();
    const user = await User.findById(session.sub);
    if (!user || user.suspended) return jsonError("Sign in to continue.", 401);
    if (!user.isModerator || !user.moderatorRole) {
      return jsonError("You don't have admin access.", 403);
    }

    const body = await request.json();
    const parsed = verifyPinSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid code");
    }

    const valid = await verifyAdminPin(parsed.data.code);
    if (!valid) {
      return jsonError("Incorrect code.", 401);
    }

    const token = await createAdminGateToken(String(user._id));
    await setAdminGateCookie(token);

    return jsonOk({ verified: true });
  } catch (err) {
    console.error("[admin/verify-pin]", err);
    return jsonError("Could not verify code.", 500);
  }
}
