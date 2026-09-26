/**
 * Bank list + NUBAN resolve via Paystack, parameterized by bank country
 * (NG/GH/ZA/KE — see `lib/currencies.ts`). Set PAYSTACK_SECRET_KEY to go
 * live; otherwise Nigeria gets a demo bank list/resolver, other countries
 * get an empty list until a key is configured.
 *   GET https://api.paystack.co/bank?country=<name>
 *   GET https://api.paystack.co/bank/resolve?account_number=&bank_code=
 *
 * Paystack's real-time account-name resolution only supports Nigerian NUBAN
 * accounts — GH/ZA/KE bank details are collected without live verification
 * (the signup payout form shows a plain "account holder name" field for
 * those instead of a resolved-name readout).
 *
 * NOTE: the `/bank` country query value is Paystack's full lowercase
 * country name convention (e.g. "south africa") based on their documented
 * API — verify against current Paystack docs if bank lists come back empty
 * for a country.
 */

import { DEMO_BANKS, demoResolveAccount, type Bank } from "@/lib/banks";

const PAYSTACK_BASE = "https://api.paystack.co";
const SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

const COUNTRY_NAME: Record<string, string> = {
  NG: "nigeria",
  GH: "ghana",
  ZA: "south africa",
  KE: "kenya",
};

/** Countries whose bank accounts Paystack can resolve a holder name for
 * in real time. Everyone else gets a plain text "account holder name"
 * field in the UI instead. */
export function supportsAccountResolution(bankCountry: string) {
  return bankCountry === "NG";
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${SECRET}`,
    Accept: "application/json",
  };
}

export async function fetchSupportedBanks(
  bankCountry: string = "NG",
): Promise<Bank[]> {
  if (!SECRET) {
    return bankCountry === "NG" ? DEMO_BANKS : [];
  }

  try {
    const url = new URL(`${PAYSTACK_BASE}/bank`);
    url.searchParams.set("country", COUNTRY_NAME[bankCountry] ?? "nigeria");
    const res = await fetch(url.toString(), {
      headers: authHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("[banks] list failed", res.status);
      return bankCountry === "NG" ? DEMO_BANKS : [];
    }
    const json = (await res.json()) as {
      data?: Bank[] | { banks?: Bank[] };
      status?: boolean;
    };
    const raw = Array.isArray(json.data)
      ? json.data
      : json.data && "banks" in json.data
        ? json.data.banks
        : null;
    if (!raw?.length) return bankCountry === "NG" ? DEMO_BANKS : [];
    return raw
      .map((b) => ({
        code: String(b.code),
        name: String(b.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("[banks] list error", err);
    return bankCountry === "NG" ? DEMO_BANKS : [];
  }
}

export async function resolveBankAccount(
  accountNumber: string,
  bankCode: string,
  bankCountry: string = "NG",
): Promise<{ accountName: string } | { error: string }> {
  if (!supportsAccountResolution(bankCountry)) {
    return { error: "not-supported" };
  }

  const digits = accountNumber.replace(/\D/g, "");

  if (!SECRET) {
    return demoResolveAccount(digits, bankCode);
  }

  try {
    const url = new URL(`${PAYSTACK_BASE}/bank/resolve`);
    url.searchParams.set("account_number", digits);
    url.searchParams.set("bank_code", bankCode);

    const res = await fetch(url.toString(), {
      headers: authHeaders(),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { account_name?: string; account_number?: string };
    };

    if (!res.ok || json.status === false || !json.data?.account_name) {
      return {
        error:
          json.message ||
          "Could not resolve this account. Check the number and bank.",
      };
    }

    return { accountName: json.data.account_name.trim().toUpperCase() };
  } catch (err) {
    console.error("[banks] resolve error", err);
    return { error: "Account lookup failed. Try again in a moment." };
  }
}
