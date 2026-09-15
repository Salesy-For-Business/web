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

export interface IBusiness {
  userId: Types.ObjectId;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  websiteUrl: string;
  logoDataUrl?: string;
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
  },
  { timestamps: true },
);

export type BusinessDocument = HydratedDocument<IBusiness>;
export type BusinessLean = IBusiness & { _id: Types.ObjectId };

export const Business: Model<IBusiness> =
  (models.Business as Model<IBusiness> | undefined) ??
  model<IBusiness>("Business", businessSchema);
