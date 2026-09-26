import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";
import type { AuthPlan } from "@/lib/auth-store";
import type { LiveChatProviderId } from "@/lib/live-chat";
import type { BusinessCurrency } from "@/lib/currencies";

export type SubscriptionStatus = "none" | "active" | "past_due" | "cancelled";

export interface IBusiness {
  userId: Types.ObjectId;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  websiteUrl: string;
  logoDataUrl?: string;
  /** Optional dedicated image for og:image / twitter:image. Falls back to
   * the logo, then the store's first product image, when unset. */
  socialImageUrl?: string;
  hasPhysicalAddress: boolean;
  street?: string;
  city?: string;
  state?: string;
  description: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerRole: "Owner" | "Manager" | "Partner";
  isRegistered: boolean;
  cacNumber?: string;
  plan: AuthPlan;
  storeHandle: string;
  liveChatEnabled: boolean;
  liveChatProvider: LiveChatProviderId;
  liveChatSnippet: string;

  // Currency — store vs. billing are independent, with a sync toggle so
  // most sellers never have to think about it (both default to NGN).
  storeCurrency: BusinessCurrency;
  billingCurrency: BusinessCurrency;
  syncCurrencies: boolean;

  // Bank account, collected once at signup — required before a store can
  // accept orders (see `paystackSubaccountCode`).
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  bankCountry?: string;

  // Paystack subaccount — its presence is the "can accept orders" gate.
  paystackSubaccountCode?: string;
  paystackSubaccountPercentageCharge?: number;

  // Recurring subscription (Boutique/Pro only).
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  paystackSubscriptionPlanCode?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionRenewsAt?: Date;
  lastRenewalReminderSentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    businessName: { type: String, required: true, trim: true },
    businessEmail: { type: String, required: true, trim: true, lowercase: true },
    businessPhone: { type: String, required: true, trim: true },
    websiteUrl: { type: String, trim: true, default: "" },
    logoDataUrl: { type: String },
    socialImageUrl: { type: String },
    hasPhysicalAddress: { type: Boolean, default: false },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    ownerFirstName: { type: String, required: true, trim: true },
    ownerLastName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, trim: true, lowercase: true },
    ownerPhone: { type: String, required: true, trim: true },
    ownerRole: {
      type: String,
      enum: ["Owner", "Manager", "Partner"],
      default: "Owner",
    },
    isRegistered: { type: Boolean, default: false },
    cacNumber: { type: String, trim: true },
    plan: {
      type: String,
      enum: ["free", "boutique", "pro"],
      default: "free",
    },
    storeHandle: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    liveChatEnabled: { type: Boolean, default: false },
    liveChatProvider: {
      type: String,
      enum: ["smartsupp", "tawk", "crisp", "tidio", "jivo", "other"],
      default: "smartsupp",
    },
    liveChatSnippet: { type: String, default: "" },

    storeCurrency: {
      type: String,
      enum: ["NGN", "GHS", "ZAR", "KES"],
      default: "NGN",
    },
    billingCurrency: {
      type: String,
      enum: ["NGN", "GHS", "ZAR", "KES"],
      default: "NGN",
    },
    syncCurrencies: { type: Boolean, default: true },

    bankAccountName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankCode: { type: String, trim: true },
    bankCountry: { type: String, trim: true, uppercase: true },

    paystackSubaccountCode: { type: String, index: true },
    paystackSubaccountPercentageCharge: { type: Number },

    paystackCustomerCode: { type: String },
    paystackSubscriptionCode: { type: String },
    paystackSubscriptionPlanCode: { type: String },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "past_due", "cancelled"],
      default: "none",
    },
    subscriptionRenewsAt: { type: Date },
    lastRenewalReminderSentAt: { type: Date },
  },
  { timestamps: true },
);

export type BusinessDocument = HydratedDocument<IBusiness>;
export type BusinessLean = IBusiness & { _id: Types.ObjectId };

export const Business: Model<IBusiness> =
  (models.Business as Model<IBusiness> | undefined) ??
  model<IBusiness>("Business", businessSchema);
