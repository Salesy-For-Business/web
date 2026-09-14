"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import clsx from "clsx";
import { fieldErrorClass, fieldHintClass, fieldLabelClass } from "@/components/auth/styles";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type FileDropzoneProps = {
  label?: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  error?: string;
  hint?: string;
};

export function FileDropzone({
  label = "Business logo",
  value,
  onChange,
  error,
  hint = "Optional. PNG, JPG, or WebP up to 2 MB.",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function readFile(file: File) {
    setLocalError(null);
    if (!ACCEPT.includes(file.type)) {
      setLocalError("Use a PNG, JPG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Keep the logo under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void readFile(file);
  }

  const message = error || localError;

  return (
    <div>
      <p className={fieldLabelClass}>{label}</p>
      {value ? (
        <div className="relative flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Business logo preview"
            className="size-16 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-heading">Logo added</p>
            <p className="text-[13px] text-muted">Looks good on your storefront.</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-background hover:text-heading"
            aria-label="Remove logo"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={clsx(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center transition-colors",
            dragOver
              ? "border-primary bg-tonal text-link"
              : "border-border bg-surface text-muted hover:border-primary/60 hover:bg-tonal/50",
          )}
        >
          <ImagePlus className="size-6" aria-hidden />
          <span className="text-[14px] font-medium text-heading">
            Drag and drop, or click to upload
          </span>
          <span className="text-[13px]">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void readFile(file);
          e.target.value = "";
        }}
      />
      {message ? (
        <p className={fieldErrorClass} role="alert">
          {message}
        </p>
      ) : !value ? (
        <p className={fieldHintClass}>{hint}</p>
      ) : null}
    </div>
  );
}
