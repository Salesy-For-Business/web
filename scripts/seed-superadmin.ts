/**
 * One-off admin script: grants superadmin access to a user by email, and
 * seeds the shared admin PIN hash into PlatformSettings if it isn't set yet
 * (so the DB holds the real default hash rather than relying on the
 * code-level "123456" fallback in `lib/admin/pin.ts` indefinitely).
 *
 * Usage:
 *   bun run scripts/seed-superadmin.ts [email]
 *
 * Defaults to giftjacksun@gmail.com if no email is passed. The target user
 * must already exist (sign up first) — this script never fabricates an
 * account. Requires MONGODB_URI in `.env.local` (Bun loads it automatically).
 */

import { connectDb, User, PlatformSettings, PLATFORM_SETTINGS_ID } from "@/lib/db";
import { hashOtp } from "@/lib/auth/password";
import { DEFAULT_ADMIN_PIN } from "@/lib/admin/pin";

async function main() {
  const email = (process.argv[2] || "giftjacksun@gmail.com").trim().toLowerCase();

  await connectDb();

  const user = await User.findOne({ email });
  if (!user) {
    console.error(
      `No account found for ${email} — sign up with this email first, then re-run this script.`,
    );
    process.exit(1);
  }

  user.isModerator = true;
  user.moderatorRole = "superadmin";
  await user.save();
  console.log(`✓ ${email} is now superadmin.`);

  const settings = await PlatformSettings.findById(PLATFORM_SETTINGS_ID);
  if (!settings?.adminPinHash) {
    const hash = await hashOtp(DEFAULT_ADMIN_PIN);
    await PlatformSettings.updateOne(
      { _id: PLATFORM_SETTINGS_ID },
      { $set: { adminPinHash: hash } },
      { upsert: true },
    );
    console.log(`✓ Admin PIN seeded to the default (${DEFAULT_ADMIN_PIN}). Change it from /admin/settings.`);
  } else {
    console.log("— Admin PIN already configured, left unchanged.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
