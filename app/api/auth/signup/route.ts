import { connectDb, User } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { issueOtp } from "@/lib/auth/otp";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
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
    const email = values.email.trim().toLowerCase();

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
      existing.firstName = values.firstName.trim();
      existing.lastName = values.lastName.trim();
      existing.phone = values.phone;
      existing.passwordHash = passwordHash;
      existing.provider = values.provider;
      existing.emailVerified = values.provider === "google";
      await existing.save();
      userId = String(existing._id);
    } else {
      const user = await User.create({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email,
        phone: values.phone,
        passwordHash,
        provider: values.provider,
        emailVerified: values.provider === "google",
      });
      userId = String(user._id);
    }

    if (values.provider === "google") {
      const token = await createSessionToken({ sub: userId, email });
      await setSessionCookie(token);
      return jsonOk({
        next: "pendingBusiness" as const,
        user: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
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
