const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured. Add it to .env.local.",
    );
  }
  return key;
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data: T;
  };
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Payment request failed");
  }
  return data.data;
}

export type PaystackChannel = "card" | "bank_transfer" | "ussd";

export function channelsForMethod(
  method: "card" | "transfer" | "ussd",
): PaystackChannel[] {
  if (method === "transfer") return ["bank_transfer"];
  if (method === "ussd") return ["ussd"];
  return ["card"];
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  channels: PaystackChannel[];
  metadata?: Record<string, unknown>;
}) {
  return paystackFetch<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: input.channels,
      metadata: input.metadata,
    }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackFetch<{
    status: string;
    reference: string;
    amount: number;
    paid_at?: string;
    channel?: string;
    metadata?: Record<string, unknown>;
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function makeOrderReference() {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `SLY-${Date.now()}-${rand}`;
}
