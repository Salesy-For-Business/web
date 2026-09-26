"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import {
  AuthGate,
  AuthShell,
  SignupStepper,
  SubmitButton,
} from "@/components/auth";
import { getApiError, useSetupPayoutMutation } from "@/lib/auth/queries";
import { useAuthStore } from "@/lib/auth-store";
import { CurrencySelect } from "@/components/currency-select";
import {
  BankAccountPicker,
  isAccountReady,
} from "@/components/shared/bank-account-picker";
import {
  bankCountryForCurrency,
  DEFAULT_CURRENCY,
  type BusinessCurrency,
} from "@/lib/currencies";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-[14px] font-medium text-heading">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

function PayoutForm() {
  const router = useRouter();
  const business = useAuthStore((s) => s.business);
  const setup = useSetupPayoutMutation();

  const [storeCurrency, setStoreCurrency] = useState<BusinessCurrency>(
    DEFAULT_CURRENCY,
  );
  const [syncCurrencies, setSyncCurrencies] = useState(true);
  const [billingCurrency, setBillingCurrency] = useState<BusinessCurrency>(
    DEFAULT_CURRENCY,
  );
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bankCountry = bankCountryForCurrency(storeCurrency);
  const loading = setup.isPending;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isAccountReady(bankCountry, bankCode, accountNumber, accountName)) {
      setError("Fill in your bank details before continuing.");
      return;
    }

    try {
      await setup.mutateAsync({
        storeCurrency,
        billingCurrency: syncCurrencies ? storeCurrency : billingCurrency,
        syncCurrencies,
        bankCountry,
        bankCode,
        accountNumber,
        accountName,
      });
      toast.success("Payout details saved. Your store is live!");
      router.push("/dashboard");
    } catch (err) {
      const message = getApiError(err, "Could not save your payout details.");
      setError(message);
      toast.error(message);
    }
  }

  return (
    <AuthShell
      title="Get paid"
      description={`One last step before ${business?.storeHandle ? `/${business.storeHandle}` : "your store"} can accept orders — where should we send your money?`}
    >
      <SignupStepper current={3} />

      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        <CurrencySelect
          id="store-currency"
          label="Store currency"
          value={storeCurrency}
          onChange={(next) => {
            setStoreCurrency(next);
            // Changing store currency also resets bank fields — the bank
            // list depends on the country the new currency settles to.
            setBankCode("");
            setAccountNumber("");
            setAccountName("");
          }}
          hint="What your buyers pay in."
        />

        <ToggleRow
          label="Bill me in the same currency as my store"
          description="Turn this off to be billed a Boutique/Pro subscription in a different currency."
          checked={syncCurrencies}
          onChange={setSyncCurrencies}
        />

        {!syncCurrencies ? (
          <CurrencySelect
            id="billing-currency"
            label="Billing currency"
            value={billingCurrency}
            onChange={setBillingCurrency}
            hint="What your subscription (on paid plans) is charged in."
          />
        ) : null}

        <BankAccountPicker
          bankCountry={bankCountry}
          bankCode={bankCode}
          onBankCodeChange={setBankCode}
          accountNumber={accountNumber}
          onAccountNumberChange={setAccountNumber}
          accountName={accountName}
          onAccountNameChange={setAccountName}
          disabled={loading}
        />

        {error ? (
          <p className="text-[13px] text-red-600 dark:text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <p className="text-[13px] text-muted">
          Paystack pays your share of every sale straight to this account —
          typically within a business day. Salesy never holds your funds.
        </p>

        <SubmitButton loading={loading}>Finish setup</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function PayoutPageClient() {
  return (
    <AuthGate allow={["pendingPayout"]} require={{ hasUser: true }}>
      <PayoutForm />
    </AuthGate>
  );
}
