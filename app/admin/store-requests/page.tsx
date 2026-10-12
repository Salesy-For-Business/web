"use client";

import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { ArrowRight, Check, X } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Select } from "@/components/ui/select";
import { secondaryButtonClass } from "@/components/auth/styles";
import {
  getApiError,
  useAdminStoreRequestsQuery,
  useReviewStoreRequestMutation,
  type AdminStoreRequestRow,
} from "@/lib/admin/store-requests-queries";

const STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

function RequestRow({ request }: { request: AdminStoreRequestRow }) {
  const review = useReviewStoreRequestMutation();

  async function onApprove() {
    try {
      await review.mutateAsync({ id: request.id, action: "approve" });
      toast.success("Approved — the new handle and name are live.");
    } catch (err) {
      toast.error(getApiError(err, "Could not approve request."));
    }
  }

  async function onReject() {
    const note = window.prompt("Reason for rejecting (shown to the seller, optional):") ?? undefined;
    try {
      await review.mutateAsync({ id: request.id, action: "reject", note });
      toast.success("Rejected");
    } catch (err) {
      toast.error(getApiError(err, "Could not reject request."));
    }
  }

  const changedHandle = request.currentStoreHandle !== request.requestedStoreHandle;
  const changedName = request.currentBusinessName !== request.requestedBusinessName;

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5 text-[14px]">
          {changedHandle ? (
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted">/{request.currentStoreHandle}</span>
              <ArrowRight className="size-3.5 text-muted" aria-hidden />
              <span className="font-medium text-heading">/{request.requestedStoreHandle}</span>
            </p>
          ) : null}
          {changedName ? (
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted">{request.currentBusinessName}</span>
              <ArrowRight className="size-3.5 text-muted" aria-hidden />
              <span className="font-medium text-heading">{request.requestedBusinessName}</span>
            </p>
          ) : null}
          <p className="text-[12px] text-muted">
            Requested {new Date(request.createdAt).toLocaleDateString()}
          </p>
          {request.reviewNote ? (
            <p className="text-[12px] text-muted">Note: {request.reviewNote}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={request.status} />
          {request.status === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => void onApprove()}
                disabled={review.isPending}
                className={clsx(secondaryButtonClass, "h-9 w-auto gap-1.5 px-3 text-[13px] text-green-700")}
              >
                <Check className="size-3.5" aria-hidden />
                Approve
              </button>
              <button
                type="button"
                onClick={() => void onReject()}
                disabled={review.isPending}
                className={clsx(secondaryButtonClass, "h-9 w-auto gap-1.5 px-3 text-[13px] text-red-600")}
              >
                <X className="size-3.5" aria-hidden />
                Reject
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StoreRequestsContent() {
  const [status, setStatus] = useState("pending");
  const { data, isPending } = useAdminStoreRequestsQuery(status);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Store requests"
        description="Sellers requesting a new store link or business name — nothing changes until you approve."
        actions={
          <Select
            ariaLabel="Filter by status"
            size="sm"
            className="w-40"
            options={STATUS_FILTERS}
            value={status}
            onChange={setStatus}
          />
        }
      />

      <div className="space-y-2">
        {isPending ? (
          <p className="text-[14px] text-muted">Loading…</p>
        ) : !data || data.length === 0 ? (
          <p className="text-[14px] text-muted">Nothing here.</p>
        ) : (
          data.map((r) => <RequestRow key={r.id} request={r} />)
        )}
      </div>
    </div>
  );
}

export default function AdminStoreRequestsPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <StoreRequestsContent />
    </AdminShell>
  );
}
