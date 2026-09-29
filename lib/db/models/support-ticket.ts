import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketAuthorType = "business" | "admin";

export interface ITicketMessage {
  authorType: TicketAuthorType;
  authorName: string;
  body: string;
  createdAt: Date;
}

export interface ISupportTicket {
  businessId: Types.ObjectId;
  subject: string;
  status: TicketStatus;
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    authorType: { type: String, enum: ["business", "admin"], required: true },
    authorName: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    messages: { type: [ticketMessageSchema], default: [] },
  },
  { timestamps: true },
);

export type SupportTicketDocument = HydratedDocument<ISupportTicket>;
export type SupportTicketLean = ISupportTicket & { _id: Types.ObjectId };

export const SupportTicket: Model<ISupportTicket> =
  (models.SupportTicket as Model<ISupportTicket> | undefined) ??
  model<ISupportTicket>("SupportTicket", supportTicketSchema);
