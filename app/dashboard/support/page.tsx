"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { toast } from "sonner";
import { Ticket } from "lucide-react";
import { DashboardEmptyState, DashboardPageHeader } from "@/components/dashboard/page-chrome";
import {
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import {
  useCreateSupportTicketMutation,
  useSupportTicketsQuery,
  getApiError,
} from "@/lib/support-tickets-queries";
import { usePlatformInfo } from "@/lib/platform-queries";

function NewTicketForm({ onCreated }: { onCreated: (id: string) => void }) {
  const create = useCreateSupportTicketMutation();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const ticket = await create.mutateAsync({ subject, message });
      toast.success("Ticket submitted");
      setSubject("");
      setMessage("");
      setOpen(false);
      onCreated(ticket.id);
    } catch (err) {
      toast.error(getApiError(err, "Could not submit ticket."));
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(primaryButtonClass, "mb-6 w-auto px-5")}
      >
        New ticket
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-background p-5"
    >
      <div>
        <label className={fieldLabelClass}>Subject</label>
        <input
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label className={fieldLabelClass}>Message</label>
        <textarea
          className={textareaClass}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={create.isPending || !subject.trim() || !message.trim()}
          className={clsx(primaryButtonClass, "w-auto px-5")}
        >
          {create.isPending ? "Submitting…" : "Submit ticket"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={clsx(secondaryButtonClass, "w-auto px-5")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function SupportPage() {
  const router = useRouter();
  const { data, isPending } = useSupportTicketsQuery();
  const { data: platform } = usePlatformInfo();

  return (
    <div>
      <DashboardPageHeader
        title="Support"
        description={
          platform?.supportEmail ? (
            <>
              Open a ticket and Salesy support will reply here, or email{" "}
              <a href={`mailto:${platform.supportEmail}`} className="text-link hover:underline">
                {platform.supportEmail}
              </a>
              .
            </>
          ) : (
            "Open a ticket and Salesy support will reply here."
          )
        }
      />

      <NewTicketForm onCreated={(id) => router.push(`/dashboard/support/${id}`)} />

      {isPending ? (
        <p className="text-[14px] text-muted">Loading…</p>
      ) : !data || data.length === 0 ? (
        <DashboardEmptyState
          icon={Ticket}
          title="No tickets yet"
          description="If something's wrong with your store, orders, or payouts, open a ticket and we'll help."
        />
      ) : (
        <div className="space-y-2">
          {data.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/support/${t.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 hover:bg-surface"
            >
              <div>
                <p className="text-[14px] font-medium text-heading">{t.subject}</p>
                <p className="text-[12px] text-muted">
                  Updated {new Date(t.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-tonal px-2.5 py-1 text-[12px] font-medium capitalize text-link">
                {t.status.replace("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
