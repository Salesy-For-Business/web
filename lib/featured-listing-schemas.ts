import { z } from "zod";

export const featureProductSchema = z.object({
  productId: z.string().trim().min(1, "Select a product"),
  weeks: z.coerce.number().int().min(1, "Minimum 1 week").max(8, "Maximum 8 weeks"),
});

export type FeatureProductValues = z.infer<typeof featureProductSchema>;
