"use client";

import Link from "next/link";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { primaryButtonClass, secondaryButtonClass } from "@/components/auth/styles";
import { formatNaira } from "@/lib/dashboard";
import {
  getApiError,
  useDeleteProductMutation,
  useProductsQuery,
} from "@/lib/products/queries";
import { productListingLimit, useAuthStore } from "@/lib/auth-store";

export default function ProductsPage() {
  const plan = useAuthStore((s) => s.business?.plan ?? "free");
  const planLimit = productListingLimit(plan);
  const { data, isPending, isError } = useProductsQuery();
  const remove = useDeleteProductMutation();

  const products = data?.products ?? [];
  const count = data?.count ?? 0;
  const limit = data?.limit ?? planLimit;
  const atLimit = count >= limit;

  async function onDelete(id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This can’t be undone.`)) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Product deleted");
    } catch (err) {
      toast.error(getApiError(err, "Could not delete product."));
    }
  }

  return (
    <div>
      <DashboardPageHeader
        title="Products"
        description="Your catalog listings. Add photos, prices, and stock."
        actions={
          <Link
            href="/dashboard/products/new"
            className={clsx(
              primaryButtonClass,
              "w-auto gap-2 px-5",
              atLimit && "pointer-events-none opacity-50",
            )}
            aria-disabled={atLimit}
            onClick={(e) => {
              if (atLimit) {
                e.preventDefault();
                toast.error(
                  `Free plan allows ${limit} listings. Upgrade to add more.`,
                );
              }
            }}
          >
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        }
      />

      <div className="mb-4 flex items-center justify-between text-[13px] text-muted">
        <p>
          {isPending ? "…" : count} listings
          {limit === Infinity ? " · Unlimited plan" : ` · ${limit} on Free`}
        </p>
        <div className="flex size-8 items-center justify-center rounded-lg bg-tonal text-link">
          <Package className="size-4" aria-hidden />
        </div>
      </div>

      {isPending ? (
        <p className="text-[14px] text-muted">Loading products…</p>
      ) : isError ? (
        <p className="text-[14px] text-red-600">Could not load products.</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-heading">No products yet</p>
          <p className="mt-2 text-[14px] text-muted">
            Add your first listing to start selling on your storefront.
          </p>
          <Link
            href="/dashboard/products/new"
            className={clsx(primaryButtonClass, "mx-auto mt-6 w-auto gap-2 px-5")}
          >
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-border bg-surface text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Stock
                </th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-surface/60">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt=""
                          className="size-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="size-10 rounded-lg"
                          style={{ background: product.accent }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-heading">
                          {product.name}
                        </p>
                        <p className="truncate text-[12px] text-muted">
                          {product.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-muted sm:table-cell">
                    {product.inStock
                      ? product.stockQty != null
                        ? `${product.stockQty} left`
                        : "In stock"
                      : "Out of stock"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-[system-ui] text-heading">
                    {formatNaira(product.price)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className={clsx(
                          secondaryButtonClass,
                          "h-9 w-auto gap-1.5 px-3 text-[13px]",
                        )}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] text-red-600 hover:bg-surface"
                        onClick={() => void onDelete(product.id, product.name)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
