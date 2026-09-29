"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { secondaryButtonClass } from "@/components/auth/styles";
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

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  inStock: boolean;
  featuredUntil: string | null;
  businessId: string;
};

const fields: ResourceField[] = [
  { key: "name", label: "Name", type: "readonly" },
  { key: "category", label: "Category", type: "text" },
  { key: "price", label: "Price", type: "readonly" },
  { key: "inStock", label: "In stock", type: "checkbox" },
];

function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, isPending } = useAdminResourceDetail<ProductDetail>("products", "product", id);
  const update = useAdminResourceUpdate<ProductDetail>("products", "product", id);
  const remove = useAdminResourceDelete("products", id);
  const [values, setValues] = useState<Record<string, ResourceFieldValue> | null>(null);

  useEffect(() => {
    if (!data) return;
    const t = window.setTimeout(() => setValues({ ...data }), 0);
    return () => window.clearTimeout(t);
  }, [data]);

  if (isPending || !values) {
    return <p className="text-[14px] text-muted">Loading…</p>;
  }

  const isFeatured = data?.featuredUntil && new Date(data.featuredUntil) > new Date();

  async function onSave() {
    try {
      await update.mutateAsync({
        category: values!.category,
        inStock: Boolean(values!.inStock),
      });
      toast.success("Product updated");
    } catch (err) {
      toast.error(getApiError(err, "Could not update product."));
    }
  }

  async function onRevokeFeatured() {
    try {
      await update.mutateAsync({ featuredUntil: null });
      toast.success("Featured slot revoked");
    } catch (err) {
      toast.error(getApiError(err, "Could not revoke featured slot."));
    }
  }

  async function onDelete() {
    try {
      await remove.mutateAsync();
      toast.success("Product deleted");
      router.push("/admin/products");
    } catch (err) {
      toast.error(getApiError(err, "Could not delete product."));
    }
  }

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="All products"
        title={data?.name}
        description={data?.category}
      />

      {isFeatured ? (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-[14px] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Featured until{" "}
            <span className="font-medium text-heading">
              {new Date(data!.featuredUntil!).toLocaleString()}
            </span>
          </span>
          <button
            type="button"
            onClick={() => void onRevokeFeatured()}
            disabled={update.isPending}
            className={clsx(secondaryButtonClass, "h-10 px-4 text-red-600 sm:w-auto")}
          >
            Revoke
          </button>
        </div>
      ) : null}

      <ResourceDetailPanel
        title="Product details"
        fields={fields}
        values={values}
        onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
        onSave={() => void onSave()}
        onDelete={() => void onDelete()}
        saving={update.isPending}
        deleting={remove.isPending}
        deleteLabel="Delete product"
        deleteConfirm="Delete this product? This can't be undone."
      />
    </div>
  );
}

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell allow={["superadmin"]}>
      <ProductDetailContent id={id} />
    </AdminShell>
  );
}
