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
  /** Amount in the currency's minor unit (kobo for NGN, pesewas for GHS,
   * cents for ZAR/KES) — renamed from `amountKobo` now that NGN isn't the
   * only currency, though the underlying integer-minor-unit math is the
   * same for all four. */
  amountMinorUnits: number;
  reference: string;
  callbackUrl: string;
  channels: PaystackChannel[];
  currency: string;
  /** Subaccount to split this transaction with, if the business has one. */
  subaccount?: string;
  /** Who absorbs Paystack's own transaction fee — Salesy's main account
   * always bears it per product decision, kept as a param rather than
   * hardcoded so it's visible/overridable at the call site. */
  bearer?: "account" | "subaccount";
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
      amount: input.amountMinorUnits,
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: input.channels,
      currency: input.currency,
      subaccount: input.subaccount,
      bearer: input.bearer,
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

// ---------------------------------------------------------------------------
// Split payments — subaccounts
// ---------------------------------------------------------------------------

/** Creates a Paystack subaccount for a business's bank account. Its
 * `percentage_charge` is what the MAIN account keeps — 5 on the Free plan,
 * 0 on paid plans. */
export async function createSubaccount(input: {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge: number;
}) {
  return paystackFetch<{ subaccount_code: string; account_name?: string }>(
    "/subaccount",
    {
      method: "POST",
      body: JSON.stringify({
        business_name: input.businessName,
        bank_code: input.bankCode,
        account_number: input.accountNumber,
        percentage_charge: input.percentageCharge,
      }),
    },
  );
}

/** The only field this project ever needs to change on a subaccount after
 * creation — flips between 5 (Free) and 0 (Boutique/Pro) on plan change. */
export async function updateSubaccountPercentageCharge(
  subaccountCode: string,
  percentageCharge: number,
) {
  return paystackFetch<{ subaccount_code: string }>(
    `/subaccount/${encodeURIComponent(subaccountCode)}`,
    {
      method: "PUT",
      body: JSON.stringify({ percentage_charge: percentageCharge }),
    },
  );
}

// ---------------------------------------------------------------------------
// Recurring billing — plans, customers, subscriptions
// ---------------------------------------------------------------------------

/** Creates a Paystack recurring Plan. Only ever used from a one-off local
 * setup script, never at request time — see `lib/plan-codes.ts`. */
export async function createPlan(input: {
  name: string;
  amountMinorUnits: number;
  currency: string;
  interval?: "daily" | "weekly" | "monthly" | "annually";
}) {
  return paystackFetch<{ plan_code: string }>("/plan", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      amount: input.amountMinorUnits,
      currency: input.currency,
      interval: input.interval ?? "monthly",
    }),
  });
}

/** Creates (or, if Paystack dedupes by email, fetches) the Paystack Customer
 * behind a business's subscription. */
export async function createCustomer(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}) {
  return paystackFetch<{ customer_code: string }>("/customer", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
    }),
  });
}

/** Starts a hosted-checkout charge tagged with a recurring Plan — on the
 * first successful charge, Paystack auto-creates the Subscription (fired to
 * us via the `subscription.create` webhook event). */
export async function initializeSubscriptionCharge(input: {
  email: string;
  reference: string;
  callbackUrl: string;
  planCode: string;
  currency: string;
}) {
  return paystackFetch<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      reference: input.reference,
      callback_url: input.callbackUrl,
      plan: input.planCode,
      currency: input.currency,
    }),
  });
}

export async function fetchSubscription(subscriptionCode: string) {
  return paystackFetch<{
    status: string;
    subscription_code: string;
    next_payment_date?: string;
  }>(`/subscription/${encodeURIComponent(subscriptionCode)}`);
}

/** Cancels a subscription — `token` is the `email_token` Paystack returns
 * when the subscription was created/fetched. */
export async function disableSubscription(input: {
  code: string;
  token: string;
}) {
  return paystackFetch<unknown>("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: input.code, token: input.token }),
  });
}
