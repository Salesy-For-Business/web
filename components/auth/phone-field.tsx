"use client";

import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/auth/styles";

type PhoneFieldProps = {
  label: string;
  name: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
};

export function PhoneField({
  label,
  name,
  autoComplete = "tel",
  placeholder = "801 234 5678",
  hint = "Nigerian number. +234 is added for you.",
  error,
  disabled,
  value,
  onChange,
  onBlur,
  className,
}: PhoneFieldProps) {
  const id = name;

  return (
    <div className={className}>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <div className="flex">
        <span className="inline-flex h-12 items-center rounded-l-lg border border-r-0 border-border bg-surface px-3 text-[14px] text-muted">
          +234
        </span>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={clsx(inputClass, "rounded-l-none")}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={fieldHintClass}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
