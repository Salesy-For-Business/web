"use client";

import {
  MessageCircle,
  Send,
  Mail,
  Phone,
} from "lucide-react";
import { useStorefront } from "@/components/storefront/store-context";

const channelClass =
  "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] font-medium text-heading transition hover:border-primary/40 hover:bg-tonal hover:text-link";

export function ContactChannels({
  compact = false,
}: {
  compact?: boolean;
}) {
  const store = useStorefront();
  const { whatsapp, telegram, email, phone } = store.contact;

  const channels = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi ${store.businessName}, I have a question about an order.`)}`,
      icon: MessageCircle,
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/${telegram}`,
      icon: Send,
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:${email}?subject=${encodeURIComponent(`${store.businessName} enquiry`)}`,
      icon: Mail,
    },
    {
      key: "phone",
      label: "Call",
      href: `tel:${phone.replace(/\s/g, "")}`,
      icon: Phone,
    },
  ] as const;

  return (
    <section
      className={
        compact
          ? ""
          : "rounded-xl border border-border bg-background p-5 sm:p-6"
      }
    >
      {!compact ? (
        <>
          <h2 className="font-display text-[20px] text-heading">
            Contact {store.businessName}
          </h2>
          <p className="mt-1 text-[14px] text-muted">
            Message the store owner on your preferred channel.
          </p>
        </>
      ) : null}
      <div className={compact ? "flex flex-wrap gap-2" : "mt-4 flex flex-wrap gap-2"}>
        {channels.map(({ key, label, href, icon: Icon }) => (
          <a
            key={key}
            href={href}
            target={key === "phone" || key === "email" ? undefined : "_blank"}
            rel={key === "phone" || key === "email" ? undefined : "noreferrer"}
            className={channelClass}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
