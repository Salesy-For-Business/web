import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, MousePointerClick, ShoppingBag, TrendingUp } from "lucide-react";
import { landingOptions } from "./options";

const businessSteps: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: MousePointerClick,
    title: "Open Feature Products",
    description: "From your dashboard, go to Feature Products and pick the item you want more buyers to see.",
  },
  {
    icon: CalendarClock,
    title: "Choose how long it runs",
    description: "Pick 1–8 weeks and pay a small weekly fee — no contracts, it just expires when the weeks are up.",
  },
  {
    icon: ShoppingBag,
    title: "It goes live on the Marketplace",
    description: "Your product appears in the Featured section at the top of Salesy's Marketplace, right where shoppers are already browsing.",
  },
  {
    icon: TrendingUp,
    title: "Feature your next best-seller",
    description: "Once a slot ends, pick another product and put it in front of buyers.",
  },
];

const steps = {
  store: [
    {
      photo: "/photos/store.jpg",
      alt: "A shop owner in Dar es Salaam serving a customer",
      title: "Create your store",
      description: "Pick a name and get a unique, shareable URL.",
    },
    {
      photo: "/photos/customize.jpg",
      alt: "A woman in beaded jewelry and a handmade clutch",
      title: "Make it yours",
      description: "Set your logo, colors, and layout to match your brand.",
    },
    {
      photo: "/photos/products.jpg",
      alt: "A market vendor smiling with her phone beside her goods",
      title: "Add products",
      description: "Build your catalog with details, photos, and prices.",
    },
    {
      photo: "/photos/publish.jpg",
      alt: "A shop owner at her counter with a phone ready to share",
      title: "Publish your link",
      description: "Go live and copy a URL you can share anywhere.",
    },
    {
      photo: "/photos/share.jpg",
      alt: "A fruit vendor holding a phone and giving a thumbs up",
      title: "Share and sell",
      description: "Put your store in bios, chats, and posts.",
    },
    {
      photo: "/photos/grow.jpg",
      alt: "A vendor selling plantain at an outdoor stall in Nigeria",
      title: "Grow from there",
      description: "Use promotions and insights to find the next customer.",
    },
  ],
  partnership: [
    {
      photo: "/photos/publish.jpg",
      alt: "A shop owner at her counter with a phone ready to share",
      title: "Get your invite link",
      description: "Grab your unique code from the Refer & earn dashboard.",
    },
    {
      photo: "/photos/products.jpg",
      alt: "A market vendor smiling with her phone beside her goods",
      title: "Invite sellers you know",
      description: "Share it with other entrepreneurs ready to sell online.",
    },
    {
      photo: "/photos/grow.jpg",
      alt: "A vendor selling plantain at an outdoor stall in Nigeria",
      title: "Earn when they grow",
      description: "Unlock rewards as soon as their store goes live.",
    },
  ],
} as const;

function BusinessStepGrid() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {businessSteps.map((step, index) => {
        const Icon = step.icon;
        return (
          <article
            key={step.title}
            className="group relative flex flex-col rounded-2xl border border-border bg-background p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            data-aos="fade-up"
            data-aos-delay={String(index * 80)}
          >
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-full bg-tonal text-link transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="font-display text-lg text-border transition-colors group-hover:text-primary/50">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-6 text-[18px] leading-7 tracking-normal">
              {step.title}
            </h3>
            <p className="mt-2 text-[14px] leading-6 text-foreground">
              {step.description}
            </p>
            {index < businessSteps.length - 1 ? (
              <span
                aria-hidden
                className="absolute right-0 top-1/2 hidden h-px w-4 -translate-y-1/2 translate-x-full bg-border xl:block"
              />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export default function Sections() {
  return (
    <>
      {landingOptions.map((option) => {
        const isBusiness = option.id === "business";
        const items = isBusiness ? null : steps[option.id as "store" | "partnership"];
        const fourUp = items ? (items.length as number) === 4 : false;

        return (
          <section
            key={option.id}
            id={option.id}
            aria-labelledby={`${option.id}-heading`}
            className="scroll-mt-24 bg-surface-muted px-6 py-20 sm:px-10 lg:px-16"
            data-aos="fade-up"
          >
            <div className="mx-auto max-w-6xl">
              <h2
                id={`${option.id}-heading`}
                className="text-center text-[32px] leading-10"
              >
                {option.label}
                {"badge" in option ? (
                  <span className="ml-3 align-middle text-[15px] font-medium text-green-700">
                    {option.badge}
                  </span>
                ) : null}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-muted">
                {option.description}
              </p>

              {isBusiness ? (
                <BusinessStepGrid />
              ) : (
                <div
                  className={
                    fourUp
                      ? "mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                      : "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {items!.map((step, index) => (
                    <article
                      key={step.title}
                      className="flex flex-col overflow-hidden rounded-xl border border-border bg-background text-left"
                      data-aos="fade-up"
                      data-aos-delay={String(index * 60)}
                    >
                      <div className="relative aspect-4/3 w-full">
                        <Image
                          src={step.photo}
                          alt={step.alt}
                          fill
                          className="object-cover"
                          sizes={
                            fourUp
                              ? "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          }
                        />
                        <span className="absolute right-3 top-3 flex items-baseline gap-1.5 rounded-md bg-background/90 px-2 py-1 text-muted backdrop-blur-sm">
                          <span className="text-[11px] font-medium uppercase tracking-wider">
                            Step
                          </span>
                          <span className="font-display text-xl leading-none text-heading">
                            {index + 1}
                          </span>
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-[17px] leading-6 tracking-normal">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-[14px] leading-6 text-foreground">
                          {step.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
