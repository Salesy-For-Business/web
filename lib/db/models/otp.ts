import {
  Schema,
  models,
  model,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface IOtp {
  email: string;
  purpose: "signup" | "reset";
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: { type: String, enum: ["signup", "reset"], required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpDocument = HydratedDocument<IOtp>;

export const Otp: Model<IOtp> =
  (models.Otp as Model<IOtp> | undefined) ?? model<IOtp>("Otp", otpSchema);
