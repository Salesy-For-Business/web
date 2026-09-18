"use client";

import { Star } from "lucide-react";
import {
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/components/dashboard/page-chrome";
import { useReviewsQuery } from "@/lib/reviews/queries";

function formatReviewDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ReviewsPage() {
  const { data, isPending, isError } = useReviewsQuery();
  const reviews = data?.reviews ?? [];
  const average = data?.averageRating ?? 0;

  return (
    <div>
      <DashboardPageHeader
        title="Reviews"
        description="Feedback from confirmed buyers after paid orders."
      />

      {isPending ? (
        <p className="text-[14px] text-muted">Loading reviews…</p>
      ) : isError ? (
        <p className="text-[14px] text-red-600">Could not load reviews.</p>
      ) : reviews.length === 0 ? (
        <DashboardEmptyState
          icon={Star}
          title="No reviews yet"
          description="After a paid order, buyers can leave a rating. Those reviews build trust for the next shopper."
          primaryHref="/dashboard/orders"
          primaryLabel="View orders"
        />
      ) : (
        <>
          <p className="mb-4 text-[13px] text-muted">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
            {average > 0 ? ` · ${average} avg rating` : null}
          </p>
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-border bg-background p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-medium text-heading">
                    {review.name}
                  </p>
                  <p className="flex items-center gap-0.5 text-[13px] text-yellow-700 dark:text-yellow-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-current"
                        aria-hidden
                      />
                    ))}
                    <span className="sr-only">{review.rating} out of 5</span>
                  </p>
                </div>
                <p className="mt-2 text-[14px] leading-6 text-foreground">
                  {review.body}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                  <span>{review.product}</span>
                  <span aria-hidden>·</span>
                  <span>{formatReviewDate(review.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
