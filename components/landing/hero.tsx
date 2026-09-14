import { ArrowRightIcon } from "lucide-react";

export default function Hero() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="max-w-3xl text-5xl leading-14 sm:text-[56px] sm:leading-16">
        Here to help you sell
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-foreground">
        Create an online store with a unique, shareable URL. Simple for
        entrepreneurs — detailed when your business needs more.
      </p>
      <div className="flex mt-10 items-center justify-center flex-col md:flex-row gap-2">
          <a
            id="start"
            href="#start"
            className=" inline-flex h-12 items-center rounded-full border border-border px-6 text-[15px] font-medium text-link hover:bg-tonal hover:text-link"
          >
            Start your store
          </a>
          <a
            id="start"
            href="#start"
            className=" inline-flex gap-2 h-12 items-center rounded-full px-6 text-[15px] font-medium text-foreground hover:bg-tonal hover:text-link"
          >
            See Demo <ArrowRightIcon size={16} />
          </a>
      </div>
    </section>
  );
}
