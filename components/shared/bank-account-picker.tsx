"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/auth/styles";
import { SearchableSelect } from "@/components/searchable-select";
import type { Bank } from "@/lib/banks";

type ResolveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "resolved"; accountName: string }
  | { status: "error"; message: string };

/**
 * Bank + account-number + account-holder-name picker, shared between the
 * signup payout step and (once bank details exist) the read-only payout
 * settings view. Extracted from what used to be `withdraw-form.tsx`'s
 * bank-search/resolve UI — parameterized by `bankCountry` since Paystack's
 * live account-name resolution only covers Nigerian NUBAN accounts; other
 * countries fall back to a plain "account holder name" field.
 */
export function BankAccountPicker({
  bankCountry,
  bankCode,
  onBankCodeChange,
  accountNumber,
  onAccountNumberChange,
  accountName,
  onAccountNameChange,
  disabled,
}: {
  bankCountry: string;
  bankCode: string;
  onBankCodeChange: (code: string) => void;
  accountNumber: string;
  onAccountNumberChange: (value: string) => void;
  accountName: string;
  onAccountNameChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [resolve, setResolve] = useState<ResolveState>({ status: "idle" });
  const resolveSeq = useRef(0);
  const canResolve = bankCountry === "NG";

  useEffect(() => {
    let cancelled = false;
    // Resetting bankCode/accountNumber/accountName when bankCountry changes
    // is the caller's job (it's the one that changed the currency that
    // drives bankCountry) — this effect only fetches, it doesn't reset.
    (async () => {
      setBanksLoading(true);
      setBanksError(null);
      try {
        const res = await fetch(`/api/banks?country=${bankCountry}`);
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
  }, [bankCountry]);

  // NG only: live-resolve the account holder name as the user types. The
  // "not ready yet" case resets `resolve` to idle from the actual input
  // handlers below (handleAccountNumberChange, bank picker onChange) —
  // not here — so this effect only ever kicks off the debounced fetch.
  useEffect(() => {
    if (!canResolve) return;
    const digits = accountNumber.replace(/\D/g, "");
    if (!bankCode || digits.length !== 10) return;

    const seq = ++resolveSeq.current;
    const timer = window.setTimeout(async () => {
      setResolve({ status: "loading" });
      try {
        const params = new URLSearchParams({
          accountNumber: digits,
          bankCode,
          country: bankCountry,
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
        onAccountNameChange(json.accountName);
      } catch {
        if (seq !== resolveSeq.current) return;
        setResolve({
          status: "error",
          message: "Account lookup failed. Try again.",
        });
      }
    }, 450);

    return () => window.clearTimeout(timer);
    // onAccountNameChange is a setter from the parent; omitting it avoids
    // re-running this effect if the parent ever redefines it inline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNumber, bankCode, bankCountry, canResolve]);

  function handleAccountNumberChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, canResolve ? 10 : 20);
    onAccountNumberChange(digits);
    if (canResolve && digits.length !== 10) {
      setResolve({ status: "idle" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchableSelect
        id="bank"
        label="Bank"
        options={banks.map((bank) => ({ value: bank.code, label: bank.name }))}
        value={bankCode}
        onChange={(next) => {
          onBankCodeChange(next);
          setResolve({ status: "idle" });
        }}
        placeholder="Select a bank"
        searchPlaceholder="Search banks…"
        loading={banksLoading}
        loadingMessage="Loading banks…"
        disabled={disabled || !!banksError}
        error={banksError ?? undefined}
        hint={banksError ? undefined : "Banks load from Paystack's supported list."}
      />

      <div>
        <label htmlFor="bank-account-number" className={fieldLabelClass}>
          Account number
        </label>
        <input
          id="bank-account-number"
          inputMode="numeric"
          className={inputClass}
          placeholder="0123456789"
          maxLength={canResolve ? 10 : 20}
          value={accountNumber}
          onChange={(e) => handleAccountNumberChange(e.target.value)}
          disabled={disabled || !bankCode}
        />
        {!bankCode ? (
          <p className={fieldHintClass}>Select a bank first.</p>
        ) : canResolve && accountNumber.length < 10 ? (
          <p className={fieldHintClass}>
            Enter all 10 digits to resolve the account name.
          </p>
        ) : null}
      </div>

      {canResolve ? (
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
                <span className="font-medium tracking-wide">{accountName}</span>
              </span>
            </span>
          ) : (
            resolve.message
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="bank-account-name" className={fieldLabelClass}>
            Account holder name
          </label>
          <input
            id="bank-account-name"
            className={inputClass}
            placeholder="As it appears on your bank account"
            value={accountName}
            onChange={(e) => onAccountNameChange(e.target.value)}
            disabled={disabled || !bankCode}
          />
          <p className={fieldHintClass}>
            We can’t verify this automatically outside Nigeria yet —
            double-check it matches your bank account exactly.
          </p>
        </div>
      )}
    </div>
  );
}

export function isAccountReady(
  bankCountry: string,
  bankCode: string,
  accountNumber: string,
  accountName: string,
) {
  if (!bankCode || !accountName.trim()) return false;
  if (bankCountry === "NG") return accountNumber.replace(/\D/g, "").length === 10;
  return accountNumber.trim().length >= 4;
}
