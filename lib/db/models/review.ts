import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface IReview {
  businessId: Types.ObjectId;
  orderId: Types.ObjectId;
  orderReference: string;
  productId?: Types.ObjectId;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderReference: { type: String, required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

/** One review per product line on a paid order. */
reviewSchema.index({ orderId: 1, productName: 1 }, { unique: true });

export type ReviewDocument = HydratedDocument<IReview>;
export type ReviewLean = IReview & { _id: Types.ObjectId };

export const Review: Model<IReview> =
  (models.Review as Model<IReview> | undefined) ??
  model<IReview>("Review", reviewSchema);
