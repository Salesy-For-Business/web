import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed";
export type OrderChannel = "card" | "transfer" | "ussd";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  qty: number;
  unitPrice: number;
}

export interface IOrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface IOrder {
  businessId: Types.ObjectId;
  storeHandle: string;
  reference: string;
  status: OrderStatus;
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  feeAmount: number;
  total: number;
  channel: OrderChannel;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    storeHandle: { type: String, required: true, lowercase: true, index: true },
    reference: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    feeAmount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    channel: {
      type: String,
      enum: ["card", "transfer", "ussd"],
      required: true,
    },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export type OrderDocument = HydratedDocument<IOrder>;
export type OrderLean = IOrder & { _id: Types.ObjectId };

export const Order: Model<IOrder> =
  (models.Order as Model<IOrder> | undefined) ??
  model<IOrder>("Order", orderSchema);
