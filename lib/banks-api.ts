import { DEMO_BANKS, demoResolveAccount, type Bank } from "@/lib/banks";

/**
 * External banks / resolve API.
 * Set BANKS_API_BASE + BANKS_API_SECRET to proxy a live provider.
 * Expected shapes (common Nigerian payout APIs):
 *   GET  {base}/bank  →  { data: [{ code, name }, ...] } or { data: { banks: [...] } }
 *   GET  {base}/bank/resolve?account_number=&bank_code=
 *        → { data: { account_name, account_number } }
 * Without env, demo banks + resolve are used so the UI stays fully workable.
 */

const BASE = process.env.BANKS_API_BASE?.replace(/\/$/, "") ?? "";
const SECRET = process.env.BANKS_API_SECRET ?? "";

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${SECRET}`,
    Accept: "application/json",
  };
}

export async function fetchSupportedBanks(): Promise<Bank[]> {
  if (!BASE || !SECRET) {
    return DEMO_BANKS;
  }

  try {
    const res = await fetch(`${BASE}/bank`, {
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

  if (!BASE || !SECRET) {
    return demoResolveAccount(digits, bankCode);
  }

  try {
    const url = new URL(`${BASE}/bank/resolve`);
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
