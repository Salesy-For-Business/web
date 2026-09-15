import { connectDb, User } from "@/lib/db";
import { consumeOtp } from "@/lib/auth/otp";
import { getSessionFromCookies } from "@/lib/auth/session";
import { toPublicUser } from "@/lib/auth/session-user";
import { jsonError, jsonOk } from "@/lib/api/http";
import { otpSchema } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = otpSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid code");
    }

    const session = await getSessionFromCookies();
    if (!session) {
      return jsonError("Start signup again.", 401);
    }

    await connectDb();
    const user = await User.findById(session.sub);
    if (!user) {
      return jsonError("Start signup again.", 401);
    }

    const purpose =
      body.purpose === "reset" ? ("reset" as const) : ("signup" as const);

    const result = await consumeOtp(user.email, purpose, parsed.data.code);
    if (!result.ok) {
      return jsonError(result.error);
    }

    if (purpose === "signup") {
      user.emailVerified = true;
      await user.save();
      return jsonOk({
        next: "pendingBusiness" as const,
        user: toPublicUser(user.toObject()),
      });
    }

    return jsonOk({
      next: "resetPassword" as const,
      resetReady: true,
    });
  } catch (err) {
    console.error("[auth/verify-otp]", err);
    return jsonError("Could not verify code. Try again.", 500);
  }
}
