import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";
import type { BusinessCurrency } from "@/lib/currencies";

export type FeaturedListingOrderStatus = "pending" | "paid" | "failed";

/**
 * Tracks a seller paying to feature one product on the public `/listings`
 * page — deliberately separate from `Order` (`order.ts`), since this has no
 * buyer, no line items, and no seller/platform split: it's a flat fee paid
 * entirely to Salesy's main Paystack account.
 */
export interface IFeaturedListingOrder {
  businessId: Types.ObjectId;
  productId: Types.ObjectId;
  reference: string;
  weeks: number;
  amountMinorUnits: number;
  currency: BusinessCurrency;
  status: FeaturedListingOrderStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const featuredListingOrderSchema = new Schema<IFeaturedListingOrder>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    reference: { type: String, required: true, unique: true, index: true },
    weeks: { type: Number, required: true, min: 1, max: 8 },
    amountMinorUnits: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ["NGN", "GHS", "ZAR", "KES"],
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export type FeaturedListingOrderDocument =
  HydratedDocument<IFeaturedListingOrder>;
export type FeaturedListingOrderLean = IFeaturedListingOrder & {
  _id: Types.ObjectId;
};

export const FeaturedListingOrder: Model<IFeaturedListingOrder> =
  (models.FeaturedListingOrder as Model<IFeaturedListingOrder> | undefined) ??
  model<IFeaturedListingOrder>(
    "FeaturedListingOrder",
    featuredListingOrderSchema,
  );
