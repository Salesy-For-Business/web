import { connectDb, PlatformSettings, PLATFORM_SETTINGS_ID } from "@/lib/db";
import { DEFAULT_CURRENCY, type BusinessCurrency } from "@/lib/currencies";

/** Works out of the box even before an admin has ever configured pricing —
 * ₦1000/week, other currencies unset until an admin sets them. */
export const DEFAULT_FEATURED_LISTING_WEEKLY_PRICE: Partial<
  Record<BusinessCurrency, number>
> = {
  NGN: 100_000, // ₦1000 in kobo
};

export const DEFAULT_SUBSCRIPTION_REMINDER_DAYS = 7;
export const DEFAULT_SUPPORT_EMAIL = "support@salesy.link";

export type ResolvedPlatformSettings = {
  /** Minor units per currency, defaults merged in. */
  featuredListingWeeklyPrice: Partial<Record<BusinessCurrency, number>>;
  subscriptionReminderDays: number;
  supportEmail: string;
  defaultStoreCurrency: BusinessCurrency;
  adminPinCustomized: boolean;
  updatedAt: string | null;
};

export async function getPlatformSettings(): Promise<ResolvedPlatformSettings> {
  await connectDb();
  const doc = await PlatformSettings.findById(PLATFORM_SETTINGS_ID).lean();
  const saved = doc?.featuredListingWeeklyPrice ?? {};
  return {
    featuredListingWeeklyPrice: {
      ...DEFAULT_FEATURED_LISTING_WEEKLY_PRICE,
      ...Object.fromEntries(
        Object.entries(saved).filter(([, v]) => v != null),
      ),
    },
    subscriptionReminderDays:
      doc?.subscriptionReminderDays ?? DEFAULT_SUBSCRIPTION_REMINDER_DAYS,
    supportEmail: doc?.supportEmail || DEFAULT_SUPPORT_EMAIL,
    defaultStoreCurrency: doc?.defaultStoreCurrency ?? DEFAULT_CURRENCY,
    adminPinCustomized: Boolean(doc?.adminPinHash),
    updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

/** Weekly featured-listing price, in minor units, for a currency — or
 * `null` if that currency isn't configured yet (neither in the DB nor the
 * in-code default above). */
export async function getFeaturedListingWeeklyPrice(
  currency: BusinessCurrency,
): Promise<number | null> {
  const settings = await getPlatformSettings();
  return settings.featuredListingWeeklyPrice[currency] ?? null;
}
