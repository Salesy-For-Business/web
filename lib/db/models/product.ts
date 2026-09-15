import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface IProduct {
  businessId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt?: number;
  category: string;
  inStock: boolean;
  stockQty?: number;
  images: string[];
  tags: string[];
  accent: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, min: 0 },
    category: { type: String, required: true, trim: true, default: "General" },
    inStock: { type: Boolean, default: true },
    stockQty: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    accent: { type: String, default: "#0F766E" },
  },
  { timestamps: true },
);

productSchema.index({ businessId: 1, slug: 1 }, { unique: true });

export type ProductDocument = HydratedDocument<IProduct>;
export type ProductLean = IProduct & { _id: Types.ObjectId };

export const Product: Model<IProduct> =
  (models.Product as Model<IProduct> | undefined) ??
  model<IProduct>("Product", productSchema);
