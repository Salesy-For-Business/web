"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CurrencySelect } from "@/components/currency-select";
import {
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
} from "@/components/auth/styles";
import { CURRENCIES, formatMoney, type BusinessCurrency } from "@/lib/currencies";
import {
  getApiError,
  useAdminSettingsQuery,
  useUpdateAdminPinMutation,
  useUpdateSettingsMutation,
  type AdminSettings,
} from "@/lib/admin/settings-queries";

const saveButtonClass = clsx(primaryButtonClass, "mt-5 sm:w-auto");

function SaveButton({
  pending,
  disabled,
  onClick,
  children,
}: {
  pending: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      className={saveButtonClass}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function FeaturedPriceCard({ settings }: { settings: AdminSettings }) {
  const update = useUpdateSettingsMutation();
  const [prices, setPrices] = useState<Record<BusinessCurrency, string>>(() => {
    const initial = {} as Record<BusinessCurrency, string>;
    for (const { code } of CURRENCIES) {
      const value = settings.featuredListingWeeklyPrice[code];
      initial[code] = value == null ? "" : String(value);
    }
    return initial;
  });

  async function onSave() {
    const payload: Partial<Record<BusinessCurrency, number | null>> = {};
    for (const { code } of CURRENCIES) {
      const raw = prices[code].trim();
      payload[code] = raw === "" ? null : Number(raw);
      if (payload[code] != null && !Number.isFinite(payload[code])) {
        toast.error(`${code} price must be a number.`);
        return;
      }
    }
    try {
      await update.mutateAsync({ featuredListingWeeklyPrice: payload });
      toast.success("Featured-listing pricing saved");
    } catch (err) {
      toast.error(getApiError(err, "Could not update pricing."));
    }
  }

  return (
    <AdminCard
      title="Featured-listing weekly price"
      description="What sellers pay per week to feature a product, in whole units (e.g. naira, not kobo). Leave a currency blank to not offer featuring in it."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {CURRENCIES.map((c) => {
          const value = Number(prices[c.code]);
          return (
            <div key={c.code}>
              <label htmlFor={`featured-${c.code}`} className={fieldLabelClass}>
                {c.symbol} {c.code}
              </label>
              <input
                id={`featured-${c.code}`}
                type="number"
                min={0}
                inputMode="decimal"
                className={inputClass}
                placeholder="Not offered"
                value={prices[c.code]}
                onChange={(e) => setPrices((p) => ({ ...p, [c.code]: e.target.value }))}
              />
              <p className={fieldHintClass}>
                {prices[c.code].trim() && Number.isFinite(value)
                  ? `${formatMoney(value, c.code)} per week`
                  : c.code === "NGN"
                    ? "Blank falls back to the ₦1,000 default."
                    : "Not offered"}
              </p>
            </div>
          );
        })}
      </div>
      <SaveButton pending={update.isPending} onClick={() => void onSave()}>
        Save pricing
      </SaveButton>
    </AdminCard>
  );
}

function RemindersCard({ settings }: { settings: AdminSettings }) {
  const update = useUpdateSettingsMutation();
  const [days, setDays] = useState(String(settings.subscriptionReminderDays));
  const parsed = Number(days);
  const valid = days.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= 30;

  async function onSave() {
    try {
      await update.mutateAsync({ subscriptionReminderDays: parsed });
      toast.success("Reminder window saved");
    } catch (err) {
      toast.error(getApiError(err, "Could not update reminders."));
    }
  }

  return (
    <AdminCard
      title="Subscription reminders"
      description="Boutique and Pro sellers get a renewal reminder email before their card is charged."
    >
      <div className="max-w-xs">
        <label htmlFor="reminder-days" className={fieldLabelClass}>
          Days before renewal
        </label>
        <input
          id="reminder-days"
          type="number"
          min={0}
          max={30}
          inputMode="numeric"
          className={inputClass}
          value={days}
          aria-invalid={!valid || undefined}
          onChange={(e) => setDays(e.target.value)}
        />
        <p className={fieldHintClass}>
          {valid && parsed === 0
            ? "Reminders are turned off."
            : "Between 0 and 30. Set 0 to turn reminders off."}
        </p>
      </div>
      <SaveButton pending={update.isPending} disabled={!valid} onClick={() => void onSave()}>
        Save reminders
      </SaveButton>
    </AdminCard>
  );
}

function ContactCard({ settings }: { settings: AdminSettings }) {
  const update = useUpdateSettingsMutation();
  const [email, setEmail] = useState(settings.supportEmail);
  const [currency, setCurrency] = useState<BusinessCurrency>(settings.defaultStoreCurrency);

  async function onSave() {
    try {
      await update.mutateAsync({ supportEmail: email.trim(), defaultStoreCurrency: currency });
      toast.success("Contact and defaults saved");
    } catch (err) {
      toast.error(getApiError(err, "Could not update settings."));
    }
  }

  return (
    <AdminCard title="Contact & defaults">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="support-email" className={fieldLabelClass}>Support email</label>
          <input
            id="support-email"
            type="email"
            autoComplete="off"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className={fieldHintClass}>Shown to sellers on the Support page.</p>
        </div>
        <CurrencySelect
          id="default-store-currency"
          label="Default store currency"
          value={currency}
          onChange={setCurrency}
          hint="Pre-selected for new stores at signup. Sellers can still change it."
        />
      </div>
      <SaveButton
        pending={update.isPending}
        disabled={!email.trim()}
        onClick={() => void onSave()}
      >
        Save contact & defaults
      </SaveButton>
    </AdminCard>
  );
}

function PinCard({ customized }: { customized: boolean }) {
  const update = useUpdateAdminPinMutation();
  const [code, setCode] = useState("");

  async function onSave() {
    try {
      await update.mutateAsync(code);
      toast.success("Admin PIN updated");
      setCode("");
    } catch (err) {
      toast.error(getApiError(err, "Could not update the PIN."));
    }
  }

  return (
    <AdminCard
      title="Admin panel PIN"
      description="The shared 6-digit code every moderator enters to reach the admin panel. Changing it doesn’t sign anyone out immediately, but they’ll need the new code next time their gate expires."
      actions={
        customized ? (
          <StatusBadge tone="success">Custom PIN set</StatusBadge>
        ) : (
          <StatusBadge tone="warning">Still the default PIN</StatusBadge>
        )
      }
    >
      <div className="max-w-xs">
        <label htmlFor="admin-pin" className={fieldLabelClass}>New 6-digit code</label>
        <input
          id="admin-pin"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          className={clsx(inputClass, "tracking-[0.3em]")}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </div>
      <SaveButton
        pending={update.isPending}
        disabled={code.length !== 6}
        onClick={() => void onSave()}
      >
        Update PIN
      </SaveButton>
    </AdminCard>
  );
}

function SettingsContent() {
  const { data, isPending, isError } = useAdminSettingsQuery();

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description={
          <>
            Platform-wide knobs. Plan prices, commission, and limits live on the{" "}
            <Link href="/admin/plans" className="text-link hover:underline">Plans</Link>{" "}
            page; API keys are checked on{" "}
            <Link href="/admin/integrations" className="text-link hover:underline">
              Integrations
            </Link>
            .
          </>
        }
      />
      {isPending ? (
        <p className="text-[14px] text-muted">Loading settings…</p>
      ) : isError || !data ? (
        <p className="text-[14px] text-red-600">Could not load settings.</p>
      ) : (
        <div className="space-y-6">
          <FeaturedPriceCard settings={data} />
          <div className="grid gap-6 lg:grid-cols-2">
            <RemindersCard settings={data} />
            <PinCard customized={data.adminPinCustomized} />
          </div>
          <ContactCard settings={data} />
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <SettingsContent />
    </AdminShell>
  );
}
