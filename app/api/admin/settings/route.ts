import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, PlatformSettings, PLATFORM_SETTINGS_ID } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import {
  CURRENCIES,
  fromMinorUnits,
  toMinorUnits,
  type BusinessCurrency,
} from "@/lib/currencies";
import { getPlatformSettings } from "@/lib/platform-settings";

const currencyCodes = CURRENCIES.map((c) => c.code) as [
  BusinessCurrency,
  ...BusinessCurrency[],
];

/** Featured prices travel in whole units (naira, cedi…); stored in minor units. */
const updateSchema = z
  .object({
    featuredListingWeeklyPrice: z
      .object({
        NGN: z.number().min(0).nullable().optional(),
        GHS: z.number().min(0).nullable().optional(),
        ZAR: z.number().min(0).nullable().optional(),
        KES: z.number().min(0).nullable().optional(),
      })
      .strict(),
    subscriptionReminderDays: z.number().int().min(0).max(30),
    supportEmail: z.string().trim().toLowerCase().email("Enter a valid email"),
    defaultStoreCurrency: z.enum(currencyCodes),
  })
  .partial();

async function loadSettings() {
  const settings = await getPlatformSettings();
  const featured: Partial<Record<BusinessCurrency, number>> = {};
  for (const [code, minor] of Object.entries(settings.featuredListingWeeklyPrice)) {
    if (minor != null) featured[code as BusinessCurrency] = fromMinorUnits(minor, code);
  }
  return { ...settings, featuredListingWeeklyPrice: featured };
}

export async function GET() {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    return jsonOk({ settings: await loadSettings() });
  } catch (err) {
    console.error("[admin/settings GET]", err);
    return jsonError("Could not load settings.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid settings");
    }
    const values = parsed.data;

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, ""> = {};
    if (values.featuredListingWeeklyPrice) {
      for (const [code, amount] of Object.entries(values.featuredListingWeeklyPrice)) {
        const path = `featuredListingWeeklyPrice.${code}`;
        if (amount == null) $unset[path] = "";
        else $set[path] = toMinorUnits(amount, code);
      }
    }
    if (values.subscriptionReminderDays !== undefined) {
      $set.subscriptionReminderDays = values.subscriptionReminderDays;
    }
    if (values.supportEmail !== undefined) $set.supportEmail = values.supportEmail;
    if (values.defaultStoreCurrency !== undefined) {
      $set.defaultStoreCurrency = values.defaultStoreCurrency;
    }

    if (Object.keys($set).length || Object.keys($unset).length) {
      await connectDb();
      await PlatformSettings.updateOne(
        { _id: PLATFORM_SETTINGS_ID },
        {
          ...(Object.keys($set).length ? { $set } : {}),
          ...(Object.keys($unset).length ? { $unset } : {}),
        },
        { upsert: true },
      );
    }

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "settings.update",
      targetType: "settings",
      metadata: values,
    });

    return jsonOk({ settings: await loadSettings() });
  } catch (err) {
    console.error("[admin/settings PATCH]", err);
    return jsonError("Could not update settings.", 500);
  }
}
