"use client";

import {
  DashboardPageHeader,
} from "@/components/dashboard/page-chrome";
import { formatNaira } from "@/lib/dashboard";
import { recentTransactions } from "@/lib/dashboard-demo";
import clsx from "clsx";

export default function OrdersPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Orders"
        description="Paid and pending checkouts from your storefront. Alerts also go to WhatsApp, Telegram, and email."
      />

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-border bg-surface text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Customer</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Product</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-surface/60">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-heading">{tx.id}</p>
                  <p className="text-[12px] text-muted">{tx.date}</p>
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
                      tx.status === "Refunded" &&
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
    </div>
  );
}
