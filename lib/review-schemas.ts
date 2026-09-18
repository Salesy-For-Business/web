import { z } from "zod";

export const createReviewSchema = z.object({
  orderReference: z.string().trim().min(1, "Order reference is required"),
  productId: z.string().trim().optional(),
  productName: z.string().trim().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z
    .string()
    .trim()
    .min(8, "Write a short review (at least 8 characters)")
    .max(1000, "Keep reviews under 1000 characters"),
  customerName: z.string().trim().min(1).max(80).optional(),
});

export type CreateReviewValues = z.infer<typeof createReviewSchema>;
