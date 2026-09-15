import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Add a short description (at least 10 characters)")
    .max(2000),
  price: z.number().min(0, "Price cannot be negative"),
  compareAt: z.number().min(0).optional(),
  category: z.string().trim().min(1, "Enter a category").max(60),
  inStock: z.boolean(),
  stockQty: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).max(8),
  tags: z.array(z.string().trim().min(1).max(40)).max(8),
  accent: z.string().trim().optional(),
});

export type ProductValues = z.infer<typeof productSchema>;

export const checkoutInitializeSchema = z.object({
  storeHandle: z.string().trim().min(1),
  method: z.enum(["card", "transfer", "ussd"]),
  customer: z.object({
    name: z.string().trim().min(1, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().min(10, "Enter a valid phone number"),
  }),
  address: z.string().trim().min(1, "Enter a delivery address or pickup note"),
  notes: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutInitializeValues = z.infer<typeof checkoutInitializeSchema>;
