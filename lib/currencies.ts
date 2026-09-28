export type BusinessCurrency = "NGN" | "GHS" | "ZAR" | "KES";

export type CurrencyInfo = {
  code: BusinessCurrency;
  name: string;
  symbol: string;
  /** Default bank-country association for subaccount payouts. */
  countryIso2: string;
  /** BCP 47 locale used for Intl.NumberFormat. */
  locale: string;
  /** How many minor units make one major unit — e.g. 100 kobo to 1 naira.
   * All four currencies here use 2 decimal places (kobo/pesewas/cents), but
   * this is a per-currency field rather than a hardcoded ×100 in case a
   * zero-decimal currency (e.g. JPY-style) is ever added. Paystack's API
   * always wants amounts in minor units — the dashboard UI converts this
   * for you, but the API (and `createPlan()`/`initializeTransaction()`)
   * does not. */
  minorUnitMultiplier: number;
};

/**
 * Supported store/billing currencies. Paystack's own currency + settlement
 * support is what actually bounds this list — these four map cleanly to a
 * single country's bank list each (unlike USD, which doesn't, so it's
 * intentionally left out for now — see the split-payments plan).
 */
export const CURRENCIES: CurrencyInfo[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", countryIso2: "NG", locale: "en-NG", minorUnitMultiplier: 100 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", countryIso2: "GH", locale: "en-GH", minorUnitMultiplier: 100 },
  { code: "ZAR", name: "South African Rand", symbol: "R", countryIso2: "ZA", locale: "en-ZA", minorUnitMultiplier: 100 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", countryIso2: "KE", locale: "en-KE", minorUnitMultiplier: 100 },
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
 * Converts a whole-unit amount (e.g. 5000 naira) to the minor units
 * (e.g. 500000 kobo) Paystack's API requires everywhere it accepts an
 * `amount` — `createPlan()`, `initializeTransaction()`, etc. Rounds to
 * guard against floating-point amounts (e.g. 19.99) producing a fractional
 * minor-unit value, which Paystack rejects.
 */
export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * findCurrency(currency).minorUnitMultiplier);
}

/** Inverse of `toMinorUnits` — minor units back to a whole-unit amount. */
export function fromMinorUnits(amountMinorUnits: number, currency: string): number {
  return amountMinorUnits / findCurrency(currency).minorUnitMultiplier;
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
