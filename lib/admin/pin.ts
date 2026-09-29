import { connectDb, PlatformSettings, PLATFORM_SETTINGS_ID } from "@/lib/db";
import { hashOtp, verifyOtpCode } from "@/lib/auth/password";

/** Works out of the box before anyone has ever set a real PIN — the seed
 * script (`scripts/seed-superadmin.ts`) replaces this with a real hash on
 * first run, so this literal only ever matters pre-seed. */
export const DEFAULT_ADMIN_PIN = "123456";

export async function verifyAdminPin(code: string): Promise<boolean> {
  await connectDb();
  const doc = await PlatformSettings.findById(PLATFORM_SETTINGS_ID).lean();
  if (!doc?.adminPinHash) {
    return code === DEFAULT_ADMIN_PIN;
  }
  return verifyOtpCode(code, doc.adminPinHash);
}

export async function setAdminPin(code: string): Promise<void> {
  await connectDb();
  const hash = await hashOtp(code);
  await PlatformSettings.updateOne(
    { _id: PLATFORM_SETTINGS_ID },
    { $set: { adminPinHash: hash } },
    { upsert: true },
  );
}
