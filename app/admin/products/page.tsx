"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResourceTable, type ResourceColumn } from "@/components/admin/resource-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Select } from "@/components/ui/select";
import { useAdminResourceList } from "@/lib/admin/resource-queries";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  featuredUntil: string | null;
};

const FILTERS = [
  { value: "all", label: "All products" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "featured", label: "Featured" },
];

function isFeatured(r: ProductRow) {
  return Boolean(r.featuredUntil && new Date(r.featuredUntil) > new Date());
}

const columns: ResourceColumn<ProductRow>[] = [
  {
    key: "name",
    label: "Product",
    render: (r) => (
      <span className="line-clamp-1 max-w-[16rem] font-medium text-heading">{r.name}</span>
    ),
  },
  { key: "category", label: "Category", render: (r) => <span className="text-muted">{r.category}</span> },
  {
    key: "price",
    label: "Price",
    className: "whitespace-nowrap text-right",
    render: (r) => r.price.toLocaleString(),
  },
  {
    key: "stock",
    label: "Stock",
    render: (r) =>
      r.inStock ? (
        <StatusBadge tone="success">In stock</StatusBadge>
      ) : (
        <StatusBadge tone="danger">Out of stock</StatusBadge>
      ),
  },
  {
    key: "featured",
    label: "Featured until",
    className: "whitespace-nowrap",
    render: (r) =>
      r.featuredUntil ? new Date(r.featuredUntil).toLocaleDateString() : "—",
  },
];

function ProductsContent() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const { data, isPending } = useAdminResourceList<ProductRow>("products", "products", q);

  const rows = useMemo(
    () =>
      (data ?? []).filter((r) => {
        if (filter === "in_stock") return r.inStock;
        if (filter === "out_of_stock") return !r.inStock;
        if (filter === "featured") return isFeatured(r);
        return true;
      }),
    [data, filter],
  );

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Listings from every store, including featured slots."
      />
      <ResourceTable
        columns={columns}
        rows={rows}
        loading={isPending}
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search by name or category…"
        onRowClick={(r) => router.push(`/admin/products/${r.id}`)}
        emptyLabel="No products found."
        filters={
          <Select
            size="sm"
            ariaLabel="Filter products"
            className="w-40"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
          />
        }
        summary={isPending ? null : `${rows.length} of ${data?.length ?? 0}`}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminShell allow={["superadmin"]}>
      <ProductsContent />
    </AdminShell>
  );
}
