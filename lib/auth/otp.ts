import { connectDb, Otp } from "@/lib/db";
import {
  generateOtpCode,
  hashOtp,
  verifyOtpCode,
} from "@/lib/auth/password";
import { sendOtpEmail } from "@/lib/email/brevo";

const OTP_TTL_MS = 15 * 60 * 1000;

export type OtpPurpose = "signup" | "reset";

export async function issueOtp(email: string, purpose: OtpPurpose) {
  await connectDb();
  const code = generateOtpCode();
  const codeHash = await hashOtp(code);
  const normalized = email.trim().toLowerCase();

  await Otp.deleteMany({ email: normalized, purpose });
  await Otp.create({
    email: normalized,
    purpose,
    codeHash,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  await sendOtpEmail(normalized, code, purpose);
  return { ok: true as const };
}

export async function consumeOtp(
  email: string,
  purpose: OtpPurpose,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDb();
  const normalized = email.trim().toLowerCase();
  const doc = await Otp.findOne({ email: normalized, purpose }).sort({
    createdAt: -1,
  });

  if (!doc || doc.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "That code expired. Request a new one." };
  }

  const valid = await verifyOtpCode(code, doc.codeHash);
  if (!valid) {
    return { ok: false, error: "That code is incorrect." };
  }

  await Otp.deleteMany({ email: normalized, purpose });
  return { ok: true };
}
