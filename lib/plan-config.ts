import { connectDb, PlanConfig, type IPlanConfig } from "@/lib/db";
import { CURRENCIES, type BusinessCurrency } from "@/lib/currencies";
import {
  DEFAULT_PLAN_CONFIGS,
  PLAN_IDS,
  type PlanConfigData,
  type PlanPrices,
  type PublicPlan,
} from "@/lib/plan-defaults";
import {
  envPlanCodeFor,
  isPaidPlanTier,
  type PaidPlanTier,
} from "@/lib/plan-codes";
import type { PlanId } from "@/lib/plans";

export type PlanCodeSource = "database" | "env" | null;

export type AdminPlanConfig = PlanConfigData & {
  /** Resolved plan code per currency, with where it came from. */
  planCodes: Partial<
    Record<BusinessCurrency, { code: string | null; source: PlanCodeSource }>
  >;
  updatedAt: string | null;
};

const CACHE_MS = 30_000;
let cache: { at: number; docs: Map<PlanId, IPlanConfig> } | null = null;

async function loadDocs(): Promise<Map<PlanId, IPlanConfig>> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.docs;
  await connectDb();
  const docs = await PlanConfig.find().lean<IPlanConfig[]>();
  const map = new Map<PlanId, IPlanConfig>();
  for (const doc of docs) map.set(doc._id, doc);
  cache = { at: Date.now(), docs: map };
  return map;
}

/** Call after any write to `PlanConfig` so the next read sees it. */
export function invalidatePlanConfigCache() {
  cache = null;
}

function mergePrices(defaults: PlanPrices, doc?: IPlanConfig["prices"]): PlanPrices {
  if (!doc) return defaults;
  const merged: PlanPrices = {};
  for (const { code } of CURRENCIES) {
    const saved = doc[code];
    if (saved && (saved.monthly != null || saved.yearly != null)) {
      merged[code] = { monthly: saved.monthly ?? null, yearly: saved.yearly ?? null };
    }
  }
  return merged;
}

function merge(id: PlanId, doc?: IPlanConfig): PlanConfigData {
  const d = DEFAULT_PLAN_CONFIGS[id];
  if (!doc) return d;
  return {
    id,
    name: doc.name || d.name,
    blurb: doc.blurb ?? d.blurb,
    badge: doc.badge === undefined ? d.badge : doc.badge || null,
    featured: doc.featured ?? d.featured,
    ctaLabel: doc.ctaLabel || d.ctaLabel,
    features: doc.features ?? d.features,
    commissionPercent: doc.commissionPercent ?? d.commissionPercent,
    listingLimit: doc.listingLimit === undefined ? d.listingLimit : doc.listingLimit,
    prices: doc.prices ? mergePrices(d.prices, doc.prices) : d.prices,
    active: id === "free" ? true : (doc.active ?? d.active),
  };
}

function codeFor(
  id: PlanId,
  currency: BusinessCurrency,
  doc?: IPlanConfig,
): { code: string | null; source: PlanCodeSource } {
  if (!isPaidPlanTier(id)) return { code: null, source: null };
  const dbCode = doc?.paystackPlanCodes?.[currency];
  if (dbCode) return { code: dbCode, source: "database" };
  const envCode = envPlanCodeFor(id, currency);
  if (envCode) return { code: envCode, source: "env" };
  return { code: null, source: null };
}

export async function getPlanConfig(id: PlanId): Promise<PlanConfigData> {
  const docs = await loadDocs();
  return merge(id, docs.get(id));
}

export async function getPlanConfigs(): Promise<PlanConfigData[]> {
  const docs = await loadDocs();
  return PLAN_IDS.map((id) => merge(id, docs.get(id)));
}

/** Plan configs for the admin screens, including plan-code provenance. */
export async function getAdminPlanConfigs(): Promise<AdminPlanConfig[]> {
  const docs = await loadDocs();
  return PLAN_IDS.map((id) => {
    const doc = docs.get(id);
    const planCodes: AdminPlanConfig["planCodes"] = {};
    for (const { code } of CURRENCIES) planCodes[code] = codeFor(id, code, doc);
    return {
      ...merge(id, doc),
      planCodes,
      updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
    };
  });
}

/** Public-safe plans: no plan codes, just which currencies can be subscribed in. */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  const docs = await loadDocs();
  return PLAN_IDS.map((id) => {
    const doc = docs.get(id);
    const subscribableCurrencies = CURRENCIES.map((c) => c.code).filter(
      (currency) => codeFor(id, currency, doc).code,
    );
    return { ...merge(id, doc), subscribableCurrencies };
  });
}

/** Paystack plan code a seller subscribes to, or `null` if that tier isn't offered in the currency. */
export async function resolvePlanCode(
  tier: PaidPlanTier,
  currency: BusinessCurrency,
): Promise<string | null> {
  const docs = await loadDocs();
  const doc = docs.get(tier);
  if (doc && doc.active === false) return null;
  return codeFor(tier, currency, doc).code;
}

/** Which paid tier a Paystack plan code belongs to (database or env). */
export async function tierForPlanCode(planCode: string): Promise<PaidPlanTier | null> {
  const docs = await loadDocs();
  for (const tier of ["boutique", "pro"] as const) {
    for (const { code } of CURRENCIES) {
      if (codeFor(tier, code, docs.get(tier)).code === planCode) return tier;
    }
  }
  return null;
}

export async function commissionPercentFor(plan: PlanId): Promise<number> {
  return (await getPlanConfig(plan)).commissionPercent;
}

/** Listing limit as a comparable number (`Infinity` = unlimited). */
export async function listingLimitFor(plan: PlanId): Promise<number> {
  const limit = (await getPlanConfig(plan)).listingLimit;
  return limit == null ? Infinity : limit;
}
