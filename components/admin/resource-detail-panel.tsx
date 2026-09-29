"use client";

import clsx from "clsx";
import { Loader2, Trash2 } from "lucide-react";
import {
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { Select } from "@/components/ui/select";

export type ResourceFieldValue = string | number | boolean | null;

export type ResourceField = {
  key: string;
  label: string;
  type: "text" | "number" | "checkbox" | "select" | "readonly";
  options?: { value: string; label: string }[];
  /** Formats readonly values for display. */
  format?: (value: ResourceFieldValue | null | undefined) => React.ReactNode;
};

export function ResourceDetailPanel({
  title,
  fields,
  values,
  onChange,
  onSave,
  onDelete,
  saving,
  deleting,
  deleteLabel = "Delete",
  deleteConfirm = "Delete this? This can’t be undone.",
}: {
  title: string;
  fields: ResourceField[];
  values: Record<string, ResourceFieldValue | null | undefined>;
  onChange: (key: string, value: ResourceFieldValue) => void;
  onSave: () => void;
  onDelete?: () => void;
  saving?: boolean;
  deleting?: boolean;
  deleteLabel?: string;
  deleteConfirm?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 sm:p-6">
      <h2 className="text-[17px] leading-7 text-heading">{title}</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const value = values[field.key];
          const fieldId = `field-${field.key}`;
          if (field.type === "readonly") {
            return (
              <div key={field.key} className="min-w-0">
                <p className={fieldLabelClass}>{field.label}</p>
                <p className="break-words rounded-lg bg-surface px-3 py-2.5 text-[14px] text-heading">
                  {field.format
                    ? field.format(value)
                    : value == null || value === ""
                      ? "—"
                      : typeof value === "boolean"
                        ? value
                          ? "Yes"
                          : "No"
                        : String(value)}
                </p>
              </div>
            );
          }
          if (field.type === "checkbox") {
            return (
              <label
                key={field.key}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-[14px] text-heading sm:mt-7 sm:self-start"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(field.key, e.target.checked)}
                />
                {field.label}
              </label>
            );
          }
          if (field.type === "select") {
            return (
              <Select
                key={field.key}
                id={fieldId}
                label={field.label}
                value={String(value ?? "")}
                options={field.options ?? []}
                onChange={(next) => onChange(field.key, next)}
              />
            );
          }
          return (
            <div key={field.key}>
              <label htmlFor={fieldId} className={fieldLabelClass}>
                {field.label}
              </label>
              <input
                id={fieldId}
                type={field.type === "number" ? "number" : "text"}
                className={inputClass}
                value={value == null ? "" : String(value)}
                onChange={(e) =>
                  onChange(
                    field.key,
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
        {onDelete ? (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (window.confirm(deleteConfirm)) onDelete();
            }}
            className={clsx(
              secondaryButtonClass,
              "gap-2 px-5 text-red-600 sm:order-2 sm:w-auto",
            )}
          >
            <Trash2 className="size-3.5" aria-hidden />
            {deleteLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className={clsx(primaryButtonClass, "px-5 sm:order-1 sm:w-auto sm:min-w-32")}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save changes
        </button>
      </div>
    </div>
  );
}
