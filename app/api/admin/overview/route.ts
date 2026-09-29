import type { PipelineStage } from "mongoose";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  connectDb,
  Business,
  FeaturedListingOrder,
  Order,
  Product,
  Review,
  SupportTicket,
  User,
} from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { BusinessCurrency } from "@/lib/currencies";
import { getPlanConfigs } from "@/lib/plan-config";
import type { PlanConfigData } from "@/lib/plan-defaults";
import type { PlanId } from "@/lib/plans";
import type { AdminOverview, Kpi, OverviewPeriod } from "@/lib/admin/overview-queries";
import {
  bucketKeyExpr,
  bucketKeys,
  DAY_MS,
  truncateToBucket,
  type TimeBucket,
} from "@/lib/admin/time-buckets";

const PERIOD_DAYS: Record<Exclude<OverviewPeriod, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function kpi(value: number, previous: number | null): Kpi {
  const change =
    previous == null
      ? null
      : previous === 0
        ? value === 0
          ? 0
          : null
        : ((value - previous) / previous) * 100;
  return { value, previous, change };
}

type Range = { start: Date; end: Date };

const paidAt = { $ifNull: ["$paidAt", "$createdAt"] };

async function orderTotals(range: Range) {
  const [row] = await Order.aggregate<{ gmv: number; revenue: number; count: number }>([
    { $match: { status: "paid" } },
    { $addFields: { at: paidAt } },
    { $match: { at: { $gte: range.start, $lt: range.end } } },
    {
      $group: {
        _id: null,
        gmv: { $sum: "$total" },
        revenue: { $sum: { $ifNull: ["$platformAmount", 0] } },
        count: { $sum: 1 },
      },
    },
  ]);
  return row ?? { gmv: 0, revenue: 0, count: 0 };
}

async function featuredTotal(range: Range) {
  const [row] = await FeaturedListingOrder.aggregate<{ amount: number }>([
    { $match: { status: "paid" } },
    { $addFields: { at: paidAt } },
    { $match: { at: { $gte: range.start, $lt: range.end } } },
    { $group: { _id: null, amount: { $sum: { $divide: ["$amountMinorUnits", 100] } } } },
  ]);
  return row?.amount ?? 0;
}

function createdIn(range: Range) {
  return { createdAt: { $gte: range.start, $lt: range.end } };
}

async function reviewStats(range: Range) {
  const [row] = await Review.aggregate<{ count: number; avg: number }>([
    { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
    { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$rating" } } },
  ]);
  return row ?? { count: 0, avg: null };
}

async function periodTotals(range: Range) {
  const [orders, featured, businesses, users, reviews] = await Promise.all([
    orderTotals(range),
    featuredTotal(range),
    Business.countDocuments(createdIn(range)).exec(),
    User.countDocuments(createdIn(range)).exec(),
    reviewStats(range),
  ]);
  return { orders, featured, businesses, users, reviews };
}

function seriesPipeline(
  unit: TimeBucket,
  range: Range,
  sums: Record<string, unknown>,
): PipelineStage[] {
  return [
    { $addFields: { at: paidAt } },
    { $match: { at: { $gte: range.start, $lt: range.end } } },
    { $group: { _id: bucketKeyExpr("$at", unit), ...sums } },
  ];
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const raw = new URL(request.url).searchParams.get("period");
    const period: OverviewPeriod =
      raw === "7d" || raw === "90d" || raw === "all" ? raw : "30d";

    await connectDb();

    const now = new Date();
    let unit: TimeBucket;
    let current: Range;
    let previous: Range | null;
    if (period === "all") {
      const [firstBusiness, firstOrder] = await Promise.all([
        Business.findOne().sort({ createdAt: 1 }).select("createdAt").lean(),
        Order.findOne().sort({ createdAt: 1 }).select("createdAt").lean(),
      ]);
      const earliest = [firstBusiness?.createdAt, firstOrder?.createdAt]
        .filter((d): d is Date => Boolean(d))
        .reduce((min, d) => (d < min ? d : min), now);
      const spanDays = (now.getTime() - earliest.getTime()) / DAY_MS;
      unit = spanDays > 120 ? "month" : spanDays > 31 ? "week" : "day";
      current = { start: truncateToBucket(earliest, unit), end: now };
      previous = null;
    } else {
      const days = PERIOD_DAYS[period];
      unit = period === "90d" ? "week" : "day";
      const start = new Date(truncateToBucket(now, "day").getTime() - (days - 1) * DAY_MS);
      current = { start, end: now };
      previous = { start: new Date(start.getTime() - days * DAY_MS), end: start };
    }

    const planConfigs = Object.fromEntries(
      (await getPlanConfigs()).map((p) => [p.id, p]),
    ) as Record<PlanId, PlanConfigData>;

    const [
      cur,
      prev,
      orderSeries,
      featuredSeries,
      businessSeries,
      userSeries,
      planMixRows,
      channelRows,
      statusRows,
      topRows,
      recentOrders,
      newestBusinesses,
      activeProducts,
      newProducts,
      openTickets,
      ticketsOpened,
      subscriptionRows,
      currencyRows,
    ] = await Promise.all([
      periodTotals(current),
      previous ? periodTotals(previous) : Promise.resolve(null),
      Order.aggregate<{ _id: string; gmv: number; revenue: number; orders: number }>([
        { $match: { status: "paid" } },
        ...seriesPipeline(unit, current, {
          gmv: { $sum: "$total" },
          revenue: { $sum: { $ifNull: ["$platformAmount", 0] } },
          orders: { $sum: 1 },
        }),
      ]),
      FeaturedListingOrder.aggregate<{ _id: string; revenue: number }>([
        { $match: { status: "paid" } },
        ...seriesPipeline(unit, current, {
          revenue: { $sum: { $divide: ["$amountMinorUnits", 100] } },
        }),
      ]),
      Business.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: bucketKeyExpr("$createdAt", unit), count: { $sum: 1 } } },
      ]),
      User.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: bucketKeyExpr("$createdAt", unit), count: { $sum: 1 } } },
      ]),
      Business.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$plan", count: { $sum: 1 } } },
      ]),
      Order.aggregate<{ _id: string; orders: number; gmv: number }>([
        { $match: { status: "paid" } },
        { $addFields: { at: paidAt } },
        { $match: { at: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: "$channel", orders: { $sum: 1 }, gmv: { $sum: "$total" } } },
      ]),
      Order.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate<{
        _id: unknown;
        gmv: number;
        orders: number;
        business?: { businessName: string; storeHandle: string };
      }>([
        { $match: { status: "paid" } },
        { $addFields: { at: paidAt } },
        { $match: { at: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: "$businessId", gmv: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { gmv: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: Business.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "business",
            pipeline: [{ $project: { businessName: 1, storeHandle: 1 } }],
          },
        },
        { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("reference customer.name storeHandle total currency status createdAt")
        .lean(),
      Business.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("businessName storeHandle plan createdAt")
        .lean(),
      Product.countDocuments({ inStock: true }).exec(),
      Product.countDocuments(createdIn(current)).exec(),
      SupportTicket.countDocuments({ status: { $in: ["open", "in_progress"] } }).exec(),
      SupportTicket.countDocuments(createdIn(current)).exec(),
      Business.aggregate<{ _id: { plan: string; status: string; currency: BusinessCurrency }; count: number }>([
        { $match: { plan: { $ne: "free" }, subscriptionStatus: { $in: ["active", "past_due"] } } },
        {
          $group: {
            _id: { plan: "$plan", status: "$subscriptionStatus", currency: "$billingCurrency" },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.distinct("currency", { status: "paid" }),
    ]);

    const orderMap = new Map(orderSeries.map((r) => [r._id, r]));
    const featuredMap = new Map(featuredSeries.map((r) => [r._id, r.revenue]));
    const businessMap = new Map(businessSeries.map((r) => [r._id, r.count]));
    const userMap = new Map(userSeries.map((r) => [r._id, r.count]));
    const series: AdminOverview["series"] = bucketKeys(current.start, current.end, unit).map(
      (key) => {
        const o = orderMap.get(key);
        return {
          date: key,
          gmv: o?.gmv ?? 0,
          revenue: (o?.revenue ?? 0) + (featuredMap.get(key) ?? 0),
          orders: o?.orders ?? 0,
          businesses: businessMap.get(key) ?? 0,
          users: userMap.get(key) ?? 0,
        };
      },
    );

    let paidSubscriptions = 0;
    let pastDueSubscriptions = 0;
    const mrr: Partial<Record<BusinessCurrency, number>> = {};
    for (const row of subscriptionRows) {
      const { plan, status, currency } = row._id;
      if (status === "active") paidSubscriptions += row.count;
      else pastDueSubscriptions += row.count;
      if (status !== "active") continue;
      const config = planConfigs[plan as PlanId];
      const monthly = config?.prices[currency]?.monthly ?? 0;
      mrr[currency] = (mrr[currency] ?? 0) + monthly * row.count;
    }

    const platformRevenue = cur.orders.revenue + cur.featured;
    const prevPlatformRevenue = prev ? prev.orders.revenue + prev.featured : null;
    const aov = cur.orders.count ? cur.orders.gmv / cur.orders.count : 0;
    const prevAov = prev ? (prev.orders.count ? prev.orders.gmv / prev.orders.count : 0) : null;

    const body: AdminOverview = {
      period,
      bucket: unit,
      range: { start: current.start.toISOString(), end: current.end.toISOString() },
      currencies: (currencyRows as BusinessCurrency[]).sort(),
      kpis: {
        gmv: kpi(cur.orders.gmv, prev?.orders.gmv ?? null),
        platformRevenue: kpi(platformRevenue, prevPlatformRevenue),
        orderRevenue: kpi(cur.orders.revenue, prev?.orders.revenue ?? null),
        featuredRevenue: kpi(cur.featured, prev?.featured ?? null),
        paidOrders: kpi(cur.orders.count, prev?.orders.count ?? null),
        aov: kpi(aov, prevAov),
        newBusinesses: kpi(cur.businesses, prev?.businesses ?? null),
        newUsers: kpi(cur.users, prev?.users ?? null),
        newReviews: kpi(cur.reviews.count, prev?.reviews.count ?? null),
        averageRating: cur.reviews.avg ?? null,
        activeProducts,
        newProducts,
        openTickets,
        ticketsOpened,
        paidSubscriptions,
        pastDueSubscriptions,
        mrr,
      },
      series,
      planMix: (["free", "boutique", "pro"] as const).map((plan) => ({
        plan,
        name: planConfigs[plan].name,
        count: planMixRows.find((r) => r._id === plan)?.count ?? 0,
      })),
      channels: (["card", "transfer", "ussd"] as const).map((channel) => {
        const row = channelRows.find((r) => r._id === channel);
        return { channel, orders: row?.orders ?? 0, gmv: row?.gmv ?? 0 };
      }),
      orderStatus: (["paid", "pending", "failed"] as const).map((status) => ({
        status,
        count: statusRows.find((r) => r._id === status)?.count ?? 0,
      })),
      topBusinesses: topRows.map((r) => ({
        id: String(r._id),
        businessName: r.business?.businessName ?? "Deleted store",
        storeHandle: r.business?.storeHandle ?? "",
        gmv: r.gmv,
        orders: r.orders,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: String(o._id),
        reference: o.reference,
        customerName: o.customer?.name ?? "",
        storeHandle: o.storeHandle,
        total: o.total,
        currency: o.currency,
        status: o.status,
        createdAt: new Date(o.createdAt).toISOString(),
      })),
      newestBusinesses: newestBusinesses.map((b) => ({
        id: String(b._id),
        businessName: b.businessName,
        storeHandle: b.storeHandle,
        plan: b.plan,
        createdAt: new Date(b.createdAt).toISOString(),
      })),
    };

    return jsonOk(body);
  } catch (err) {
    console.error("[admin/overview GET]", err);
    return jsonError("Could not load the overview.", 500);
  }
}
