"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResourceTable, type ResourceColumn } from "@/components/admin/resource-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Select } from "@/components/ui/select";
import { useAdminResourceList } from "@/lib/admin/resource-queries";

type BusinessRow = {
  id: string;
  businessName: string;
  businessEmail: string;
  plan: string;
  storeHandle: string;
  subscriptionStatus: string;
  suspended: boolean;
  hasPayoutSetup: boolean;
};

const PLAN_FILTERS = [
  { value: "all", label: "All plans" },
  { value: "free", label: "Free" },
  { value: "boutique", label: "Boutique" },
  { value: "pro", label: "Pro" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "no_payout", label: "Payout missing" },
];

const columns: ResourceColumn<BusinessRow>[] = [
  {
    key: "name",
    label: "Business",
    render: (r) => (
      <div className="min-w-0 max-w-[14rem]">
        <p className="truncate font-medium text-heading">{r.businessName}</p>
        <p className="truncate text-[12px] text-muted">/{r.storeHandle}</p>
      </div>
    ),
  },
  {
    key: "email",
    label: "Email",
    render: (r) => <span className="text-muted">{r.businessEmail}</span>,
  },
  {
    key: "plan",
    label: "Plan",
    render: (r) => (
      <StatusBadge tone={r.plan === "free" ? "neutral" : "info"}>{r.plan}</StatusBadge>
    ),
  },
  {
    key: "sub",
    label: "Subscription",
    render: (r) => <StatusBadge status={r.subscriptionStatus} />,
  },
  {
    key: "payout",
    label: "Payout",
    render: (r) =>
      r.hasPayoutSetup ? (
        <StatusBadge tone="success">Set up</StatusBadge>
      ) : (
        <StatusBadge tone="warning">Missing</StatusBadge>
      ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) =>
      r.suspended ? <StatusBadge status="suspended" /> : <StatusBadge status="active" />,
  },
];

function BusinessesContent() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const { data, isPending } = useAdminResourceList<BusinessRow>("businesses", "businesses", q);

  const rows = useMemo(
    () =>
      (data ?? []).filter((r) => {
        if (plan !== "all" && r.plan !== plan) return false;
        if (status === "active" && r.suspended) return false;
        if (status === "suspended" && !r.suspended) return false;
        if (status === "no_payout" && r.hasPayoutSetup) return false;
        return true;
      }),
    [data, plan, status],
  );

  return (
    <div>
      <AdminPageHeader
        title="Businesses"
        description="Every store on Salesy. Open one to edit its plan, subscription, or suspend it."
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        loading={isPending}
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search by name, email, or handle…"
        onRowClick={(r) => router.push(`/admin/businesses/${r.id}`)}
        emptyLabel="No businesses found."
        filters={
          <>
            <Select
              size="sm"
              ariaLabel="Filter by plan"
              className="w-36"
              options={PLAN_FILTERS}
              value={plan}
              onChange={setPlan}
            />
            <Select
              size="sm"
              ariaLabel="Filter by status"
              className="w-40"
              options={STATUS_FILTERS}
              value={status}
              onChange={setStatus}
            />
          </>
        }
        summary={isPending ? null : `${rows.length} of ${data?.length ?? 0}`}
      />
    </div>
  );
}

export default function AdminBusinessesPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <BusinessesContent />
    </AdminShell>
  );
}
