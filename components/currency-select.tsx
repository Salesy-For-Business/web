"use client";

import { Select } from "@/components/ui/select";
import { CURRENCIES, type BusinessCurrency } from "@/lib/currencies";

const OPTIONS = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.symbol} ${c.code} — ${c.name}`,
}));

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
    <Select<BusinessCurrency>
      id={id}
      label={label}
      options={OPTIONS}
      value={value}
      onChange={onChange}
      hint={hint}
      disabled={disabled}
    />
  );
}
