import Link from "next/link";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";

export default function Hero() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1
        className="max-w-3xl text-5xl leading-14 sm:text-[56px] sm:leading-16"
        data-aos="fade-up"
      >
        Here to help you sell
      </h1>
      <p
        className="mt-6 max-w-xl text-lg leading-8 text-foreground"
        data-aos="fade-up"
        data-aos-delay="80"
      >
        Create an online store with a unique, shareable URL. Simple for
        entrepreneurs, detailed when your business needs more.
      </p>
      <div
        className="mt-10 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        data-aos="fade-up"
        data-aos-delay="160"
      >
        <Link
          href="/signup"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Start your store
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
        <Link
          href="/demo"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-7 text-[15px] font-medium text-heading transition-colors hover:border-primary/40 hover:bg-tonal hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Store className="size-4" aria-hidden />
          See a demo store
        </Link>
      </div>
      <Link
        href="/listings"
        className="group mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted transition-colors hover:text-link"
        data-aos="fade-up"
        data-aos-delay="220"
      >
        {/* <ShoppingBag className="size-4" aria-hidden /> */}
        Or browse the marketplace
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5 hidden md:block"
          aria-hidden
        />
      </Link>
    </section>
  );
}
