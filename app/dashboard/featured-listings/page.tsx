"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { FeaturedListingForm } from "@/components/dashboard/featured-listing-form";
import {
  featuredListingKeys,
  useFeaturedListingDashboardQuery,
  getApiError,
} from "@/lib/featured-listings-queries";
import { api, type ApiOk } from "@/lib/api/client";

/**
 * Confirms a payment on return from Paystack. The webhook does the same
 * job, but can't reach `localhost` in dev and may lag in production — this
 * verifies directly against Paystack so featuring a product doesn't
 * silently depend on the webhook ever arriving.
 */
function usePaymentVerification() {
  const params = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const reference = params.get("reference");
  const [verifying, setVerifying] = useState(Boolean(reference));
  const handled = useRef(false);

  useEffect(() => {
    if (!reference || handled.current) return;
    handled.current = true;

    let cancelled = false;
    void (async () => {
      try {
        await api.get<ApiOk<{ status: string; featuredUntil: string | null }>>(
          "/dashboard/featured-listings/verify",
          { params: { reference } },
        );
        if (cancelled) return;
        toast.success("Product featured! It'll now appear in the Marketplace's featured section.");
      } catch (err) {
        if (cancelled) return;
        toast.error(getApiError(err, "Could not confirm your payment."));
      } finally {
        if (cancelled) return;
        setVerifying(false);
        await qc.invalidateQueries({ queryKey: featuredListingKeys.dashboard });
        router.replace("/dashboard/featured-listings");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reference, router, qc]);

  return verifying;
}

function FeaturedListingsContent() {
  const verifying = usePaymentVerification();
  const { data, isPending, isError } = useFeaturedListingDashboardQuery();

  return (
    <div>
      <DashboardPageHeader
        title="Feature Products"
        description="Pay to pin one of your products at the top of Salesy's public Listings page for a set number of weeks."
      />

      {verifying ? (
        <p className="mb-6 flex items-center gap-2 text-[14px] text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Confirming your payment…
        </p>
      ) : null}

      {isPending ? (
        <p className="text-[14px] text-muted">Loading…</p>
      ) : isError || !data ? (
        <p className="text-[14px] text-red-600">
          Could not load your products. Try refreshing.
        </p>
      ) : (
        <FeaturedListingForm data={data} />
      )}
    </div>
  );
}

export default function FeaturedListingsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[14px] text-muted" aria-live="polite">
          Loading…
        </p>
      }
    >
      <FeaturedListingsContent />
    </Suspense>
  );
}
