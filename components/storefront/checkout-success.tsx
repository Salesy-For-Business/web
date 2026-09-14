"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { ContactChannels } from "@/components/storefront/contact-channels";
import { useStorefront } from "@/components/storefront/store-context";
import { primaryButtonClass, secondaryButtonClass } from "@/components/auth/styles";
import { storePath } from "@/lib/storefront";

const payLabels: Record<string, string> = {
  card: "Card",
  transfer: "Bank transfer",
  ussd: "USSD",
};

export function CheckoutSuccess() {
  const store = useStorefront();
  const params = useSearchParams();
  const order = params.get("order") ?? "ORD-0000";
  const pay = params.get("pay") ?? "card";

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-500">
        <CheckCircle2 className="size-8" aria-hidden />
      </div>
      <h1 className="mt-5 font-display text-[32px] tracking-tight text-heading">
        Order placed
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        Thanks for shopping at {store.businessName}. Your order{" "}
        <span className="font-medium text-heading">{order}</span> is confirmed
        (demo). Payment method: {payLabels[pay] ?? pay}.
      </p>
      <p className="mt-2 text-[14px] text-muted">
        The store gets an alert on WhatsApp, Telegram, and email.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={storePath(store.handle)}
          className={clsx(primaryButtonClass, "w-auto px-6")}
        >
          Back to store
        </Link>
        <Link
          href={storePath(store.handle, "/cart")}
          className={clsx(secondaryButtonClass, "w-auto px-5")}
        >
          View cart
        </Link>
      </div>
      <div className="mt-10 text-left">
        <ContactChannels />
      </div>
    </div>
  );
}
