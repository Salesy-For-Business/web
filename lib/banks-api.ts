/**
 * Nigerian bank list + NUBAN resolve via Paystack.
 * Set PAYSTACK_SECRET_KEY to go live; otherwise demo banks/resolve are used.
 *   GET https://api.paystack.co/bank
 *   GET https://api.paystack.co/bank/resolve?account_number=&bank_code=
 */

import { DEMO_BANKS, demoResolveAccount, type Bank } from "@/lib/banks";

const PAYSTACK_BASE = "https://api.paystack.co";
const SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${SECRET}`,
    Accept: "application/json",
  };
}

export async function fetchSupportedBanks(): Promise<Bank[]> {
  if (!SECRET) {
    return DEMO_BANKS;
  }

  try {
    const res = await fetch(`${PAYSTACK_BASE}/bank`, {
      headers: authHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("[banks] list failed", res.status);
      return DEMO_BANKS;
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
    if (!raw?.length) return DEMO_BANKS;
    return raw
      .map((b) => ({
        code: String(b.code),
        name: String(b.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("[banks] list error", err);
    return DEMO_BANKS;
  }
}

export async function resolveBankAccount(
  accountNumber: string,
  bankCode: string,
): Promise<{ accountName: string } | { error: string }> {
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
