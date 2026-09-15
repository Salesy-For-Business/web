"use client";

import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { ProductForm } from "@/components/dashboard/product-form";

export default function NewProductPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Add product"
        description="Photos, price, and stock for your storefront."
      />
      <ProductForm mode="create" />
    </div>
  );
}
