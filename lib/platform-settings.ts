import { connectDb, PlatformSettings, PLATFORM_SETTINGS_ID } from "@/lib/db";
import type { BusinessCurrency } from "@/lib/currencies";

/** Works out of the box even before an admin has ever configured pricing —
 * ₦1000/week, other currencies unset until an admin sets them. */
const DEFAULT_FEATURED_LISTING_WEEKLY_PRICE: Partial<
  Record<BusinessCurrency, number>
> = {
  NGN: 100_000, // ₦1000 in kobo
};

/** Weekly featured-listing price, in minor units, for a currency — or
 * `null` if that currency isn't configured yet (neither in the DB nor the
 * in-code default above). */
export async function getFeaturedListingWeeklyPrice(
  currency: BusinessCurrency,
): Promise<number | null> {
  await connectDb();
  const doc = await PlatformSettings.findById(PLATFORM_SETTINGS_ID).lean();
  const configured = doc?.featuredListingWeeklyPrice?.[currency];
  if (configured != null) return configured;
  return DEFAULT_FEATURED_LISTING_WEEKLY_PRICE[currency] ?? null;
}
