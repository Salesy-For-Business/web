import { connectDb, User } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { issueOtp } from "@/lib/auth/otp";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import {
  clearGooglePendingCookie,
  readGooglePendingCookie,
} from "@/lib/auth/google";
import { jsonError, jsonOk } from "@/lib/api/http";
import { profileSchema } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Invalid signup details",
      );
    }

    const values = parsed.data;
    await connectDb();
    let email = values.email.trim().toLowerCase();
    let firstName = values.firstName.trim();
    let lastName = values.lastName.trim();

    if (values.provider === "google") {
      // Never trust a client-asserted "google" provider for identity —
      // re-check against the signed profile our own OAuth callback stashed
      // after actually verifying it with Google. Anyone could otherwise
      // POST { provider: "google", email: "someone-else@x.com" } here and
      // get an "emailVerified" account for an address they don't own.
      const pending = await readGooglePendingCookie();
      if (!pending || pending.email !== email) {
        return jsonError(
          "Your Google sign-in expired. Continue with Google again.",
          401,
        );
      }
      email = pending.email;
      firstName = pending.firstName;
      lastName = pending.lastName;
    }

    const existing = await User.findOne({ email });
    if (existing?.emailVerified) {
      return jsonError(
        "An account with this email already exists. Sign in instead.",
        409,
      );
    }

    const passwordHash =
      values.provider === "email"
        ? await hashPassword(values.password ?? "")
        : null;

    let userId: string;

    if (existing) {
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.phone = values.phone;
      existing.passwordHash = passwordHash;
      existing.provider = values.provider;
      existing.emailVerified = values.provider === "google";
      await existing.save();
      userId = String(existing._id);
    } else {
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone: values.phone,
        passwordHash,
        provider: values.provider,
        emailVerified: values.provider === "google",
      });
      userId = String(user._id);
    }

    if (values.provider === "google") {
      await clearGooglePendingCookie();
      const token = await createSessionToken({ sub: userId, email });
      await setSessionCookie(token);
      return jsonOk({
        next: "pendingBusiness" as const,
        user: {
          firstName,
          lastName,
          email,
          phone: values.phone,
          provider: "google" as const,
          emailVerified: true,
        },
      });
    }

    await issueOtp(email, "signup");
    const token = await createSessionToken({ sub: userId, email });
    await setSessionCookie(token);

    return jsonOk({
      next: "pendingVerify" as const,
      message: "Check your email for a verification code.",
    });
  } catch (err) {
    console.error("[auth/signup]", err);
    return jsonError("Could not create account. Try again.", 500);
  }
}
