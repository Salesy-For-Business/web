import { Schema, models, model, type HydratedDocument, type Model } from "mongoose";
import type { BusinessCurrency } from "@/lib/currencies";

/**
 * Singleton document (one row, upserted by `_id`) holding platform-wide
 * knobs that aren't tied to any one business. `lib/platform-settings.ts`
 * reads it with in-code fallbacks, so every feature works before this
 * collection has ever been written to; the superadmin Settings page edits it.
 */
export interface IPlatformSettings {
  _id: string;
  /** Minor units (e.g. kobo) per currency for one week of a featured
   * listing. A currency with no entry is simply not offered yet. */
  featuredListingWeeklyPrice: {
    NGN?: number;
    GHS?: number;
    ZAR?: number;
    KES?: number;
  };
  /** How many days before renewal the daily reminder emails start. */
  subscriptionReminderDays?: number;
  /** Public contact address shown to sellers for platform support. */
  supportEmail?: string;
  /** Currency new stores default to at signup. */
  defaultStoreCurrency?: BusinessCurrency;
  /** Bcrypt hash of the shared 6-digit admin-panel PIN. Unset means "still
   * the literal default" — see `lib/admin/gate.ts`. */
  adminPinHash?: string;
  updatedAt: Date;
}

export const PLATFORM_SETTINGS_ID = "singleton";

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    _id: { type: String, default: PLATFORM_SETTINGS_ID },
    featuredListingWeeklyPrice: {
      NGN: { type: Number, min: 0 },
      GHS: { type: Number, min: 0 },
      ZAR: { type: Number, min: 0 },
      KES: { type: Number, min: 0 },
    },
    subscriptionReminderDays: { type: Number, min: 0, max: 30 },
    supportEmail: { type: String, trim: true, lowercase: true },
    defaultStoreCurrency: { type: String, enum: ["NGN", "GHS", "ZAR", "KES"] },
    adminPinHash: { type: String },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export type PlatformSettingsDocument = HydratedDocument<IPlatformSettings>;

export const PlatformSettings: Model<IPlatformSettings> =
  (models.PlatformSettings as Model<IPlatformSettings> | undefined) ??
  model<IPlatformSettings>("PlatformSettings", platformSettingsSchema);
