const features = [
  {
    title: "Payment in the moment",
    description:
      "Shoppers settle by card, transfer, or USSD on your storefront. You can stop chasing screenshots of transfers.",
  },
  {
    title: "Alerts on WhatsApp, Telegram, and email",
    description:
      "Each sale arrives as a tidy order recap on the channels you already check, so you can pack without digging.",
  },
  {
    title: "Checkout with no sign-in",
    description:
      "Buyers skip accounts and passwords. A few taps, the payment clears, and the order is on your side.",
  },
  {
    title: "Reviews that run themselves",
    description:
      "Confirmed purchases trigger feedback for you. Those ratings sit on your storefront so new shoppers can trust you.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-24 bg-background px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
          What you get
        </p>
        <h2
          id="features-heading"
          className="mt-4 text-pretty text-[32px] leading-10 sm:text-[44px] sm:leading-[1.15]"
        >
          A storefront that fits how you take orders
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">
          Salesy gives you a shareable shop, instant payments, and order
          alerts — without asking buyers to jump through hoops.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="rounded-xl border border-border bg-surface-muted p-8 text-left"
            data-aos="fade-up"
            data-aos-delay={String(index * 80)}
          >
            <span className="font-display text-sm text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-[22px] leading-7 tracking-normal">
              {feature.title}
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-foreground">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
