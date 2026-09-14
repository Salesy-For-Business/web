import { Suspense } from "react";
import { CheckoutSuccess } from "@/components/storefront/checkout-success";

export default function StoreCheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[14px] text-muted" aria-live="polite">
          Loading…
        </p>
      }
    >
      <CheckoutSuccess />
    </Suspense>
  );
}
