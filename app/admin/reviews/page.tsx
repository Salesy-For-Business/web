"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { Star, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Select } from "@/components/ui/select";
import { secondaryButtonClass } from "@/components/auth/styles";
import { ResourceTable, type ResourceColumn } from "@/components/admin/resource-table";
import {
  useAdminResourceDelete,
  useAdminResourceList,
  getApiError,
} from "@/lib/admin/resource-queries";

type ReviewRow = {
  id: string;
  businessName: string;
  productName: string;
  customerName: string;
  rating: number;
  body: string;
  createdAt: string;
};

function DeleteButton({ id }: { id: string }) {
  const remove = useAdminResourceDelete("reviews", id);
  return (
    <button
      type="button"
      disabled={remove.isPending}
      onClick={(e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this review? This can't be undone.")) return;
        remove.mutateAsync().then(
          () => toast.success("Review deleted"),
          (err) => toast.error(getApiError(err, "Could not delete review.")),
        );
      }}
      className={clsx(secondaryButtonClass, "h-9 w-auto gap-1.5 px-3 text-[13px] text-red-600")}
    >
      <Trash2 className="size-3.5" aria-hidden />
      Delete
    </button>
  );
}

const columns: ResourceColumn<ReviewRow>[] = [
  { key: "store", label: "Store", render: (r) => r.businessName },
  { key: "product", label: "Product", render: (r) => r.productName },
  { key: "customer", label: "Customer", render: (r) => r.customerName },
  { key: "rating", label: "Rating", render: (r) => (
    <span className="inline-flex items-center gap-1">
      <Star className="size-3.5 fill-current text-yellow-500" aria-hidden />
      {r.rating}
    </span>
  ) },
  { key: "body", label: "Review", render: (r) => (
    <span className="line-clamp-2 max-w-sm text-muted">{r.body}</span>
  ) },
  { key: "actions", label: "", className: "text-right", render: (r) => <DeleteButton id={r.id} /> },
];

const RATING_FILTERS = [
  { value: "all", label: "All ratings" },
  { value: "low", label: "1–2 stars" },
  { value: "mid", label: "3 stars" },
  { value: "high", label: "4–5 stars" },
];

function ReviewsContent() {
  const [q, setQ] = useState("");
  const [rating, setRating] = useState("all");
  const { data, isPending } = useAdminResourceList<ReviewRow>("reviews", "reviews", q);

  const rows = useMemo(
    () =>
      (data ?? []).filter((r) => {
        if (rating === "low") return r.rating <= 2;
        if (rating === "mid") return r.rating === 3;
        if (rating === "high") return r.rating >= 4;
        return true;
      }),
    [data, rating],
  );

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description="Buyer reviews across every store. Remove anything abusive or fake."
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        loading={isPending}
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search by product, customer, or text…"
        emptyLabel="No reviews found."
        filters={
          <Select
            size="sm"
            ariaLabel="Filter by rating"
            className="w-36"
            options={RATING_FILTERS}
            value={rating}
            onChange={setRating}
          />
        }
        summary={isPending ? null : `${rows.length} of ${data?.length ?? 0}`}
      />
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <AdminShell allow={["support", "superadmin"]}>
      <ReviewsContent />
    </AdminShell>
  );
}
