import { connectDb, User } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  getSessionFromCookies,
} from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api/http";
import { resetPasswordSchema } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid password");
    }

    const session = await getSessionFromCookies();
    if (!session) {
      return jsonError("Reset session expired. Start again.", 401);
    }

    if (!body.resetVerified) {
      return jsonError("Verify the email code before setting a new password.");
    }

    await connectDb();
    const passwordHash = await hashPassword(parsed.data.password);
    await User.findByIdAndUpdate(session.sub, {
      passwordHash,
    });
    await clearSessionCookie();

    return jsonOk({ next: "anonymous" as const });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    return jsonError("Could not reset password. Try again.", 500);
  }
}
