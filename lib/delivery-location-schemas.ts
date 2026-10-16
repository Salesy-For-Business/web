import { z } from "zod";

export const deliveryLocationSchema = z.object({
  country: z.string().trim().min(1, "Select a country"),
  countryName: z.string().trim().min(1),
  state: z.string().trim().min(1, "Select a state"),
  stateName: z.string().trim().min(1),
});

export const deliveryLocationsSchema = z.object({
  deliveryLocations: z.array(deliveryLocationSchema).max(50),
});

export type DeliveryLocationValues = z.infer<typeof deliveryLocationSchema>;
export type DeliveryLocationsValues = z.infer<typeof deliveryLocationsSchema>;
