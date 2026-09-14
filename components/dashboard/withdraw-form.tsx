"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { PayoutPinSetup } from "@/components/dashboard/payout-pin";
import { formatNaira } from "@/lib/dashboard";
import { demoAvailableBalance } from "@/lib/dashboard-demo";
import type { Bank } from "@/lib/banks";
import {
  delayMs,
  isValidPayoutPin,
  PAYOUT_PIN_LENGTH,
  useAuthStore,
} from "@/lib/auth-store";

type ResolveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "resolved"; accountName: string }
  | { status: "error"; message: string };

export function WithdrawForm() {
  const payoutPin = useAuthStore((s) => s.payoutPin);
  const verifyPayoutPin = useAuthStore((s) => s.verifyPayoutPin);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [bankQuery, setBankQuery] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [resolve, setResolve] = useState<ResolveState>({ status: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resolveSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBanksLoading(true);
      setBanksError(null);
      try {
        const res = await fetch("/api/banks");
        if (!res.ok) throw new Error("Failed to load banks");
        const json = (await res.json()) as { banks: Bank[] };
        if (!cancelled) setBanks(json.banks ?? []);
      } catch {
        if (!cancelled) {
          setBanksError("Could not load supported banks. Refresh and try again.");
        }
      } finally {
        if (!cancelled) setBanksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBank = banks.find((b) => b.code === bankCode);
  const filteredBanks = bankQuery.trim()
    ? banks.filter((b) =>
        b.name.toLowerCase().includes(bankQuery.trim().toLowerCase()),
      )
    : banks;

  useEffect(() => {
    const digits = account.replace(/\D/g, "");
    if (!bankCode || digits.length !== 10) {
      setResolve({ status: "idle" });
      return;
    }

    const seq = ++resolveSeq.current;
    setResolve({ status: "loading" });
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          accountNumber: digits,
          bankCode,
        });
        const res = await fetch(`/api/banks/resolve?${params}`);
        const json = (await res.json()) as {
          accountName?: string;
          error?: string;
        };
        if (seq !== resolveSeq.current) return;
        if (!res.ok || !json.accountName) {
          setResolve({
            status: "error",
            message: json.error || "Could not resolve this account.",
          });
          return;
        }
        setResolve({ status: "resolved", accountName: json.accountName });
      } catch {
        if (seq !== resolveSeq.current) return;
        setResolve({
          status: "error",
          message: "Account lookup failed. Try again.",
        });
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [account, bankCode]);

  if (!payoutPin) {
    return (
      <PayoutPinSetup
        title="Set a payout PIN to withdraw"
        description={`For security, create a ${PAYOUT_PIN_LENGTH}-digit transaction PIN before sending money to your bank. You’ll confirm it on every withdrawal.`}
      />
    );
  }

  async function withdraw(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const value = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount to withdraw.");
      return;
    }
    if (value > demoAvailableBalance) {
      setError(`You can withdraw up to ${formatNaira(demoAvailableBalance)}.`);
      return;
    }
    if (!bankCode || !selectedBank) {
      setError("Select a bank from the supported list.");
      return;
    }
    const digits = account.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit account number.");
      return;
    }
    if (resolve.status !== "resolved") {
      setError("Wait for the account name to resolve before withdrawing.");
      return;
    }
    const pinCheck = verifyPayoutPin(pin);
    if (!pinCheck.ok) {
      setError(pinCheck.error);
      return;
    }

    setLoading(true);
    await delayMs();
    setLoading(false);
    setSuccess(
      `Withdrawal of ${formatNaira(value)} to ${resolve.accountName} (${selectedBank.name} ···${digits.slice(-4)}) is on the way (demo).`,
    );
    setAmount("");
    setPin("");
  }

  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h2 className="text-[20px] leading-7">Withdraw earnings</h2>
      <p className="mt-2 text-[14px] text-muted">
        Choose a supported bank, enter the account number, confirm the resolved
        name, then authorize with your payout PIN.
      </p>

      <form className="mt-5 flex flex-col gap-4" onSubmit={withdraw} noValidate>
        <div>
          <label htmlFor="amount" className={fieldLabelClass}>
            Amount (₦)
          </label>
          <input
            id="amount"
            inputMode="decimal"
            className={inputClass}
            placeholder="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="bank-search" className={fieldLabelClass}>
            Bank
          </label>
          <input
            id="bank-search"
            className={inputClass}
            placeholder="Search banks…"
            value={bankQuery}
            onChange={(e) => setBankQuery(e.target.value)}
            disabled={banksLoading}
            autoComplete="off"
          />
          <select
            id="bank"
            className={clsx(inputClass, "mt-2")}
            value={bankCode}
            onChange={(e) => {
              setBankCode(e.target.value);
              setResolve({ status: "idle" });
            }}
            disabled={banksLoading || !!banksError}
            aria-label="Select bank"
          >
            <option value="">
              {banksLoading ? "Loading banks…" : "Select a bank"}
            </option>
            {filteredBanks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
          {banksError ? (
            <p className={fieldErrorClass} role="alert">
              {banksError}
            </p>
          ) : (
            <p className={fieldHintClass}>
              Banks load from our supported payouts list.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="account" className={fieldLabelClass}>
            Account number
          </label>
          <input
            id="account"
            inputMode="numeric"
            className={inputClass}
            placeholder="0123456789"
            maxLength={10}
            value={account}
            onChange={(e) =>
              setAccount(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            disabled={!bankCode}
          />
          {!bankCode ? (
            <p className={fieldHintClass}>Select a bank first.</p>
          ) : account.replace(/\D/g, "").length < 10 ? (
            <p className={fieldHintClass}>
              Enter all 10 digits to resolve the account name.
            </p>
          ) : null}
        </div>

        <div
          className={clsx(
            "rounded-lg border px-4 py-3 text-[14px]",
            resolve.status === "resolved"
              ? "border-green-600/30 bg-green-50 text-heading dark:bg-green-950/30"
              : resolve.status === "error"
                ? "border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                : "border-border bg-surface text-muted",
          )}
          aria-live="polite"
        >
          {resolve.status === "idle" ? (
            "Account name will appear here after lookup."
          ) : resolve.status === "loading" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Resolving account…
            </span>
          ) : resolve.status === "resolved" ? (
            <span className="inline-flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-green-700 dark:text-green-500"
                aria-hidden
              />
              <span>
                <span className="block text-[12px] font-medium uppercase tracking-wide text-muted">
                  Account name
                </span>
                <span className="font-medium tracking-wide">
                  {resolve.accountName}
                </span>
              </span>
            </span>
          ) : (
            resolve.message
          )}
        </div>

        <div>
          <label htmlFor="payout-pin" className={fieldLabelClass}>
            Payout PIN
          </label>
          <input
            id="payout-pin"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={PAYOUT_PIN_LENGTH}
            className={inputClass}
            placeholder={"•".repeat(PAYOUT_PIN_LENGTH)}
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, PAYOUT_PIN_LENGTH))
            }
          />
          <p className={fieldHintClass}>
            Manage your PIN in{" "}
            <Link href="/dashboard/settings" className="text-link underline-offset-2 hover:underline">
              Settings
            </Link>
            .
          </p>
        </div>

        {error ? (
          <p className={fieldErrorClass} role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-[13px] text-green-700 dark:text-green-500" role="status">
            {success}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={
              loading ||
              resolve.status !== "resolved" ||
              !isValidPayoutPin(pin)
            }
            className={clsx(primaryButtonClass, "w-auto min-w-40 px-6")}
          >
            {loading ? "Sending…" : "Withdraw now"}
          </button>
          <Link
            href="/dashboard"
            className={clsx(secondaryButtonClass, "w-auto px-5")}
          >
            Back to overview
          </Link>
        </div>
      </form>
    </section>
  );
}
