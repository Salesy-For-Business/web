"use client";

import { fieldHintClass, fieldLabelClass, inputClass } from "@/components/auth/styles";
import { CURRENCIES, type BusinessCurrency } from "@/lib/currencies";

export function CurrencySelect({
  id,
  label,
  value,
  onChange,
  hint,
  disabled,
}: {
  id: string;
  label: string;
  value: BusinessCurrency;
  onChange: (value: BusinessCurrency) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <select
        id={id}
        className={inputClass}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as BusinessCurrency)}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code} — {c.name}
          </option>
        ))}
      </select>
      {hint ? <p className={fieldHintClass}>{hint}</p> : null}
    </div>
  );
}
