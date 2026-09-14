import Image from "next/image";
import { landingOptions } from "./options";

const steps = {
  business: [
    {
      photo: "/photos/profile.jpg",
      alt: "A woman setting up her work on a laptop while on a phone call",
      title: "Set up your profile",
      description: "Add who you are and how customers can find you.",
    },
    {
      photo: "/photos/reel.jpg",
      alt: "A man with a camera, ready to shoot product content",
      title: "Upload product as a reel",
      description: "Drop in a short video. That is the product listing.",
    },
    {
      photo: "/photos/rest.jpg",
      alt: "A woman pausing on a balcony at dusk",
      title: "Leave the rest to us",
      description: "We create and manage ads that attract customers to your business.",
    },
    {
      photo: "/photos/working.jpg",
      alt: "A woman reviewing her work on a laptop",
      title: "See what's working",
      description: "Track views, orders, and which reels actually sell.",
    },
  ],
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
} as const;

export default function Sections() {
  return (
    <>
      {landingOptions.map((option) => {
        const items = steps[option.id];
        const fourUp = items.length === 4;

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

              <div
                className={
                  fourUp
                    ? "mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                    : "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {items.map((step, index) => (
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
            </div>
          </section>
        );
      })}
      {/* <p className="bg-surface-muted px-6 pb-16 text-center text-sm text-muted">
        Photos from{" "}
        <a
          href="https://unsplash.com"
          className="text-link hover:text-link-hover"
          target="_blank"
          rel="noreferrer"
        >
          Unsplash
        </a>
      </p> */}
    </>
  );
}
