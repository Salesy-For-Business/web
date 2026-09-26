import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { connectDb, Order, Product, type OrderLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

/** Orders placed before this feature existed have no sellerAmount/
 * platformAmount recorded — fall back to the old feeAmount-derived split
 * so historical numbers don't just show as zero. */
function splitFor(order: OrderLean) {
  if (order.sellerAmount || order.platformAmount) {
    return { seller: order.sellerAmount, platform: order.platformAmount };
  }
  const platform = order.feeAmount || 0;
  return { seller: order.total - platform, platform };
}

export type RevenuePeriod = "today" | "7d" | "30d" | "all";

function periodStart(period: RevenuePeriod): Date | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const days = period === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function GET(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "30d") as RevenuePeriod;
    const valid: RevenuePeriod[] = ["today", "7d", "30d", "all"];
    const selected = valid.includes(period) ? period : "30d";
    const start = periodStart(selected);

    await connectDb();
    const businessId = owned.business._id;

    const paidFilter: Record<string, unknown> = {
      businessId,
      status: "paid",
    };
    if (start) {
      paidFilter.paidAt = { $gte: start };
    }

    const [paidOrders, pendingCount, productCount, allPaid] = await Promise.all([
      Order.find(paidFilter).sort({ paidAt: -1 }).lean<OrderLean[]>(),
      Order.countDocuments({ businessId, status: "pending" }),
      Product.countDocuments({ businessId }),
      Order.find({ businessId, status: "paid" }).lean<OrderLean[]>(),
    ]);

    const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
    const paidCount = paidOrders.length;
    const avgOrderValue = paidCount ? Math.round(revenue / paidCount) : 0;
    // Real numbers from what was actually split at each sale — not a
    // post-hoc guess from the business's *current* plan/rate, since that
    // may have changed since some of these orders were placed.
    const platformFee = paidOrders.reduce((s, o) => s + splitFor(o).platform, 0);
    const net = paidOrders.reduce((s, o) => s + splitFor(o).seller, 0);
    const feeRate = revenue > 0 ? platformFee / revenue : 0;

    // Kept as `availableBalance` for the client contract, but this is now
    // "what you've earned" (Paystack settles it directly), not a balance
    // Salesy is holding for a manual withdrawal.
    const lifetimeNet = allPaid.reduce((s, o) => s + splitFor(o).seller, 0);
    const availableBalance = Math.max(0, lifetimeNet);

    const productSales = new Map<
      string,
      { name: string; units: number; revenue: number }
    >();
    for (const order of paidOrders) {
      for (const item of order.items) {
        const key = item.slug || item.name;
        const prev = productSales.get(key) ?? {
          name: item.name,
          units: 0,
          revenue: 0,
        };
        prev.units += item.qty;
        prev.revenue += item.unitPrice * item.qty;
        productSales.set(key, prev);
      }
    }
    const topProducts = [...productSales.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const monthLabels: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthLabels.push({
        key,
        label: d.toLocaleString("en-US", { month: "short" }),
      });
    }
    const monthMap = new Map(monthLabels.map((m) => [m.key, 0]));
    for (const order of allPaid) {
      if (!order.paidAt) continue;
      const d = new Date(order.paidAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) ?? 0) + order.total);
      }
    }
    const revenueTrajectory = monthLabels.map((m) => ({
      label: m.label,
      revenue: monthMap.get(m.key) ?? 0,
    }));

    const recent = await Order.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean<OrderLean[]>();

    const recentOrders = recent.map((o) => ({
      id: o.reference,
      customer: o.customer.name,
      product: o.items.map((i) => i.name).join(", "),
      amount: o.total,
      status:
        o.status === "paid"
          ? ("Paid" as const)
          : o.status === "failed"
            ? ("Failed" as const)
            : ("Pending" as const),
      date: (o.paidAt ?? o.createdAt).toISOString(),
      channel: o.channel,
    }));

    return jsonOk({
      period: selected,
      currency: owned.business.storeCurrency || "NGN",
      metrics: {
        revenue,
        totalOrders: paidCount + pendingCount,
        paidOrders: paidCount,
        avgOrderValue,
        storeViews: 0,
        storeViewsConv: 0,
      },
      earnings: {
        gross: revenue,
        platformFee,
        net,
        feeRate,
      },
      availableBalance,
      productCount,
      uniqueBuyers: new Set(paidOrders.map((o) => o.customer.email)).size,
      topProducts,
      revenueTrajectory,
      recentOrders,
    });
  } catch (err) {
    console.error("[dashboard/overview]", err);
    return jsonError("Could not load dashboard.", 500);
  }
}
