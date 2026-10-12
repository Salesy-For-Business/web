import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type StoreChangeRequestStatus = "pending" | "approved" | "rejected";

/**
 * A seller's request to change their store handle and/or business name.
 * `Business.storeHandle`/`businessName` are untouched until a superadmin
 * approves — the storefront keeps resolving the old handle in the meantime.
 */
export interface IStoreChangeRequest {
  businessId: Types.ObjectId;
  currentStoreHandle: string;
  currentBusinessName: string;
  requestedStoreHandle: string;
  requestedBusinessName: string;
  status: StoreChangeRequestStatus;
  reviewedByUserId?: Types.ObjectId;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeChangeRequestSchema = new Schema<IStoreChangeRequest>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    currentStoreHandle: { type: String, required: true },
    currentBusinessName: { type: String, required: true },
    requestedStoreHandle: { type: String, required: true },
    requestedBusinessName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, trim: true },
  },
  { timestamps: true },
);

export type StoreChangeRequestDocument = HydratedDocument<IStoreChangeRequest>;
export type StoreChangeRequestLean = IStoreChangeRequest & { _id: Types.ObjectId };

export const StoreChangeRequest: Model<IStoreChangeRequest> =
  (models.StoreChangeRequest as Model<IStoreChangeRequest> | undefined) ??
  model<IStoreChangeRequest>("StoreChangeRequest", storeChangeRequestSchema);
