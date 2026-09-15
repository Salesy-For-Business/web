import { connectDb, User, Business } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import {
  statusFor,
  toPublicBusiness,
  toPublicUser,
} from "@/lib/auth/session-user";
import { jsonError, jsonOk } from "@/lib/api/http";
import { signInSchema } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid details");
    }

    await connectDb();
    const email = parsed.data.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return jsonError(
        "No account found for that email. Create a store first.",
        404,
      );
    }

    if (user.provider === "google" && !user.passwordHash) {
      return jsonError(
        "This account uses Google. Continue with Google instead.",
      );
    }

    if (!user.passwordHash) {
      return jsonError("Incorrect email or password.", 401);
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return jsonError("Incorrect email or password.", 401);
    }

    const business = await Business.findOne({ userId: user._id }).lean();
    const userObj = user.toObject();
    const status = statusFor(userObj, business);

    const token = await createSessionToken({
      sub: String(user._id),
      email: user.email,
    });
    await setSessionCookie(token);

    return jsonOk({
      next: status,
      user: toPublicUser(userObj),
      business: business ? toPublicBusiness(business) : null,
    });
  } catch (err) {
    console.error("[auth/signin]", err);
    return jsonError("Could not sign in. Try again.", 500);
  }
}
