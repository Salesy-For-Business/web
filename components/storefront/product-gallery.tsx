"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { StoreProduct } from "@/lib/storefront";

const noScrollbar =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

/**
 * Product detail image viewer — a swipeable carousel (native scroll-snap,
 * so touch swipe works for free) with a thumbnail rail and arrow controls,
 * like a boutique storefront's product preview. Falls back to the same
 * gradient placeholder as the catalog grid when a product has no photos.
 */
export function ProductGallery({
  product,
  className,
}: {
  product: StoreProduct;
  className?: string;
}) {
  const images = product.images?.length ? product.images : null;
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track || !images) return;
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }

  // Keep the active thumbnail in sync when the user swipes the main
  // viewer directly, instead of only reacting to arrow/thumbnail clicks.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !images || images.length < 2) return;

    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track) return;
        setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
      });
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [images]);

  if (!images) {
    return (
      <div
        className={clsx(
          "relative flex aspect-[4/5] items-end overflow-hidden rounded-xl",
          className,
        )}
        style={{
          background: `linear-gradient(145deg, ${product.accent} 0%, color-mix(in srgb, ${product.accent} 55%, #0a0a0a) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0%, transparent 45%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)",
          }}
        />
        <p className="relative z-[1] p-4 font-display text-[22px] leading-7 tracking-tight text-white/95 sm:text-[24px]">
          {product.name}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
        <div
          ref={trackRef}
          className={clsx(
            "flex size-full snap-x snap-mandatory overflow-x-auto scroll-smooth",
            noScrollbar,
          )}
        >
          {images.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${index}`}
              src={src}
              alt={`${product.name} — photo ${index + 1} of ${images.length}`}
              className="size-full shrink-0 snap-start object-cover"
            />
          ))}
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-heading shadow-sm backdrop-blur-sm hover:bg-background disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === images.length - 1}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-heading shadow-sm backdrop-blur-sm hover:bg-background disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-[12px] font-medium text-heading backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className={clsx("mt-3 flex gap-2 overflow-x-auto pb-1", noScrollbar)}>
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`View photo ${index + 1}`}
              aria-current={activeIndex === index}
              className={clsx(
                "size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                activeIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-border",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
