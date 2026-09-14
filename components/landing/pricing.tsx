"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

type Billing = "monthly" | "yearly";

const plans = [
  {
    id: "free",
    name: "Free",
    blurb: "Everything you need to start selling.",
    cta: "Start free",
    featured: false,
    badge: null,
    price: { monthly: 0, yearly: 0 },
    items: [
      "5 product listings",
      "Secure checkout",
      "Order alerts on WhatsApp, Telegram, and email",
      "Basic analytics",
      "Buyer reviews",
      "A salesy.link handle",
    ],
  },
  {
    id: "boutique",
    name: "Boutique",
    blurb: "For sellers who are in it for the long run.",
    cta: "Choose Boutique",
    featured: true,
    badge: "Popular",
    price: { monthly: 5000, yearly: 50000 },
    items: [
      "Unlimited listings",
      "Everything in Free",
      "Priority support",
      "Bulk CSV product upload",
      "CSV sales report export",
      "Remove Salesy branding",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "More visibility and reach for your shop.",
    cta: "Choose Pro",
    featured: false,
    badge: "Top plan",
    price: { monthly: 15000, yearly: 150000 },
    items: [
      "Everything in Boutique",
      "Store Status posts",
      "Product video",
      "Featured on the Status feed",
    ],
  },
] as const;

function formatNaira(amount: number) {
  return amount.toLocaleString("en-NG");
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const period = billing === "yearly" ? "year" : "month";

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-24 bg-surface-muted px-6 py-24 sm:px-10 lg:px-16"
      data-aos="fade-up"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
          Plans
        </p>
        <h2
          id="pricing-heading"
          className="mt-4 text-pretty text-[32px] leading-10 sm:text-[44px] sm:leading-[1.15]"
        >
          Start free. Step up when you are ready.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">
          Open a store at no cost. Move to Boutique or Pro when your catalog
          and reach need more room.
        </p>

        <div
          className="mx-auto mt-8 inline-flex rounded-full border border-border bg-background p-1"
          role="radiogroup"
          aria-label="Billing period"
        >
          {(
            [
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ] as const
          ).map((option) => {
            const selected = billing === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setBilling(option.value)}
                className={clsx(
                  "rounded-full px-5 py-2 text-[14px] font-medium",
                  selected
                    ? "bg-tonal text-link"
                    : "text-heading hover:bg-surface",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-4 lg:grid-cols-3 lg:items-stretch">
        {plans.map((plan) => {
          const isFree = plan.id === "free";
          const amount = isFree ? 0 : plan.price[billing];
          const unit = isFree ? "month" : period;

          return (
            <article
              key={plan.id}
              className={clsx(
                "flex flex-col rounded-xl border bg-background p-8 text-left",
                plan.featured
                  ? "border-primary shadow-[0_1px_2px_rgba(60,64,67,0.15),0_2px_6px_rgba(60,64,67,0.08)]"
                  : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[22px] leading-7 tracking-normal">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-[14px] leading-6 text-muted">
                    {plan.blurb}
                  </p>
                </div>
                {plan.badge ? (
                  <span
                    className={clsx(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none",
                      plan.featured
                        ? "bg-tonal text-link"
                        : "bg-surface-muted text-muted",
                    )}
                  >
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <p className="mt-8 flex items-baseline gap-1">
                <span className="font-[system-ui] text-4xl leading-none text-heading">
                  ₦{formatNaira(amount)}
                </span>
                <span className="text-[14px] text-muted">/{unit}</span>
              </p>
              {!isFree && billing === "monthly" ? (
                <p className="mt-2 min-h-5 text-[13px] text-muted">
                  or ₦{formatNaira(plan.price.yearly)} a year
                </p>
              ) : (
                <p className="mt-2 min-h-5 text-[13px] text-muted">{"\u00a0"}</p>
              )}

              <ul className="mt-8 flex flex-1 flex-col gap-3 border-t border-border pt-8">
                {plan.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[14px] leading-6 text-foreground"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="/signup"
                className={clsx(
                  "mt-8 inline-flex h-12 items-center justify-center rounded-lg border px-6 text-[15px] font-medium",
                  plan.featured
                    ? "border-primary bg-primary text-white hover:bg-primary-hover"
                    : "border-border text-link hover:bg-tonal hover:text-link",
                )}
              >
                {plan.cta}
              </a>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-[13px] leading-6 text-muted">
        No contracts. Switch plans or cancel whenever you like.
      </p>
    </section>
  );
}
