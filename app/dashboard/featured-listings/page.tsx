"use client";

import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { FeaturedListingForm } from "@/components/dashboard/featured-listing-form";
import { useFeaturedListingDashboardQuery } from "@/lib/featured-listings-queries";

export default function FeaturedListingsPage() {
  const { data, isPending, isError } = useFeaturedListingDashboardQuery();

  return (
    <div>
      <DashboardPageHeader
        title="Feature Products"
        description="Pay to pin one of your products at the top of Salesy's public Listings page for a set number of weeks."
      />

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
