export default function Cta() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="scroll-mt-24 bg-surface-muted px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="cta-heading"
          className="text-pretty text-[32px] leading-10 sm:text-[44px] sm:leading-[1.15]"
        >
          Open your store. Share the link. Start selling.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">
          A unique URL, checkout without sign-in, and order alerts on WhatsApp,
          Telegram, and email.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/signup"
            className="inline-flex h-12 items-center rounded-lg border border-primary bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-hover"
          >
            Start your store
          </a>
          <a
            href="#pricing"
            className="inline-flex h-12 items-center rounded-lg border border-border px-6 text-[15px] font-medium text-link hover:bg-background hover:text-link"
          >
            Compare plans
          </a>
        </div>
      </div>
    </section>
  );
}
