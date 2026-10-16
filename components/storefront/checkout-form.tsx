"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { toast } from "sonner";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import { SearchableSelect } from "@/components/searchable-select";
import { useStorefront } from "@/components/storefront/store-context";
import { useCartStore } from "@/lib/cart-store";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import { formatMoney, storePath } from "@/lib/storefront";

export function CheckoutForm() {
  const store = useStorefront();
  const router = useRouter();
  const hydrated = useCartStore((s) => s.hydrated);
  const lines = useCartStore((s) => s.lines);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  const [phone, setPhone] = useState("");
  const [isWhatsApp, setIsWhatsApp] = useState(false);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const countryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const loc of store.deliveryLocations) {
      if (!seen.has(loc.country)) seen.set(loc.country, loc.countryName);
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [store.deliveryLocations]);

  const stateOptions = useMemo(() => {
    return store.deliveryLocations
      .filter((loc) => loc.country === country)
      .map((loc) => ({ value: loc.state, label: loc.stateName }));
  }, [store.deliveryLocations, country]);

  useEffect(() => {
    if (hydrated && lines.length === 0) {
      router.replace(storePath(store.handle, "/cart"));
    }
  }, [hydrated, lines.length, router, store.handle]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid phone number.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email for payment receipts.");
      return;
    }
    const selectedState = stateOptions.find((s) => s.value === state);
    const selectedCountry = countryOptions.find((c) => c.value === country);
    if (!selectedCountry || !selectedState) {
      setError("Select a delivery location.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<
        ApiOk<{ authorizationUrl: string; reference: string }>
      >("/checkout/initialize", {
        storeHandle: store.handle,
        method: "transfer",
        customer: {
          email: email.trim(),
          phone: phone.trim(),
          isWhatsApp,
        },
        deliveryLocation: {
          country: selectedCountry.value,
          countryName: selectedCountry.label,
          state: selectedState.value,
          stateName: selectedState.label,
        },
        notes: notes.trim() || undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          qty: l.qty,
        })),
      });

      window.location.href = data.authorizationUrl;
    } catch (err) {
      const message = getApiError(err, "Could not start payment.");
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  if (!hydrated || lines.length === 0) {
    return (
      <p className="text-[14px] text-muted" aria-live="polite">
        Preparing checkout…
      </p>
    );
  }

  if (!store.acceptsPayments) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <h1 className="font-display text-[24px] tracking-tight text-heading">
          This store isn’t accepting orders yet
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          {store.businessName} hasn’t finished payout setup. Check back soon.
        </p>
        <Link
          href={storePath(store.handle)}
          className={clsx(secondaryButtonClass, "mt-5 w-auto px-5")}
        >
          Back to store
        </Link>
      </div>
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
            Guest checkout — no account needed. Pay by bank transfer.
          </p>
        </div>

        <fieldset className="space-y-4 rounded-xl border border-border bg-background p-5">
          <legend className="px-1 text-[15px] font-medium text-heading">
            Your details
          </legend>
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
              <label className="mt-2 flex items-center gap-2 text-[13px] text-muted">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={isWhatsApp}
                  onChange={(e) => setIsWhatsApp(e.target.checked)}
                />
                This is my WhatsApp number
              </label>
            </div>
            <div>
              <label htmlFor="buyer-email" className={fieldLabelClass}>
                Email
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
          {store.deliveryLocations.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SearchableSelect
                id="buyer-country"
                label="Delivery country"
                placeholder="Select country"
                options={countryOptions}
                value={country}
                onChange={(value) => {
                  setCountry(value);
                  setState("");
                }}
              />
              <SearchableSelect
                id="buyer-state"
                label="Delivery state"
                placeholder={country ? "Select state" : "Select a country first"}
                options={stateOptions}
                value={state}
                onChange={setState}
                disabled={!country}
              />
            </div>
          ) : (
            <p className={fieldHintClass}>
              {store.businessName} hasn’t set up delivery locations yet.
              Contact them at {store.contact.email || store.contact.phone}{" "}
              before ordering.
            </p>
          )}
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

        {error ? (
          <p className={fieldErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || store.deliveryLocations.length === 0}
            className={clsx(primaryButtonClass, "w-auto min-w-48 px-6")}
          >
            {loading ? "Redirecting…" : `Pay ${formatMoney(subtotal, store.currency)}`}
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
                {formatMoney(line.price * line.qty, store.currency)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-border pt-4 text-[16px] font-medium text-heading">
          <span>Total</span>
          <span>{formatMoney(subtotal, store.currency)}</span>
        </p>
      </aside>
    </div>
  );
}
