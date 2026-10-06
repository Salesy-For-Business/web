import {
  Schema,
  models,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type BlogPostStatus = "draft" | "published";

export interface IBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  coverImage?: string;
  status: BlogPostStatus;
  authorUserId: Types.ObjectId;
  authorName: string;
  tags: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 300 },
    contentMarkdown: { type: String, required: true },
    coverImage: { type: String },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    authorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    publishedAt: { type: Date, index: true },
  },
  { timestamps: true },
);

export type BlogPostDocument = HydratedDocument<IBlogPost>;
export type BlogPostLean = IBlogPost & { _id: Types.ObjectId };

export const BlogPost: Model<IBlogPost> =
  (models.BlogPost as Model<IBlogPost> | undefined) ??
  model<IBlogPost>("BlogPost", blogPostSchema);
