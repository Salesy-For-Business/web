"use client";

import { use, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { primaryButtonClass, textareaClass } from "@/components/auth/styles";
import {
  useReplySupportTicketMutation,
  useSupportTicketQuery,
  getApiError,
} from "@/lib/support-tickets-queries";

function TicketThread({ id }: { id: string }) {
  const { data, isPending } = useSupportTicketQuery(id);
  const reply = useReplySupportTicketMutation(id);
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
      toast.error(getApiError(err, "Could not send message."));
    }
  }

  return (
    <div>
      <DashboardPageHeader
        title={data.subject}
        description={`Status: ${data.status.replace("_", " ")}`}
      />

      <div className="space-y-4 rounded-xl border border-border bg-background p-5">
        {data.messages.map((m, i) => (
          <div
            key={i}
            className={clsx(
              "max-w-lg rounded-lg px-4 py-3 text-[14px]",
              m.authorType === "business"
                ? "ml-auto bg-tonal text-heading"
                : "bg-surface text-heading",
            )}
          >
            <p className="text-[12px] font-medium text-muted">{m.authorName}</p>
            <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            <p className="mt-1 text-[11px] text-muted">
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={onReply} className="mt-4 flex flex-col gap-3">
        <textarea
          className={textareaClass}
          placeholder="Type a message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          disabled={reply.isPending || !message.trim()}
          className={clsx(primaryButtonClass, "w-auto min-w-32 px-6")}
        >
          {reply.isPending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}

export default function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TicketThread id={id} />;
}
