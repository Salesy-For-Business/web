"use client";

import { useEffect, useRef, useState } from "react";
import { Film, ImagePlus, X } from "lucide-react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
} from "@/components/auth/styles";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];

export type AdCreativeFile = {
  id: string;
  name: string;
  mime: string;
  size: number;
  /** Object URL for preview (revoke on remove / unmount). */
  previewUrl: string;
  kind: "image" | "video";
};

type AdCreativeDropzoneProps = {
  label?: string;
  files: AdCreativeFile[];
  onChange: (files: AdCreativeFile[]) => void;
  error?: string;
  hint?: string;
  maxFiles?: number;
};

function isAccepted(type: string) {
  return ACCEPT.includes(type);
}

function kindFor(type: string): "image" | "video" {
  return type.startsWith("video/") ? "video" : "image";
}

export function AdCreativeDropzone({
  label = "Ad creative",
  files,
  onChange,
  error,
  hint = "Images or short videos (MP4, WebM). Up to 25 MB each.",
  maxFiles = 6,
}: AdCreativeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      for (const f of filesRef.current) URL.revokeObjectURL(f.previewUrl);
    };
  }, []);

  function addFiles(fileList: FileList | File[]) {
    setLocalError(null);
    const incoming = Array.from(fileList);
    const next = [...files];

    for (const file of incoming) {
      if (next.length >= maxFiles) {
        setLocalError(`You can upload up to ${maxFiles} files.`);
        break;
      }
      if (!isAccepted(file.type)) {
        setLocalError("Use PNG, JPG, WebP, GIF, MP4, or WebM.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setLocalError("Keep each file under 25 MB.");
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        name: file.name,
        mime: file.type,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        kind: kindFor(file.type),
      });
    }

    onChange(next);
  }

  function removeAt(id: string) {
    const target = files.find((f) => f.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files);
    }
  }

  const message = error || localError;

  return (
    <div>
      <p className={fieldLabelClass}>{label}</p>

      {files.length > 0 ? (
        <ul className="mb-3 grid gap-3 sm:grid-cols-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="relative overflow-hidden rounded-lg border border-border bg-surface"
            >
              {file.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.previewUrl}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <video
                  src={file.previewUrl}
                  className="aspect-video w-full object-cover"
                  muted
                  playsInline
                  controls
                />
              )}
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <p className="min-w-0 truncate text-[12px] text-muted">
                  {file.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeAt(file.id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-background hover:text-heading"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {files.length < maxFiles ? (
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
          <span className="flex items-center gap-2 text-heading">
            <ImagePlus className="size-5" aria-hidden />
            <Film className="size-5" aria-hidden />
          </span>
          <span className="text-[14px] font-medium text-heading">
            Drag and drop, or click to upload
          </span>
          <span className="text-[13px]">{hint}</span>
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {message ? (
        <p className={fieldErrorClass} role="alert">
          {message}
        </p>
      ) : (
        <p className={fieldHintClass}>
          {hint}
          {files.length > 0 ? ` (${files.length}/${maxFiles})` : null}
        </p>
      )}
    </div>
  );
}
