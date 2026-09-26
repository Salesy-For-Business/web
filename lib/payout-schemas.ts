import { z } from "zod";
import { CURRENCIES } from "@/lib/currencies";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];

export const payoutSchema = z.object({
  storeCurrency: z.enum(currencyCodes),
  billingCurrency: z.enum(currencyCodes),
  syncCurrencies: z.boolean(),
  bankCountry: z.string().trim().length(2, "Invalid country"),
  bankCode: z.string().trim().min(1, "Select a bank"),
  accountNumber: z.string().trim().min(4, "Enter your account number"),
  accountName: z.string().trim().min(1, "Enter the account holder name"),
});

export type PayoutValues = z.infer<typeof payoutSchema>;
