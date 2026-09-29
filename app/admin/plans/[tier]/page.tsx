"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import clsx from "clsx";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { CURRENCIES, type BusinessCurrency } from "@/lib/currencies";
import {
  getApiError,
  useAdminPlanQuery,
  useSyncPlanMutation,
  useUpdatePlanMutation,
  type AdminPlan,
  type PaystackSyncResult,
} from "@/lib/admin/plan-queries";
import type { PlanUpdateValues } from "@/lib/admin/plan-schemas";
import { PLAN_IDS } from "@/lib/plan-defaults";
import type { PlanId } from "@/lib/plans";

type PriceDraft = Record<BusinessCurrency, { monthly: string; yearly: string }>;

type Draft = {
  name: string;
  blurb: string;
  badge: string;
  featured: boolean;
  ctaLabel: string;
  features: string[];
  commissionPercent: string;
  unlimited: boolean;
  listingLimit: string;
  prices: PriceDraft;
  active: boolean;
  planCodes: Record<BusinessCurrency, string>;
};

function toDraft(plan: AdminPlan): Draft {
  const prices = {} as PriceDraft;
  const planCodes = {} as Record<BusinessCurrency, string>;
  for (const { code } of CURRENCIES) {
    const p = plan.prices[code];
    prices[code] = {
      monthly: p?.monthly == null ? "" : String(p.monthly),
      yearly: p?.yearly == null ? "" : String(p.yearly),
    };
    const pc = plan.planCodes[code];
    planCodes[code] = pc?.source === "database" && pc.code ? pc.code : "";
  }
  return {
    name: plan.name,
    blurb: plan.blurb,
    badge: plan.badge ?? "",
    featured: plan.featured,
    ctaLabel: plan.ctaLabel,
    features: [...plan.features],
    commissionPercent: String(plan.commissionPercent),
    unlimited: plan.listingLimit == null,
    listingLimit: plan.listingLimit == null ? "" : String(plan.listingLimit),
    prices,
    active: plan.active,
    planCodes,
  };
}

function numOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function toPayload(draft: Draft, isFree: boolean): PlanUpdateValues {
  const prices: NonNullable<PlanUpdateValues["prices"]> = {};
  const codes: NonNullable<PlanUpdateValues["paystackPlanCodes"]> = {};
  for (const { code } of CURRENCIES) {
    const monthly = numOrNull(draft.prices[code].monthly);
    const yearly = numOrNull(draft.prices[code].yearly);
    if (monthly != null || yearly != null) prices[code] = { monthly, yearly };
    codes[code] = draft.planCodes[code].trim() || null;
  }
  return {
    name: draft.name.trim(),
    blurb: draft.blurb.trim(),
    badge: draft.badge.trim() || null,
    featured: draft.featured,
    ctaLabel: draft.ctaLabel.trim(),
    features: draft.features.map((f) => f.trim()).filter(Boolean),
    commissionPercent: Number(draft.commissionPercent) || 0,
    listingLimit: draft.unlimited
      ? null
      : Math.max(0, Math.floor(Number(draft.listingLimit) || 0)),
    prices,
    ...(isFree ? {} : { active: draft.active, paystackPlanCodes: codes }),
  };
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-heading">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-primary" : "bg-surface-muted",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

function SyncResults({ results }: { results: PaystackSyncResult[] }) {
  return (
    <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
      {results.map((r) => (
        <li
          key={r.currency}
          className="flex flex-col gap-1 px-3 py-2.5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <span className="font-medium text-heading">{r.currency}</span>
            <StatusBadge
              tone={
                r.action === "failed"
                  ? "danger"
                  : r.action === "skipped"
                    ? "neutral"
                    : "success"
              }
            >
              {r.action}
            </StatusBadge>
          </span>
          <span className="break-all text-muted">
            {r.code ?? ""}
            {r.message ? ` ${r.code ? "· " : ""}${r.message}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PlanEditor({
  plan,
  syncResults,
  onSyncResults,
}: {
  plan: AdminPlan;
  syncResults: PaystackSyncResult[] | null;
  onSyncResults: (results: PaystackSyncResult[]) => void;
}) {
  const isFree = plan.id === "free";
  const update = useUpdatePlanMutation(plan.id);
  const sync = useSyncPlanMutation(plan.id);
  const initial = useMemo(() => toDraft(plan), [plan]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [newFeature, setNewFeature] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setPrice(currency: BusinessCurrency, field: "monthly" | "yearly", value: string) {
    setDraft((d) => ({
      ...d,
      prices: { ...d.prices, [currency]: { ...d.prices[currency], [field]: value } },
    }));
  }

  function moveFeature(index: number, delta: -1 | 1) {
    setDraft((d) => {
      const next = [...d.features];
      const target = index + delta;
      if (target < 0 || target >= next.length) return d;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return { ...d, features: next };
    });
  }

  function addFeature() {
    const value = newFeature.trim();
    if (!value) return;
    set("features", [...draft.features, value]);
    setNewFeature("");
  }

  async function save() {
    try {
      await update.mutateAsync(toPayload(draft, isFree));
      toast.success(`${draft.name} saved`);
      return true;
    } catch (err) {
      toast.error(getApiError(err, "Could not save plan."));
      return false;
    }
  }

  async function saveAndSync() {
    if (dirty && !(await save())) return;
    try {
      const data = await sync.mutateAsync();
      onSyncResults(data.results);
      const failed = data.results.filter((r) => r.action === "failed").length;
      if (failed) toast.error(`${failed} currency sync${failed > 1 ? "s" : ""} failed`);
      else toast.success("Paystack plans are in sync");
    } catch (err) {
      toast.error(getApiError(err, "Could not sync with Paystack."));
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <AdminPageHeader
        backHref="/admin/plans"
        backLabel="All plans"
        title={`${plan.name} plan`}
        description={
          plan.updatedAt
            ? `Last saved ${new Date(plan.updatedAt).toLocaleString()}`
            : "Using built-in defaults — nothing saved yet."
        }
      />

      <AdminCard title="General" description="What sellers see on the pricing page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="plan-name" className={fieldLabelClass}>Name</label>
            <input
              id="plan-name"
              className={inputClass}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="plan-badge" className={fieldLabelClass}>Badge</label>
            <input
              id="plan-badge"
              className={inputClass}
              placeholder="e.g. Popular"
              value={draft.badge}
              onChange={(e) => set("badge", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="plan-blurb" className={fieldLabelClass}>Short description</label>
            <input
              id="plan-blurb"
              className={inputClass}
              value={draft.blurb}
              onChange={(e) => set("blurb", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="plan-cta" className={fieldLabelClass}>Button label</label>
            <input
              id="plan-cta"
              className={inputClass}
              value={draft.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Toggle
              label="Highlight on pricing page"
              checked={draft.featured}
              onChange={(v) => set("featured", v)}
            />
          </div>
          {!isFree ? (
            <div className="sm:col-span-2">
              <Toggle
                label="Available to sellers"
                description="Hidden plans disappear from the pricing page and can't be purchased. Existing subscribers keep it."
                checked={draft.active}
                onChange={(v) => set("active", v)}
              />
            </div>
          ) : null}
        </div>
      </AdminCard>

      <AdminCard
        title="Pricing"
        description="Whole currency units (e.g. naira, not kobo). Leave a currency blank to not offer it. Monthly prices are what Paystack charges; yearly is shown on the pricing page."
      >
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[28rem] text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="pb-2 font-medium">Currency</th>
                <th className="pb-2 font-medium">Monthly</th>
                <th className="pb-2 font-medium">Yearly</th>
              </tr>
            </thead>
            <tbody>
              {CURRENCIES.map((c) => (
                <tr key={c.code}>
                  <td className="py-1.5 pr-3 whitespace-nowrap text-heading">
                    {c.symbol} {c.code}
                  </td>
                  <td className="py-1.5 pr-3">
                    <input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      aria-label={`${c.code} monthly price`}
                      className={inputClass}
                      value={draft.prices[c.code].monthly}
                      onChange={(e) => setPrice(c.code, "monthly", e.target.value)}
                      disabled={isFree}
                      placeholder={isFree ? "0" : "—"}
                    />
                  </td>
                  <td className="py-1.5">
                    <input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      aria-label={`${c.code} yearly price`}
                      className={inputClass}
                      value={draft.prices[c.code].yearly}
                      onChange={(e) => setPrice(c.code, "yearly", e.target.value)}
                      disabled={isFree}
                      placeholder={isFree ? "0" : "—"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard title="Limits & commission">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="plan-commission" className={fieldLabelClass}>
              Commission per sale (%)
            </label>
            <input
              id="plan-commission"
              type="number"
              min={0}
              max={100}
              step="0.5"
              inputMode="decimal"
              className={inputClass}
              value={draft.commissionPercent}
              onChange={(e) => set("commissionPercent", e.target.value)}
            />
            <p className={fieldHintClass}>
              Applies to new stores and whenever a store next changes plan.
              Existing Paystack splits aren’t rewritten automatically.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="plan-limit" className={fieldLabelClass}>Product listing limit</label>
              <input
                id="plan-limit"
                type="number"
                min={0}
                inputMode="numeric"
                className={inputClass}
                value={draft.unlimited ? "" : draft.listingLimit}
                placeholder={draft.unlimited ? "Unlimited" : "e.g. 5"}
                disabled={draft.unlimited}
                onChange={(e) => set("listingLimit", e.target.value)}
              />
            </div>
            <Toggle
              label="Unlimited listings"
              checked={draft.unlimited}
              onChange={(v) => set("unlimited", v)}
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Features" description="Bullet points on the pricing page, in order.">
        <ul className="space-y-2">
          {draft.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                aria-label={`Feature ${index + 1}`}
                className={clsx(inputClass, "min-w-0 flex-1")}
                value={feature}
                onChange={(e) =>
                  set(
                    "features",
                    draft.features.map((f, i) => (i === index ? e.target.value : f)),
                  )
                }
              />
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => moveFeature(index, -1)}
                  className="rounded-lg border border-border p-2 text-muted hover:bg-surface disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === draft.features.length - 1}
                  onClick={() => moveFeature(index, 1)}
                  className="rounded-lg border border-border p-2 text-muted hover:bg-surface disabled:opacity-40"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove feature"
                  onClick={() =>
                    set("features", draft.features.filter((_, i) => i !== index))
                  }
                  className="rounded-lg border border-border p-2 text-red-600 hover:bg-surface"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            aria-label="New feature"
            className={clsx(inputClass, "min-w-0 flex-1")}
            placeholder="Add a feature…"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFeature();
              }
            }}
          />
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 text-[15px] font-medium text-link hover:bg-surface"
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </AdminCard>

      {!isFree ? (
        <AdminCard
          title="Paystack billing"
          description="Creates the monthly Paystack plan for every currency with a monthly price, or updates its amount if it already exists. Existing subscribers move to the new amount on their next charge."
          actions={
            <button
              type="button"
              onClick={() => void saveAndSync()}
              disabled={sync.isPending || update.isPending}
              className={clsx(primaryButtonClass, "sm:w-auto")}
            >
              {sync.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              {dirty ? "Save & sync to Paystack" : "Sync to Paystack"}
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {CURRENCIES.map(({ code }) => {
              const resolved = plan.planCodes[code];
              return (
                <div key={code}>
                  <label htmlFor={`plan-code-${code}`} className={fieldLabelClass}>
                    <span className="flex items-center justify-between gap-2">
                      <span>{code} plan code</span>
                      {resolved?.source === "env" ? (
                        <StatusBadge tone="warning">from env</StatusBadge>
                      ) : resolved?.code ? (
                        <StatusBadge tone="success">saved</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">not set</StatusBadge>
                      )}
                    </span>
                  </label>
                  <input
                    id={`plan-code-${code}`}
                    className={clsx(inputClass, "font-mono")}
                    placeholder={resolved?.source === "env" ? (resolved.code ?? "") : "PLN_…"}
                    value={draft.planCodes[code]}
                    onChange={(e) =>
                      set("planCodes", { ...draft.planCodes, [code]: e.target.value })
                    }
                  />
                </div>
              );
            })}
          </div>
          <p className={fieldHintClass}>
            Normally filled in by syncing. Paste a code only if you created the plan in the
            Paystack dashboard yourself. Env-var codes are used as a fallback until one is saved here.
          </p>
          {syncResults ? <SyncResults results={syncResults} /> : null}
        </AdminCard>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm lg:left-64">
        <div className="mx-auto flex max-w-6xl flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6 lg:px-8">
          {dirty ? (
            <p className="text-[13px] text-muted sm:mr-auto">You have unsaved changes.</p>
          ) : null}
          <button
            type="button"
            disabled={!dirty || update.isPending}
            onClick={() => setDraft(initial)}
            className={clsx(secondaryButtonClass, "sm:w-auto")}
          >
            Discard
          </button>
          <button
            type="button"
            disabled={!dirty || update.isPending}
            onClick={() => void save()}
            className={clsx(primaryButtonClass, "sm:w-auto")}
          >
            {update.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save plan
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanEditorLoader({ tier }: { tier: PlanId }) {
  const { data, isPending, isError } = useAdminPlanQuery(tier);
  // Lives here because a sync bumps `updatedAt`, which remounts the editor.
  const [syncResults, setSyncResults] = useState<PaystackSyncResult[] | null>(null);
  if (isPending) return <p className="text-[14px] text-muted">Loading plan…</p>;
  if (isError || !data) return <p className="text-[14px] text-red-600">Could not load plan.</p>;
  return (
    <PlanEditor
      key={data.updatedAt ?? "defaults"}
      plan={data}
      syncResults={syncResults}
      onSyncResults={setSyncResults}
    />
  );
}

export default function AdminPlanEditorPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = use(params);
  if (!(PLAN_IDS as string[]).includes(tier)) notFound();
  return (
    <AdminShell allow={["superadmin"]}>
      <PlanEditorLoader tier={tier as PlanId} />
    </AdminShell>
  );
}
