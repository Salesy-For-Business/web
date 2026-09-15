import { connectDb, User } from "@/lib/db";
import { issueOtp } from "@/lib/auth/otp";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api/http";
import { forgotPasswordSchema } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Enter a valid email",
      );
    }

    await connectDb();
    const email = parsed.data.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return jsonError("No account found for that email.", 404);
    }
    if (user.provider === "google" && !user.passwordHash) {
      return jsonError(
        "This account uses Google. Sign in with Google instead.",
      );
    }

    await issueOtp(email, "reset");
    const token = await createSessionToken({
      sub: String(user._id),
      email,
    });
    await setSessionCookie(token);

    return jsonOk({
      message: "Check your email for a reset code.",
      next: "pendingReset" as const,
    });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    return jsonError("Could not start reset. Try again.", 500);
  }
}
