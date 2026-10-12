import { z } from "zod";

export const storeChangeRequestSchema = z.object({
  requestedStoreHandle: z
    .string()
    .trim()
    .min(3, "Handle must be at least 3 characters")
    .max(24, "Handle must be 24 characters or fewer"),
  requestedBusinessName: z
    .string()
    .trim()
    .min(2, "Enter a business name")
    .max(120),
});

export type StoreChangeRequestValues = z.infer<typeof storeChangeRequestSchema>;

export const reviewStoreChangeRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().trim().max(300).optional(),
});
