import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface IAdminAuditLog {
  actorUserId: Types.ObjectId;
  actorEmail: string;
  /** e.g. "moderator.assign", "settings.pin_update", "business.suspend". */
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const adminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String },
    targetId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type AdminAuditLogDocument = HydratedDocument<IAdminAuditLog>;
export type AdminAuditLogLean = IAdminAuditLog & { _id: Types.ObjectId };

export const AdminAuditLog: Model<IAdminAuditLog> =
  (models.AdminAuditLog as Model<IAdminAuditLog> | undefined) ??
  model<IAdminAuditLog>("AdminAuditLog", adminAuditLogSchema);
