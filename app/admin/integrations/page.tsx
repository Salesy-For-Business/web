"use client";

import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  RefreshCw,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  useIntegrationsQuery,
  type IntegrationCheck,
  type IntegrationStatus,
} from "@/lib/admin/integrations-queries";

const STATUS_META: Record<
  IntegrationStatus,
  { icon: LucideIcon; className: string; label: string }
> = {
  ok: { icon: CheckCircle2, className: "text-green-600 dark:text-green-400", label: "OK" },
  warning: { icon: AlertTriangle, className: "text-yellow-600 dark:text-yellow-400", label: "Warning" },
  missing: { icon: XCircle, className: "text-red-600 dark:text-red-400", label: "Missing" },
  off: { icon: MinusCircle, className: "text-muted", label: "Off" },
};

function CheckRow({ check }: { check: IntegrationCheck }) {
  const meta = STATUS_META[check.status];
  const Icon = meta.icon;
  return (
    <li className="flex gap-3 py-3">
      <Icon className={clsx("mt-0.5 size-5 shrink-0", meta.className)} aria-label={meta.label} />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-heading">{check.label}</p>
        <p className="mt-0.5 break-words text-[13px] text-muted">{check.detail}</p>
        {check.hint ? (
          <p className="mt-1.5 rounded-lg bg-surface px-3 py-2 text-[13px] leading-5 text-foreground">
            {check.hint}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function IntegrationsContent() {
  const { data, isPending, isError, refetch, isFetching } = useIntegrationsQuery();
  const all = data?.groups.flatMap((g) => g.checks) ?? [];
  const missing = all.filter((c) => c.status === "missing").length;
  const warnings = all.filter((c) => c.status === "warning").length;

  return (
    <div>
      <AdminPageHeader
        title="Integrations"
        description="Read-only health check of the environment variables and services Salesy depends on. Secret values are never shown — change them in your host's environment settings and redeploy."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-[14px] font-medium text-link hover:bg-surface disabled:opacity-60"
          >
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} aria-hidden />
            Re-check
          </button>
        }
      />

      {isPending ? (
        <p className="text-[14px] text-muted">Checking integrations…</p>
      ) : isError || !data ? (
        <p className="text-[14px] text-red-600">Could not check integrations.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
            {missing ? (
              <StatusBadge tone="danger">{missing} missing</StatusBadge>
            ) : null}
            {warnings ? (
              <StatusBadge tone="warning">
                {warnings} warning{warnings > 1 ? "s" : ""}
              </StatusBadge>
            ) : null}
            {!missing && !warnings ? (
              <StatusBadge tone="success">Everything is configured</StatusBadge>
            ) : null}
            <span>Checked {new Date(data.checkedAt).toLocaleTimeString()}</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {data.groups.map((group) => (
              <AdminCard
                key={group.id}
                title={group.title}
                description={group.description}
                className={group.id === "plan-codes" ? "lg:col-span-2" : undefined}
              >
                <ul
                  className={clsx(
                    "divide-y divide-border",
                    group.id === "plan-codes" && "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0",
                  )}
                >
                  {group.checks.map((check) => (
                    <CheckRow key={check.id} check={check} />
                  ))}
                </ul>
              </AdminCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminIntegrationsPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <IntegrationsContent />
    </AdminShell>
  );
}
