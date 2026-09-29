"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { primaryButtonClass, textareaClass } from "@/components/auth/styles";
import { Select } from "@/components/ui/select";
import {
  useAdminTicketQuery,
  useAdminReplyTicketMutation,
  useAdminUpdateTicketStatusMutation,
  getApiError,
  type TicketStatus,
} from "@/lib/admin/ticket-queries";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function TicketDetailContent({ id }: { id: string }) {
  const { data, isPending } = useAdminTicketQuery(id);
  const reply = useAdminReplyTicketMutation(id);
  const updateStatus = useAdminUpdateTicketStatusMutation(id);
  const [message, setMessage] = useState("");

  if (isPending || !data) {
    return <p className="text-[14px] text-muted">Loading…</p>;
  }

  async function onReply(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    try {
      await reply.mutateAsync(message.trim());
      setMessage("");
    } catch (err) {
      toast.error(getApiError(err, "Could not send reply."));
    }
  }

  async function onStatusChange(status: TicketStatus) {
    try {
      await updateStatus.mutateAsync(status);
      toast.success("Status updated");
    } catch (err) {
      toast.error(getApiError(err, "Could not update status."));
    }
  }

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/tickets"
        backLabel="All tickets"
        title={data.subject}
        description={data.businessName}
        actions={
          <Select
            ariaLabel="Ticket status"
            size="sm"
            className="w-full sm:w-44"
            options={STATUS_OPTIONS}
            value={data.status}
            disabled={updateStatus.isPending}
            onChange={(s) => void onStatusChange(s)}
          />
        }
      />

      <div className="space-y-4 rounded-xl border border-border bg-background p-4 sm:p-5">
        {data.messages.map((m, i) => (
          <div
            key={i}
            className={clsx(
              "max-w-[90%] rounded-lg px-4 py-3 text-[14px] sm:max-w-lg",
              m.authorType === "admin"
                ? "ml-auto bg-tonal text-heading"
                : "bg-surface text-heading",
            )}
          >
            <p className="text-[12px] font-medium text-muted">{m.authorName}</p>
            <p className="mt-1 whitespace-pre-wrap break-words">{m.body}</p>
            <p className="mt-1 text-[11px] text-muted">
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={onReply} className="mt-4 flex flex-col gap-3">
        <textarea
          className={textareaClass}
          placeholder="Type a reply…"
          aria-label="Reply"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          disabled={reply.isPending || !message.trim()}
          className={clsx(primaryButtonClass, "px-6 sm:w-auto sm:min-w-32 sm:self-end")}
        >
          {reply.isPending ? "Sending…" : "Send reply"}
        </button>
      </form>
    </div>
  );
}

export default function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell allow={["support", "superadmin"]}>
      <TicketDetailContent id={id} />
    </AdminShell>
  );
}
