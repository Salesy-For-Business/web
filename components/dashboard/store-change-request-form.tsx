"use client";

import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAuthStore } from "@/lib/auth-store";
import {
  getApiError,
  useCancelStoreChangeRequestMutation,
  useStoreChangeRequestQuery,
  useSubmitStoreChangeRequestMutation,
} from "@/lib/store-change-request-queries";

export function StoreChangeRequestForm() {
  const business = useAuthStore((s) => s.business);
  const { data: request, isPending } = useStoreChangeRequestQuery();
  const submit = useSubmitStoreChangeRequestMutation();
  const cancel = useCancelStoreChangeRequestMutation();

  const [editing, setEditing] = useState(false);
  const [handle, setHandle] = useState(business?.storeHandle ?? "");
  const [name, setName] = useState(business?.businessName ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!business) return null;

  const isPendingRequest = request?.status === "pending";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await submit.mutateAsync({
        requestedStoreHandle: handle.trim(),
        requestedBusinessName: name.trim(),
      });
      toast.success("Request submitted — a superadmin will review it.");
      setEditing(false);
    } catch (err) {
      const message = getApiError(err, "Could not submit request.");
      setError(message);
      toast.error(message);
    }
  }

  async function onCancel() {
    if (!request) return;
    try {
      await cancel.mutateAsync(request.id);
      toast.success("Request cancelled");
    } catch (err) {
      toast.error(getApiError(err, "Could not cancel request."));
    }
  }

  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h3 className="text-[16px] font-medium text-heading">Store link &amp; name</h3>
      <p className="mt-1 text-[13px] text-muted">
        Changing either one needs a quick review — the current link and name
        keep working until it’s approved.
      </p>

      <dl className="mt-4 grid gap-3 text-[14px] sm:grid-cols-2">
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-muted">Current link</dt>
          <dd className="mt-1 text-heading">salesy.link/{business.storeHandle}</dd>
        </div>
        <div>
          <dt className="text-[12px] uppercase tracking-wide text-muted">Current name</dt>
          <dd className="mt-1 text-heading">{business.businessName}</dd>
        </div>
      </dl>

      {isPending ? (
        <p className="mt-5 text-[13px] text-muted">Loading…</p>
      ) : isPendingRequest && request ? (
        <div className="mt-5 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <StatusBadge status="pending" />
            <p className="text-[13px] text-muted">Awaiting review</p>
          </div>
          <p className="mt-2 text-[14px] text-heading">
            /{request.requestedStoreHandle} · {request.requestedBusinessName}
          </p>
          <button
            type="button"
            onClick={() => void onCancel()}
            disabled={cancel.isPending}
            className={clsx(secondaryButtonClass, "mt-3 w-auto px-4 text-[13px] text-red-600")}
          >
            Cancel request
          </button>
        </div>
      ) : (
        <>
          {request?.status === "rejected" && request.reviewNote ? (
            <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700 dark:bg-red-950/30 dark:text-red-400">
              Your last request was rejected: {request.reviewNote}
            </p>
          ) : null}

          {editing ? (
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="new-handle" className={fieldLabelClass}>
                    New store link
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] text-muted">salesy.link/</span>
                    <input
                      id="new-handle"
                      className={inputClass}
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="new-name" className={fieldLabelClass}>
                    New business name
                  </label>
                  <input
                    id="new-name"
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <p className={fieldHintClass}>
                Keep a field as-is to leave that one unchanged.
              </p>
              {error ? (
                <p className={fieldErrorClass} role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submit.isPending}
                  className={clsx(primaryButtonClass, "w-auto px-5")}
                >
                  {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Submit for review
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={clsx(secondaryButtonClass, "w-auto px-5")}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={clsx(primaryButtonClass, "mt-5 w-auto px-5")}
            >
              Request a change
            </button>
          )}
        </>
      )}
    </section>
  );
}
