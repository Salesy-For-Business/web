import { Schema, models, model, type HydratedDocument, type Model } from "mongoose";
import type { PlanId } from "@/lib/plans";

type PriceDoc = { monthly?: number | null; yearly?: number | null };

/**
 * One document per fixed tier (`_id` is the tier id). Every field is
 * optional — `lib/plan-config.ts` merges this over the code defaults in
 * `lib/plan-defaults.ts`, so a tier works before an admin ever saves it.
 */
export interface IPlanConfig {
  _id: PlanId;
  name?: string;
  blurb?: string;
  badge?: string | null;
  featured?: boolean;
  ctaLabel?: string;
  features?: string[];
  commissionPercent?: number;
  /** `null` = unlimited. */
  listingLimit?: number | null;
  prices?: {
    NGN?: PriceDoc;
    GHS?: PriceDoc;
    ZAR?: PriceDoc;
    KES?: PriceDoc;
  };
  /** Paystack recurring (monthly) plan codes per billing currency. */
  paystackPlanCodes?: {
    NGN?: string;
    GHS?: string;
    ZAR?: string;
    KES?: string;
  };
  active?: boolean;
  updatedAt: Date;
}

const priceSchema = new Schema<PriceDoc>(
  {
    monthly: { type: Number, min: 0, default: null },
    yearly: { type: Number, min: 0, default: null },
  },
  { _id: false },
);

const planConfigSchema = new Schema<IPlanConfig>(
  {
    _id: { type: String, enum: ["free", "boutique", "pro"], required: true },
    name: { type: String, trim: true },
    blurb: { type: String, trim: true },
    badge: { type: String, trim: true },
    featured: { type: Boolean },
    ctaLabel: { type: String, trim: true },
    features: { type: [String], default: undefined },
    commissionPercent: { type: Number, min: 0, max: 100 },
    listingLimit: { type: Number, min: 0, default: undefined },
    prices: {
      NGN: { type: priceSchema },
      GHS: { type: priceSchema },
      ZAR: { type: priceSchema },
      KES: { type: priceSchema },
    },
    paystackPlanCodes: {
      NGN: { type: String },
      GHS: { type: String },
      ZAR: { type: String },
      KES: { type: String },
    },
    active: { type: Boolean },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export type PlanConfigDocument = HydratedDocument<IPlanConfig>;

export const PlanConfig: Model<IPlanConfig> =
  (models.PlanConfig as Model<IPlanConfig> | undefined) ??
  model<IPlanConfig>("PlanConfig", planConfigSchema);
