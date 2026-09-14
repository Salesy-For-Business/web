"use client";

import Link from "next/link";
import clsx from "clsx";
import { Package, Plus } from "lucide-react";
import {
  DashboardPageHeader,
} from "@/components/dashboard/page-chrome";
import { primaryButtonClass } from "@/components/auth/styles";
import { formatNaira } from "@/lib/dashboard";
import { topProducts, demoProductCount } from "@/lib/dashboard-demo";
import { productListingLimit, useAuthStore } from "@/lib/auth-store";

export default function ProductsPage() {
  const plan = useAuthStore((s) => s.business?.plan ?? "free");
  const limit = productListingLimit(plan);

  return (
    <div>
      <DashboardPageHeader
        title="Products"
        description="Your catalog listings. Add photos, prices, and stock as you grow."
        actions={
          <Link
            href="/dashboard/products"
            className={clsx(primaryButtonClass, "w-auto gap-2 px-5")}
            onClick={(e) => e.preventDefault()}
          >
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        }
      />

      <div className="mb-4 flex items-center justify-between text-[13px] text-muted">
        <p>
          {demoProductCount} listings
          {limit === Infinity ? " · Unlimited plan" : ` · ${limit} on Free`}
        </p>
        <div className="flex size-8 items-center justify-center rounded-lg bg-tonal text-link">
          <Package className="size-4" aria-hidden />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-border bg-surface text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Units sold</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {topProducts.map((product) => (
              <tr key={product.name} className="hover:bg-surface/60">
                <td className="px-4 py-3.5 font-medium text-heading">{product.name}</td>
                <td className="hidden px-4 py-3.5 text-muted sm:table-cell">
                  {product.units}
                </td>
                <td className="px-4 py-3.5 text-right font-[system-ui] text-heading">
                  {formatNaira(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[13px] text-muted">
        Full product editor (photos, variants, stock) comes next. This list uses
        seeded demo sales data.
      </p>
    </div>
  );
}
