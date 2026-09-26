"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2, X as CloseIcon } from "lucide-react";
import {
  siFacebook,
  siInstagram,
  siTelegram,
  siWhatsapp,
  siX,
  type SimpleIcon,
} from "simple-icons";
import { toast } from "sonner";
import { BrandIcon } from "@/components/storefront/brand-icon";

type ShareTarget = {
  key: string;
  label: string;
  icon: SimpleIcon;
  /** Render the icon in its official brand color, or inherit text color
   * (used for X, whose brand color is pure black and disappears on a dark
   * surface in dark mode). */
  branded: boolean;
  action: (url: string, text: string) => void;
};

function openShareWindow(href: string) {
  window.open(href, "_blank", "noopener,noreferrer,width=600,height=650");
}

const targets: ShareTarget[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: siWhatsapp,
    branded: true,
    action: (url, text) =>
      openShareWindow(
        `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      ),
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: siFacebook,
    branded: true,
    action: (url) =>
      openShareWindow(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      ),
  },
  {
    key: "x",
    label: "X",
    icon: siX,
    branded: false,
    action: (url, text) =>
      openShareWindow(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      ),
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: siTelegram,
    branded: true,
    action: (url, text) =>
      openShareWindow(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      ),
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: siInstagram,
    branded: true,
    // Instagram has no web share intent for arbitrary links — the honest
    // fallback everyone uses is to copy the link for the user to paste into
    // a bio, DM, or story.
    action: (url) => {
      void navigator.clipboard.writeText(url);
      toast.message("Instagram doesn’t support direct links", {
        description: "Link copied — paste it into your bio, a DM, or a story.",
      });
    },
  },
];

export function ShareButton({
  url,
  text,
  className,
}: {
  /** Path-relative or absolute URL to share; resolved against the current
   * origin at share time if relative. */
  url: string;
  text: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function resolvedUrl() {
    if (/^https?:\/\//.test(url)) return url;
    return `${window.location.origin}${url}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolvedUrl());
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-label="Share this product"
      >
        <Share2 className="size-4" aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50">
            <motion.button
              type="button"
              aria-label="Close share menu"
              className="absolute inset-0 bg-heading/40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Share this product"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-2xl border border-border bg-background p-5 shadow-lg sm:max-w-sm sm:rounded-2xl sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[18px] text-heading">
                    Share
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-heading"
                    aria-label="Close"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="mt-4 flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left hover:border-primary/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted">
                    {copied ? (
                      <Check className="size-4 text-green-600 dark:text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-heading">
                      {copied ? "Link copied" : "Copy link"}
                    </span>
                    <span className="block truncate text-[12px] text-muted">
                      {resolvedUrl()}
                    </span>
                  </span>
                </button>

                <div className="mt-5 grid grid-cols-5 gap-1">
                  {targets.map((target) => (
                    <button
                      key={target.key}
                      type="button"
                      onClick={() => target.action(resolvedUrl(), text)}
                      className="flex flex-col items-center gap-1.5 rounded-lg py-2 text-[11px] font-medium text-muted hover:bg-surface hover:text-heading"
                    >
                      <span className="flex size-11 items-center justify-center rounded-full bg-surface">
                        <BrandIcon
                          icon={target.icon}
                          branded={target.branded}
                          className="size-5"
                        />
                      </span>
                      {target.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
