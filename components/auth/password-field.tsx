"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/auth/styles";

type PasswordFieldProps = {
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

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    {
      label,
      name,
      autoComplete,
      placeholder = "••••••••",
      hint,
      error,
      disabled,
      value,
      onChange,
      onBlur,
      className,
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const id = name;

    return (
      <div className={className}>
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={name}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            className={clsx(inputClass, "pr-12")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-heading"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
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
  },
);
