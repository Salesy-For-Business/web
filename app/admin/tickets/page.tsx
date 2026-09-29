"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResourceTable, type ResourceColumn } from "@/components/admin/resource-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAdminTicketsQuery, type AdminTicketRow } from "@/lib/admin/ticket-queries";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const columns: ResourceColumn<AdminTicketRow>[] = [
  { key: "store", label: "Store", render: (r) => r.businessName },
  {
    key: "subject",
    label: "Subject",
    render: (r) => (
      <span className="line-clamp-1 max-w-[18rem] font-medium text-heading">{r.subject}</span>
    ),
  },
  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  { key: "messages", label: "Messages", className: "text-right", render: (r) => r.messageCount },
  {
    key: "updated",
    label: "Updated",
    className: "whitespace-nowrap",
    render: (r) => new Date(r.updatedAt).toLocaleDateString(),
  },
];

function TicketsContent() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const { data, isPending } = useAdminTicketsQuery(status);

  return (
    <div>
      <AdminPageHeader
        title="Tickets"
        description="Support conversations opened by sellers."
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={clsx(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium",
                status === f.value
                  ? "border-primary bg-tonal text-link"
                  : "border-border text-muted hover:bg-surface",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ResourceTable
        columns={columns}
        rows={data ?? []}
        loading={isPending}
        onRowClick={(r) => router.push(`/admin/tickets/${r.id}`)}
        emptyLabel="No tickets found."
      />
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <AdminShell allow={["support", "superadmin"]}>
      <TicketsContent />
    </AdminShell>
  );
}
