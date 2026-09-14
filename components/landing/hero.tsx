import Link from "next/link";
import { Store } from "lucide-react";

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
        entrepreneurs — detailed when your business needs more.
      </p>
      <div
        className="mt-10 flex flex-col items-center justify-center gap-2 md:flex-row"
        data-aos="fade-up"
        data-aos-delay="160"
      >
        <Link
          href="/signup"
          className="inline-flex h-12 items-center rounded-full border border-border px-6 text-[15px] font-medium text-link hover:bg-tonal hover:text-link"
        >
          Start your store
        </Link>
        <Link
          href="/demo"
          className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium text-foreground hover:bg-tonal hover:text-link"
        >
          See Demo <Store size={16} />
        </Link>
      </div>
    </section>
  );
}
