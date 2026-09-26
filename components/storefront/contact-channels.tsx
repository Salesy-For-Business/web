"use client";

import { Phone, Mail, type LucideIcon } from "lucide-react";
import { siWhatsapp, siTelegram, siGmail } from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "@/components/storefront/brand-icon";
import { useStorefront } from "@/components/storefront/store-context";

const channelClass =
  "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] font-medium text-heading transition hover:border-primary/40 hover:bg-tonal hover:text-link";

type ChannelIcon =
  | { kind: "simple"; icon: SimpleIcon }
  | { kind: "lucide"; icon: LucideIcon };

const emailIcon: ChannelIcon = siGmail
  ? { kind: "simple", icon: siGmail }
  : { kind: "lucide", icon: Mail };

function ChannelGlyph({
  icon,
  className,
}: {
  icon: ChannelIcon;
  className?: string;
}) {
  if (icon.kind === "simple") {
    return <BrandIcon icon={icon.icon} branded className={className} />;
  }
  const Lucide = icon.icon;
  return <Lucide className={className} aria-hidden />;
}

export function ContactChannels({
  compact = false,
}: {
  compact?: boolean;
}) {
  const store = useStorefront();
  const { whatsapp, telegram, email, phone } = store.contact;

  const channels: {
    key: string;
    label: string;
    href: string;
    icon: ChannelIcon;
  }[] = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi ${store.businessName}, I have a question about an order.`)}`,
      icon: { kind: "simple", icon: siWhatsapp },
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/${telegram}`,
      icon: { kind: "simple", icon: siTelegram },
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:${email}?subject=${encodeURIComponent(`${store.businessName} enquiry`)}`,
      icon: emailIcon,
    },
    {
      key: "phone",
      label: "Call",
      href: `tel:${phone.replace(/\s/g, "")}`,
      icon: { kind: "lucide", icon: Phone },
    },
  ];

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
      <div
        className={compact ? "flex flex-wrap gap-2" : "mt-4 flex flex-wrap gap-2"}
      >
        {channels.map(({ key, label, href, icon }) => (
          <a
            key={key}
            href={href}
            target={key === "phone" || key === "email" ? undefined : "_blank"}
            rel={key === "phone" || key === "email" ? undefined : "noreferrer"}
            className={channelClass}
          >
            <ChannelGlyph icon={icon} className="size-4 shrink-0" />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
