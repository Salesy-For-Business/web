"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatMoney } from "@/lib/currencies";
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

type OrderDetail = {
  id: string;
  reference: string;
  storeHandle: string;
  status: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  total: number;
  sellerAmount: number;
  platformAmount: number;
  currency: string;
  channel: string;
};

function orderFields(currency: string): ResourceField[] {
  const money = (v: ResourceFieldValue | null | undefined) =>
    typeof v === "number" ? formatMoney(v, currency) : "—";
  return [
  { key: "reference", label: "Reference", type: "readonly" },
  { key: "storeHandle", label: "Store", type: "readonly" },
  { key: "customerName", label: "Customer", type: "readonly" },
  { key: "customerEmail", label: "Customer email", type: "readonly" },
  { key: "channel", label: "Channel", type: "readonly" },
  { key: "total", label: "Total", type: "readonly", format: money },
  { key: "sellerAmount", label: "Seller amount", type: "readonly", format: money },
  { key: "platformAmount", label: "Platform amount", type: "readonly", format: money },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "paid", label: "Paid" },
      { value: "failed", label: "Failed" },
    ],
  },
  ];
}

function OrderDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, isPending } = useAdminResourceDetail<OrderDetail>("orders", "order", id);
  const update = useAdminResourceUpdate<OrderDetail>("orders", "order", id);
  const remove = useAdminResourceDelete("orders", id);
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
      await update.mutateAsync({ status: values!.status });
      toast.success("Order updated");
    } catch (err) {
      toast.error(getApiError(err, "Could not update order."));
    }
  }

  async function onDelete() {
    try {
      await remove.mutateAsync();
      toast.success("Order deleted");
      router.push("/admin/orders");
    } catch (err) {
      toast.error(getApiError(err, "Could not delete order."));
    }
  }

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/orders"
        backLabel="All orders"
        title={<span className="break-all">Order {data?.reference}</span>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>/{data?.storeHandle}</span>
            {data?.status ? <StatusBadge status={data.status} /> : null}
          </span>
        }
      />
      <ResourceDetailPanel
        title="Order details"
        fields={orderFields(data?.currency ?? "NGN")}
        values={values}
        onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
        onSave={() => void onSave()}
        onDelete={() => void onDelete()}
        saving={update.isPending}
        deleting={remove.isPending}
        deleteLabel="Delete order"
        deleteConfirm="Delete this order record? This can't be undone."
      />
    </div>
  );
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell allow={["superadmin"]}>
      <OrderDetailContent id={id} />
    </AdminShell>
  );
}
