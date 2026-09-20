"use client";

import Link from "next/link";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { primaryButtonClass } from "@/components/auth/styles";
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
        <div className="-mx-4 overflow-x-auto overscroll-x-contain sm:mx-0">
          <div className="inline-block min-w-full align-middle sm:rounded-xl sm:border sm:border-border">
            <div className="overflow-hidden border-y border-border sm:rounded-xl sm:border">
              <table className="w-full min-w-[36rem] text-left text-[14px]">
                <thead className="border-b border-border bg-surface text-[12px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
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
                              className="size-10 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div
                              className="size-10 shrink-0 rounded-lg"
                              style={{ background: product.accent }}
                            />
                          )}
                          <div className="min-w-0 max-w-[12rem] sm:max-w-xs">
                            <p className="truncate font-medium text-heading">
                              {product.name}
                            </p>
                            <p className="truncate text-[12px] text-muted">
                              {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-muted">
                        {product.inStock
                          ? product.stockQty != null
                            ? `${product.stockQty} left`
                            : "In stock"
                          : "Out of stock"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-[system-ui] text-heading">
                        {formatNaira(product.price)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-[13px] font-medium text-link hover:bg-surface"
                          >
                            <Pencil className="size-3.5" aria-hidden />
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-[13px] font-medium text-red-600 hover:bg-surface disabled:pointer-events-none disabled:opacity-60"
                            onClick={() =>
                              void onDelete(product.id, product.name)
                            }
                            disabled={remove.isPending}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
