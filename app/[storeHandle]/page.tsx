"use client";

import { ContactChannels } from "@/components/storefront/contact-channels";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { STOREFRONT_BRAND_ID } from "@/components/storefront/shell";
import { useStorefront } from "@/components/storefront/store-context";

export default function StoreHomePage() {
  const store = useStorefront();

  return (
    <div className="space-y-12">
      <section id={STOREFRONT_BRAND_ID} className="max-w-2xl scroll-mt-24">
        <div className="flex items-center gap-4">
          {store.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoDataUrl}
              alt=""
              className="size-16 rounded-2xl object-cover shadow-sm sm:size-20"
            />
          ) : null}
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
              salesy.link/{store.handle}
            </p>
            <h1 className="mt-1 font-display text-[36px] leading-10 tracking-tight text-heading sm:text-[44px] sm:leading-[1.1]">
              {store.businessName}
            </h1>
          </div>
        </div>
        <p className="mt-4 text-[16px] leading-7 text-muted sm:text-[17px]">
          {store.description}
        </p>
      </section>

      <section>
        <ShopCatalog products={store.products} />
      </section>

      <ContactChannels />
    </div>
  );
}
