"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResourceTable, type ResourceColumn } from "@/components/admin/resource-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Select } from "@/components/ui/select";
import { useAdminResourceList } from "@/lib/admin/resource-queries";

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isModerator: boolean;
  moderatorRole: string | null;
  suspended: boolean;
};

const ROLE_FILTERS = [
  { value: "all", label: "All users" },
  { value: "moderators", label: "Moderators" },
  { value: "sellers", label: "Sellers only" },
  { value: "suspended", label: "Suspended" },
];

const columns: ResourceColumn<UserRow>[] = [
  {
    key: "name",
    label: "Name",
    render: (r) => (
      <span className="font-medium text-heading">
        {r.firstName} {r.lastName}
      </span>
    ),
  },
  { key: "email", label: "Email", render: (r) => <span className="text-muted">{r.email}</span> },
  {
    key: "role",
    label: "Moderator role",
    render: (r) =>
      r.moderatorRole ? <StatusBadge tone="info">{r.moderatorRole}</StatusBadge> : "—",
  },
  {
    key: "status",
    label: "Status",
    render: (r) =>
      r.suspended ? <StatusBadge status="suspended" /> : <StatusBadge status="active" />,
  },
];

function UsersContent() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const { data, isPending } = useAdminResourceList<UserRow>("users", "users", q);

  const rows = useMemo(
    () =>
      (data ?? []).filter((r) => {
        if (filter === "moderators") return r.isModerator;
        if (filter === "sellers") return !r.isModerator;
        if (filter === "suspended") return r.suspended;
        return true;
      }),
    [data, filter],
  );

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Account holders across the platform."
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        loading={isPending}
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search by name or email…"
        onRowClick={(r) => router.push(`/admin/users/${r.id}`)}
        emptyLabel="No users found."
        filters={
          <Select
            size="sm"
            ariaLabel="Filter users"
            className="w-40"
            options={ROLE_FILTERS}
            value={filter}
            onChange={setFilter}
          />
        }
        summary={isPending ? null : `${rows.length} of ${data?.length ?? 0}`}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <UsersContent />
    </AdminShell>
  );
}
