"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import { useStorefront } from "@/components/storefront/store-context";
import { delayMs } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira, storePath } from "@/lib/storefront";

type PayMethod = "card" | "transfer" | "ussd";

const methods: { id: PayMethod; label: string; hint: string }[] = [
  { id: "card", label: "Card", hint: "Visa, Mastercard, Verve" },
  { id: "transfer", label: "Bank transfer", hint: "Pay into a virtual account" },
  { id: "ussd", label: "USSD", hint: "Dial a code from your phone" },
];

export function CheckoutForm() {
  const store = useStorefront();
  const router = useRouter();
  const hydrated = useCartStore((s) => s.hydrated);
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<PayMethod>("card");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && lines.length === 0) {
      router.replace(storePath(store.handle, "/cart"));
    }
  }, [hydrated, lines.length, router, store.handle]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }
    if (!address.trim()) {
      setError("Enter a delivery address or pickup note.");
      return;
    }

    setLoading(true);
    await delayMs(900);
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    clear();
    setLoading(false);
    router.push(
      `${storePath(store.handle, "/checkout/success")}?order=${orderId}&pay=${method}`,
    );
  }

  if (!hydrated || lines.length === 0) {
    return (
      <p className="text-[14px] text-muted" aria-live="polite">
        Preparing checkout…
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form
        className="flex flex-col gap-5 lg:col-span-3"
        onSubmit={onSubmit}
        noValidate
      >
        <div>
          <h1 className="font-display text-[28px] tracking-tight text-heading sm:text-[32px]">
            Checkout
          </h1>
          <p className="mt-2 text-[14px] text-muted">
            Guest checkout — no account needed. Pay by card, transfer, or USSD.
          </p>
        </div>

        <fieldset className="space-y-4 rounded-xl border border-border bg-background p-5">
          <legend className="px-1 text-[15px] font-medium text-heading">
            Your details
          </legend>
          <div>
            <label htmlFor="buyer-name" className={fieldLabelClass}>
              Full name
            </label>
            <input
              id="buyer-name"
              className={inputClass}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="buyer-phone" className={fieldLabelClass}>
                Phone
              </label>
              <input
                id="buyer-phone"
                className={inputClass}
                inputMode="tel"
                autoComplete="tel"
                placeholder="0801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="buyer-email" className={fieldLabelClass}>
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="buyer-email"
                type="email"
                className={inputClass}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="buyer-address" className={fieldLabelClass}>
              Delivery address / pickup
            </label>
            <textarea
              id="buyer-address"
              className={textareaClass}
              rows={3}
              placeholder="Street, area, city — or “Lagos Island pickup”"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="buyer-notes" className={fieldLabelClass}>
              Order notes{" "}
              <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="buyer-notes"
              className={clsx(textareaClass, "min-h-20")}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-border bg-background p-5">
          <legend className="px-1 text-[15px] font-medium text-heading">
            Payment method
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {methods.map((m) => (
              <label
                key={m.id}
                className={clsx(
                  "cursor-pointer rounded-lg border px-3 py-3 transition",
                  method === m.id
                    ? "border-primary bg-tonal"
                    : "border-border hover:bg-surface",
                )}
              >
                <input
                  type="radio"
                  name="pay"
                  className="sr-only"
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                />
                <span className="block text-[14px] font-medium text-heading">
                  {m.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted">
                  {m.hint}
                </span>
              </label>
            ))}
          </div>
          <p className={fieldHintClass}>
            Demo checkout — payment is simulated. No real charge.
          </p>
        </fieldset>

        {error ? (
          <p className={fieldErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className={clsx(primaryButtonClass, "w-auto min-w-48 px-6")}
          >
            {loading ? "Processing…" : `Pay ${formatNaira(subtotal)}`}
          </button>
          <Link
            href={storePath(store.handle, "/cart")}
            className={clsx(secondaryButtonClass, "w-auto px-5")}
          >
            Back to cart
          </Link>
        </div>
      </form>

      <aside className="h-fit rounded-xl border border-border bg-background p-5 lg:col-span-2 lg:sticky lg:top-24">
        <h2 className="text-[16px] font-medium text-heading">
          Order from {store.businessName}
        </h2>
        <ul className="mt-4 space-y-3">
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex justify-between gap-3 text-[14px]"
            >
              <span className="text-muted">
                {line.name} × {line.qty}
              </span>
              <span className="shrink-0 font-medium text-heading">
                {formatNaira(line.price * line.qty)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-border pt-4 text-[16px] font-medium text-heading">
          <span>Total</span>
          <span>{formatNaira(subtotal)}</span>
        </p>
      </aside>
    </div>
  );
}
