"use client";

import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { Select } from "@/components/ui/select";
import {
  useAssignModeratorMutation,
  useModeratorsQuery,
  getApiError,
} from "@/lib/admin/moderator-queries";
import type { ModeratorRole } from "@/lib/auth-store";

const ROLE_OPTIONS: { value: ModeratorRole; label: string }[] = [
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "superadmin", label: "Superadmin" },
];

const ROLE_HINT: Record<ModeratorRole, string> = {
  support: "Tickets and reviews.",
  finance: "Finance dashboard only.",
  superadmin: "Everything, including settings and plans.",
};

function ModeratorsContent() {
  const { data, isPending } = useModeratorsQuery();
  const assign = useAssignModeratorMutation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ModeratorRole>("support");

  async function onAssign(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    try {
      await assign.mutateAsync({ email: email.trim(), moderatorRole: role });
      toast.success(`${email} is now ${role}`);
      setEmail("");
    } catch (err) {
      toast.error(getApiError(err, "Could not assign role."));
    }
  }

  async function onRevoke(targetEmail: string) {
    if (!window.confirm(`Revoke admin access for ${targetEmail}?`)) return;
    try {
      await assign.mutateAsync({ email: targetEmail, moderatorRole: null });
      toast.success("Access revoked");
    } catch (err) {
      toast.error(getApiError(err, "Could not revoke access."));
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Moderators"
        description="Give existing Salesy users access to the admin panel."
      />

      <AdminCard title="Assign a role">
        <form
          onSubmit={onAssign}
          className="grid gap-4 md:grid-cols-[1fr_12rem_auto] md:items-start"
        >
          <div>
            <label htmlFor="moderator-email" className={fieldLabelClass}>
              User email
            </label>
            <input
              id="moderator-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
            />
          </div>
          <Select
            id="moderator-role"
            label="Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={setRole}
            hint={ROLE_HINT[role]}
          />
          <button
            type="submit"
            disabled={assign.isPending}
            className={clsx(primaryButtonClass, "px-5 md:mt-[1.875rem] md:w-auto md:min-w-36")}
          >
            Assign role
          </button>
        </form>
      </AdminCard>

      <div className="space-y-2">
        {isPending ? (
          <p className="text-[14px] text-muted">Loading…</p>
        ) : !data || data.length === 0 ? (
          <p className="text-[14px] text-muted">No moderators yet.</p>
        ) : (
          data.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-heading">
                  {m.firstName} {m.lastName}
                </p>
                <p className="truncate text-[13px] text-muted">{m.email}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <StatusBadge tone="info">{m.moderatorRole}</StatusBadge>
                <button
                  type="button"
                  onClick={() => void onRevoke(m.email)}
                  className={clsx(secondaryButtonClass, "h-9 w-auto px-3 text-[13px] text-red-600")}
                >
                  Revoke
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminModeratorsPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <ModeratorsContent />
    </AdminShell>
  );
}
