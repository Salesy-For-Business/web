"use client";

import { Star } from "lucide-react";
import {
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/components/dashboard/page-chrome";

const sampleReviews = [
  {
    name: "Amaka E.",
    rating: 5,
    body: "Bag arrived neatly packed. Will order again.",
    product: "Ankara tote bag",
  },
  {
    name: "Tunde B.",
    rating: 4,
    body: "Solid quality. Delivery took a day longer than expected.",
    product: "Leather card wallet",
  },
];

export default function ReviewsPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Reviews"
        description="Feedback from confirmed buyers. Ratings show on your storefront automatically."
      />

      {sampleReviews.length === 0 ? (
        <DashboardEmptyState
          icon={Star}
          title="No reviews yet"
          description="After a paid order, buyers can leave a rating. Those reviews build trust for the next shopper."
          primaryHref="/dashboard/orders"
          primaryLabel="View orders"
        />
      ) : (
        <ul className="space-y-4">
          {sampleReviews.map((review) => (
            <li
              key={`${review.name}-${review.product}`}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-medium text-heading">{review.name}</p>
                <p className="flex items-center gap-0.5 text-[13px] text-yellow-700 dark:text-yellow-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" aria-hidden />
                  ))}
                  <span className="sr-only">{review.rating} out of 5</span>
                </p>
              </div>
              <p className="mt-2 text-[14px] leading-6 text-foreground">{review.body}</p>
              <p className="mt-3 text-[12px] text-muted">{review.product}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
