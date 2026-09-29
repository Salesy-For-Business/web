"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useAuditLogQuery } from "@/lib/admin/audit-log-queries";

function AuditLogContent() {
  const { data, isPending } = useAuditLogQuery();

  return (
    <div>
      <AdminPageHeader
        title="Audit log"
        description="Every role assignment, PIN change, settings or plan edit, suspension, delete, and ticket/review moderation action, most recent first."
      />

      {isPending ? (
        <p className="text-[14px] text-muted">Loading…</p>
      ) : !data || data.length === 0 ? (
        <p className="text-[14px] text-muted">No admin actions recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {data.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-border bg-background px-4 py-3 text-[13px]"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                <p className="min-w-0 break-words">
                  <span className="font-medium text-heading">{entry.actorEmail}</span>{" "}
                  <span className="text-muted">{entry.action}</span>
                  {entry.targetType ? (
                    <span className="text-muted">
                      {" "}
                      · {entry.targetType}
                      {entry.targetId ? ` #${entry.targetId.slice(-6)}` : ""}
                    </span>
                  ) : null}
                </p>
                <span className="text-muted">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              {entry.metadata ? (
                <pre className="mt-2 overflow-x-auto rounded bg-surface p-2 text-[11px] text-muted">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAuditLogPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <AuditLogContent />
    </AdminShell>
  );
}
