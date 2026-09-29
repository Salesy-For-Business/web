import { z } from "zod";

const priceSchema = z.object({
  monthly: z.number().min(0).nullable(),
  yearly: z.number().min(0).nullable(),
});

const currencyRecord = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .object({
      NGN: schema.optional(),
      GHS: schema.optional(),
      ZAR: schema.optional(),
      KES: schema.optional(),
    })
    .strict();

export const planUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(40),
    blurb: z.string().trim().max(160),
    badge: z.string().trim().max(24).nullable(),
    featured: z.boolean(),
    ctaLabel: z.string().trim().min(1, "Button label is required").max(40),
    features: z.array(z.string().trim().min(1).max(120)).max(20),
    commissionPercent: z.number().min(0).max(100),
    listingLimit: z.number().int().min(0).nullable(),
    prices: currencyRecord(priceSchema),
    paystackPlanCodes: currencyRecord(
      z
        .string()
        .trim()
        .regex(/^PLN_[A-Za-z0-9]+$/, "Plan codes look like PLN_xxxx")
        .nullable(),
    ),
    active: z.boolean(),
  })
  .partial();

export type PlanUpdateValues = z.infer<typeof planUpdateSchema>;
