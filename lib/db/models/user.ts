import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type AuthProviderDoc = "email" | "google";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string | null;
  provider: AuthProviderDoc;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, default: null },
    provider: { type: String, enum: ["email", "google"], required: true },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type UserDocument = HydratedDocument<IUser>;
export type UserLean = IUser & { _id: Types.ObjectId };

export const User: Model<IUser> =
  (models.User as Model<IUser> | undefined) ??
  model<IUser>("User", userSchema);
