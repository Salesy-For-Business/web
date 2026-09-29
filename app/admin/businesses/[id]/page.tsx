"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  ResourceDetailPanel,
  type ResourceField,
  type ResourceFieldValue,
} from "@/components/admin/resource-detail-panel";
import {
  useAdminResourceDelete,
  useAdminResourceDetail,
  useAdminResourceUpdate,
  getApiError,
} from "@/lib/admin/resource-queries";

type BusinessDetail = {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  description: string;
  plan: string;
  storeHandle: string;
  subscriptionStatus: string;
  suspended: boolean;
  hasPayoutSetup: boolean;
  storeCurrency: string;
  billingCurrency: string;
};

const fields: ResourceField[] = [
  { key: "storeHandle", label: "Store handle", type: "readonly" },
  { key: "businessName", label: "Business name", type: "text" },
  { key: "businessEmail", label: "Email", type: "text" },
  { key: "businessPhone", label: "Phone", type: "text" },
  {
    key: "plan",
    label: "Plan",
    type: "select",
    options: [
      { value: "free", label: "Free" },
      { value: "boutique", label: "Boutique" },
      { value: "pro", label: "Pro" },
    ],
  },
  {
    key: "subscriptionStatus",
    label: "Subscription status",
    type: "select",
    options: [
      { value: "none", label: "None" },
      { value: "active", label: "Active" },
      { value: "past_due", label: "Past due" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  { key: "hasPayoutSetup", label: "Payout set up", type: "readonly" },
  { key: "suspended", label: "Suspended", type: "checkbox" },
];

function BusinessDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, isPending } = useAdminResourceDetail<BusinessDetail>(
    "businesses",
    "business",
    id,
  );
  const update = useAdminResourceUpdate<BusinessDetail>("businesses", "business", id);
  const remove = useAdminResourceDelete("businesses", id);
  const [values, setValues] = useState<Record<string, ResourceFieldValue> | null>(null);

  useEffect(() => {
    if (!data) return;
    const t = window.setTimeout(() => setValues({ ...data }), 0);
    return () => window.clearTimeout(t);
  }, [data]);

  if (isPending || !values) {
    return <p className="text-[14px] text-muted">Loading…</p>;
  }

  async function onSave() {
    try {
      await update.mutateAsync({
        businessName: values!.businessName,
        businessEmail: values!.businessEmail,
        businessPhone: values!.businessPhone,
        plan: values!.plan,
        subscriptionStatus: values!.subscriptionStatus,
        suspended: Boolean(values!.suspended),
      });
      toast.success("Business updated");
    } catch (err) {
      toast.error(getApiError(err, "Could not update business."));
    }
  }

  async function onDelete() {
    try {
      await remove.mutateAsync();
      toast.success("Business deleted");
      router.push("/admin/businesses");
    } catch (err) {
      toast.error(getApiError(err, "Could not delete business."));
    }
  }

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/businesses"
        backLabel="All businesses"
        title={data?.businessName}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>/{data?.storeHandle}</span>
            {data?.suspended ? <StatusBadge status="suspended" /> : null}
          </span>
        }
        actions={
          data?.storeHandle ? (
            <Link
              href={`/${data.storeHandle}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] font-medium text-link hover:bg-tonal"
            >
              <ExternalLink className="size-4" aria-hidden />
              View store
            </Link>
          ) : null
        }
      />
      <ResourceDetailPanel
        title="Business details"
        fields={fields}
        values={values}
        onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
        onSave={() => void onSave()}
        onDelete={() => void onDelete()}
        saving={update.isPending}
        deleting={remove.isPending}
        deleteLabel="Delete business"
        deleteConfirm="Delete this business and all its data references? This can't be undone."
      />
    </div>
  );
}

export default function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell allow={["superadmin"]}>
      <BusinessDetailContent id={id} />
    </AdminShell>
  );
}
