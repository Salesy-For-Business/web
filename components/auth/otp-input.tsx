"use client";

import { useRef } from "react";
import clsx from "clsx";
import { fieldErrorClass, fieldHintClass } from "@/components/auth/styles";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  length?: number;
};

export function OtpInput({
  value,
  onChange,
  onBlur,
  error,
  hint = "Demo code: 123456",
  disabled,
  length = 6,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, length));
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, length - index).split("");
      const next = digits.slice();
      chars.forEach((c, offset) => {
        next[index + offset] = c;
      });
      onChange(next.join("").slice(0, length));
      const focusAt = Math.min(index + chars.length, length - 1);
      refs.current[focusAt]?.focus();
      return;
    }

    setDigit(index, cleaned);
    if (index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <div>
      <div className="flex justify-between gap-2" role="group" aria-label="Verification code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={length}
            disabled={disabled}
            value={digit}
            aria-invalid={error ? true : undefined}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onBlur={onBlur}
            className={clsx(
              "h-12 w-full max-w-12 rounded-lg border border-border bg-background text-center text-[18px] font-medium text-heading",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
              "aria-invalid:border-red-500",
            )}
          />
        ))}
      </div>
      {error ? (
        <p className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={fieldHintClass}>{hint}</p>
      ) : null}
    </div>
  );
}
