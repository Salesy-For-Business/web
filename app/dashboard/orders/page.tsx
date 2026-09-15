"use client";

import clsx from "clsx";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import { formatNaira } from "@/lib/dashboard";
import { useDashboardOverview } from "@/lib/dashboard/queries";

function formatOrderDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const { data, isPending, isError } = useDashboardOverview("all");
  const orders = data?.recentOrders ?? [];

  return (
    <div>
      <DashboardPageHeader
        title="Orders"
        description="Paid and pending checkouts from your storefront."
      />

      {isPending ? (
        <p className="text-[14px] text-muted">Loading orders…</p>
      ) : isError ? (
        <p className="text-[14px] text-red-600">Could not load orders.</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-heading">No orders yet</p>
          <p className="mt-2 text-[14px] text-muted">
            When customers pay on your storefront, orders appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-border bg-surface text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Customer
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Product
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {orders.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface/60">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-heading">{tx.id}</p>
                    <p className="text-[12px] text-muted">
                      {formatOrderDate(tx.date)}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3.5 text-heading md:table-cell">
                    {tx.customer}
                  </td>
                  <td className="hidden px-4 py-3.5 text-muted lg:table-cell">
                    {tx.product}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={clsx(
                        "inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium",
                        tx.status === "Paid" &&
                          "bg-green-50 text-green-700 dark:bg-green-700/20 dark:text-green-500",
                        tx.status === "Pending" &&
                          "bg-yellow-50 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-500",
                        tx.status === "Failed" &&
                          "bg-red-50 text-red-600 dark:bg-red-700/20 dark:text-red-400",
                      )}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-[system-ui] text-heading">
                    {formatNaira(tx.amount)}
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
