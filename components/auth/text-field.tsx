"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
} from "@/components/auth/styles";

type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      name,
      type = "text",
      autoComplete,
      placeholder,
      hint,
      error,
      disabled,
      readOnly,
      value,
      onChange,
      onBlur,
      className,
    },
    ref,
  ) {
    const id = name;
    return (
      <div className={className}>
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={clsx(inputClass, readOnly && "bg-surface")}
        />
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
