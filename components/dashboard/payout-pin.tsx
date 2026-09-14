"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
} from "@/components/auth/styles";
import {
  delayMs,
  isValidPayoutPin,
  PAYOUT_PIN_LENGTH,
  useAuthStore,
} from "@/lib/auth-store";

type PayoutPinSetupProps = {
  title?: string;
  description?: string;
  onComplete?: () => void;
  className?: string;
};

export function PayoutPinSetup({
  title = "Create payout PIN",
  description = `Choose a ${PAYOUT_PIN_LENGTH}-digit PIN. You’ll enter it every time you withdraw.`,
  onComplete,
  className,
}: PayoutPinSetupProps) {
  const setPayoutPin = useAuthStore((s) => s.setPayoutPin);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    await delayMs(400);
    const result = setPayoutPin(pin, confirm);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPin("");
    setConfirm("");
    onComplete?.();
  }

  return (
    <section
      className={clsx(
        "rounded-xl border border-border bg-background p-6",
        className,
      )}
    >
      <h2 className="text-[20px] leading-7">{title}</h2>
      <p className="mt-2 text-[14px] leading-5 text-muted">{description}</p>
      <form className="mt-5 flex max-w-sm flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="new-payout-pin" className={fieldLabelClass}>
            New PIN
          </label>
          <input
            id="new-payout-pin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={PAYOUT_PIN_LENGTH}
            className={inputClass}
            placeholder={"•".repeat(PAYOUT_PIN_LENGTH)}
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, PAYOUT_PIN_LENGTH))
            }
          />
        </div>
        <div>
          <label htmlFor="confirm-payout-pin" className={fieldLabelClass}>
            Confirm PIN
          </label>
          <input
            id="confirm-payout-pin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={PAYOUT_PIN_LENGTH}
            className={inputClass}
            placeholder={"•".repeat(PAYOUT_PIN_LENGTH)}
            value={confirm}
            onChange={(e) =>
              setConfirm(
                e.target.value.replace(/\D/g, "").slice(0, PAYOUT_PIN_LENGTH),
              )
            }
          />
        </div>
        {error ? (
          <p className={fieldErrorClass} role="alert">
            {error}
          </p>
        ) : (
          <p className={fieldHintClass}>
            Don’t share this PIN. Salesy never asks for it outside payouts.
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !isValidPayoutPin(pin) || !isValidPayoutPin(confirm)}
          className={clsx(primaryButtonClass, "w-auto min-w-40 px-6")}
        >
          {loading ? "Saving…" : "Save PIN"}
        </button>
      </form>
    </section>
  );
}

type PayoutPinChangeProps = {
  className?: string;
};

export function PayoutPinChange({ className }: PayoutPinChangeProps) {
  const changePayoutPin = useAuthStore((s) => s.changePayoutPin);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    await delayMs(400);
    const result = changePayoutPin(current, next, confirm);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setSuccess("Payout PIN updated.");
  }

  return (
    <section
      className={clsx(
        "rounded-xl border border-border bg-background p-6",
        className,
      )}
    >
      <h2 className="text-[18px] leading-7">Change payout PIN</h2>
      <p className="mt-2 text-[14px] text-muted">
        Enter your current PIN, then choose a new {PAYOUT_PIN_LENGTH}-digit PIN.
      </p>
      <form className="mt-5 flex max-w-sm flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="current-payout-pin" className={fieldLabelClass}>
            Current PIN
          </label>
          <input
            id="current-payout-pin"
            type="password"
            inputMode="numeric"
            maxLength={PAYOUT_PIN_LENGTH}
            className={inputClass}
            value={current}
            onChange={(e) =>
              setCurrent(
                e.target.value.replace(/\D/g, "").slice(0, PAYOUT_PIN_LENGTH),
              )
            }
          />
        </div>
        <div>
          <label htmlFor="next-payout-pin" className={fieldLabelClass}>
            New PIN
          </label>
          <input
            id="next-payout-pin"
            type="password"
            inputMode="numeric"
            maxLength={PAYOUT_PIN_LENGTH}
            className={inputClass}
            value={next}
            onChange={(e) =>
              setNext(e.target.value.replace(/\D/g, "").slice(0, PAYOUT_PIN_LENGTH))
            }
          />
        </div>
        <div>
          <label htmlFor="confirm-next-payout-pin" className={fieldLabelClass}>
            Confirm new PIN
          </label>
          <input
            id="confirm-next-payout-pin"
            type="password"
            inputMode="numeric"
            maxLength={PAYOUT_PIN_LENGTH}
            className={inputClass}
            value={confirm}
            onChange={(e) =>
              setConfirm(
                e.target.value.replace(/\D/g, "").slice(0, PAYOUT_PIN_LENGTH),
              )
            }
          />
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
        <button
          type="submit"
          disabled={loading}
          className={clsx(primaryButtonClass, "w-auto min-w-40 px-6")}
        >
          {loading ? "Updating…" : "Update PIN"}
        </button>
      </form>
    </section>
  );
}
