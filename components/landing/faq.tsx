"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

const items = [
  {
    question: "How do I open a store?",
    answer:
      "Create an account, name your shop, add products with photos and prices, then publish. Your unique link can go live in minutes — no coding required.",
  },
  {
    question: "How do shoppers find my catalog?",
    answer:
      "They visit your Salesy URL, or you share it in WhatsApp, Instagram, Telegram, and anywhere else you already talk to customers.",
  },
  {
    question: "Who handles delivery?",
    answer:
      "You do. After checkout, the order lands in WhatsApp, Telegram, and email, and you arrange fulfillment the way you already work with customers.",
  },
  {
    question: "When do I get paid?",
    answer:
      "Customers pay on your store by card, transfer, or USSD. Salesy does not hold the money — it goes to you.",
  },
  {
    question: "Can more than one person sell from the same store?",
    answer:
      "Yes. Teams, agencies, and groups can share a storefront and manage listings and orders together.",
  },
  {
    question: "Do you take a cut, or charge every month?",
    answer:
      "You can start on the Free plan. Boutique and Pro are optional if you need more listings and tools. There is no commission on each sale.",
  },
  {
    question: "Does it work well on phones?",
    answer:
      "Yes. Your storefront is built to browse and check out on phones, tablets, and computers.",
  },
  {
    question: "How is my store data protected?",
    answer:
      "We encrypt data in transit, keep regular backups, and host on secured servers so your shop and customer details stay protected.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 bg-background px-6 py-24 sm:px-10 lg:px-16"
      data-aos="fade-up"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-4 text-pretty text-[32px] leading-10 sm:text-[44px] sm:leading-[1.15]"
          >
            Common questions, plain answers
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-muted">
            What to know before you publish a storefront and start taking
            orders.
          </p>
          <a
            href="#cta"
            className="mt-6 inline-flex text-[15px] font-medium text-link hover:text-link-hover"
          >
            Still have a question?
          </a>
        </div>

        <div className="border-t border-border">
          {items.map((item, index) => {
            const isOpen = open === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question} className="border-b border-border">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-[16px] font-medium leading-6 tracking-normal text-heading hover:text-link"
                  >
                    {item.question}
                    <ChevronDown
                      className={clsx(
                        "size-5 shrink-0 text-muted transition-transform",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pb-5"
                >
                  <p className="max-w-xl text-[15px] leading-7 text-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
