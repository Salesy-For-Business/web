"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResourceTable, type ResourceColumn } from "@/components/admin/resource-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Select } from "@/components/ui/select";
import { useAdminResourceList } from "@/lib/admin/resource-queries";
import { formatMoney } from "@/lib/currencies";

type OrderRow = {
  id: string;
  reference: string;
  storeHandle: string;
  status: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
};

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const columns: ResourceColumn<OrderRow>[] = [
  {
    key: "ref",
    label: "Reference",
    render: (r) => <span className="font-mono text-[13px] text-heading">{r.reference}</span>,
  },
  { key: "store", label: "Store", render: (r) => `/${r.storeHandle}` },
  {
    key: "customer",
    label: "Customer",
    render: (r) => (
      <div className="min-w-0 max-w-[12rem]">
        <p className="truncate text-heading">{r.customerName}</p>
        <p className="truncate text-[12px] text-muted">{r.customerEmail}</p>
      </div>
    ),
  },
  {
    key: "total",
    label: "Total",
    className: "whitespace-nowrap text-right",
    render: (r) => formatMoney(r.total, r.currency),
  },
  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

function OrdersContent() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const { data, isPending } = useAdminResourceList<OrderRow>("orders", "orders", q);

  const rows = useMemo(
    () => (data ?? []).filter((r) => status === "all" || r.status === status),
    [data, status],
  );

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Every checkout across all stores."
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        loading={isPending}
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search by reference, store, or customer email…"
        onRowClick={(r) => router.push(`/admin/orders/${r.id}`)}
        emptyLabel="No orders found."
        filters={
          <Select
            size="sm"
            ariaLabel="Filter by status"
            className="w-40"
            options={STATUS_FILTERS}
            value={status}
            onChange={setStatus}
          />
        }
        summary={isPending ? null : `${rows.length} of ${data?.length ?? 0}`}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <OrdersContent />
    </AdminShell>
  );
}
