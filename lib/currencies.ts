export type BusinessCurrency = "NGN" | "GHS" | "ZAR" | "KES";

export type CurrencyInfo = {
  code: BusinessCurrency;
  name: string;
  symbol: string;
  /** Default bank-country association for subaccount payouts. */
  countryIso2: string;
  /** BCP 47 locale used for Intl.NumberFormat. */
  locale: string;
};

/**
 * Supported store/billing currencies. Paystack's own currency + settlement
 * support is what actually bounds this list — these four map cleanly to a
 * single country's bank list each (unlike USD, which doesn't, so it's
 * intentionally left out for now — see the split-payments plan).
 */
export const CURRENCIES: CurrencyInfo[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", countryIso2: "NG", locale: "en-NG" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", countryIso2: "GH", locale: "en-GH" },
  { code: "ZAR", name: "South African Rand", symbol: "R", countryIso2: "ZA", locale: "en-ZA" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", countryIso2: "KE", locale: "en-KE" },
];

export const DEFAULT_CURRENCY: BusinessCurrency = "NGN";

export function findCurrency(code: string | undefined | null): CurrencyInfo {
  return (
    CURRENCIES.find((c) => c.code === code) ??
    CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY)!
  );
}

export function isBusinessCurrency(value: string): value is BusinessCurrency {
  return CURRENCIES.some((c) => c.code === value);
}

/** Bank country (ISO2) a given currency settles to. */
export function bankCountryForCurrency(currency: string): string {
  return findCurrency(currency).countryIso2;
}

/**
 * Formats a whole-unit amount (e.g. naira, not kobo) in the given currency.
 * Replaces ad-hoc `${symbol}${amount.toLocaleString()}` string-building —
 * `formatNaira` in `lib/dashboard.ts` stays as a thin NGN-only wrapper for
 * callers not yet migrated.
 */
export function formatMoney(amount: number, currency: string | undefined | null) {
  const info = findCurrency(currency);
  try {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${info.symbol}${amount.toLocaleString()}`;
  }
}
