import { Schema, models, model, type HydratedDocument, type Model } from "mongoose";

/**
 * Singleton document (one row, upserted by `_id`) holding platform-wide
 * pricing knobs that aren't tied to any one business — starting with the
 * featured-listing weekly fee. `lib/platform-settings.ts` reads/writes this
 * with sensible in-code fallbacks, so the feature works before this
 * collection has ever been written to; the upcoming admin panel edits the
 * same document.
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
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export type PlatformSettingsDocument = HydratedDocument<IPlatformSettings>;

export const PlatformSettings: Model<IPlatformSettings> =
  (models.PlatformSettings as Model<IPlatformSettings> | undefined) ??
  model<IPlatformSettings>("PlatformSettings", platformSettingsSchema);
