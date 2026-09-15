"use client";

import { use } from "react";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { ProductForm } from "@/components/dashboard/product-form";
import { useProductQuery } from "@/lib/products/queries";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isPending, isError } = useProductQuery(id);

  return (
    <div>
      <DashboardPageHeader
        title="Edit product"
        description="Update photos, price, or stock."
      />
      {isPending ? (
        <p className="text-[14px] text-muted">Loading…</p>
      ) : isError || !data ? (
        <p className="text-[14px] text-red-600">Product not found.</p>
      ) : (
        <ProductForm mode="edit" product={data} />
      )}
    </div>
  );
}
