import { requireAdmin } from "@/lib/admin/require-admin";
import {
  connectDb,
  Business,
  Order,
  FeaturedListingOrder,
  type BusinessLean,
} from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getFeaturedListingWeeklyPrice } from "@/lib/platform-settings";
import { DEFAULT_CURRENCY, type BusinessCurrency } from "@/lib/currencies";
import { getPlanConfigs } from "@/lib/plan-config";
import {
  bucketKeyExpr,
  bucketKeys,
  nextBucket,
  truncateToBucket,
} from "@/lib/admin/time-buckets";

const paidAt = { $ifNull: ["$paidAt", "$createdAt"] };

export async function GET() {
  try {
    const admin = await requireAdmin(["finance", "superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    await connectDb();

    const now = new Date();
    let seriesStart = truncateToBucket(now, "month");
    for (let i = 0; i < 11; i++) {
      seriesStart = truncateToBucket(new Date(seriesStart.getTime() - 1), "month");
    }
    const seriesEnd = nextBucket(truncateToBucket(now, "month"), "month");

    const [orderTotals, featuredTotals, businesses, orderSeries, featuredSeries, planConfigs] =
      await Promise.all([
        Order.aggregate<{ gmv: number; revenue: number; count: number }>([
          { $match: { status: "paid" } },
          {
            $group: {
              _id: null,
              gmv: { $sum: "$total" },
              revenue: { $sum: { $ifNull: ["$platformAmount", 0] } },
              count: { $sum: 1 },
            },
          },
        ]),
        FeaturedListingOrder.aggregate<{ amount: number }>([
          { $match: { status: "paid" } },
          { $group: { _id: null, amount: { $sum: { $divide: ["$amountMinorUnits", 100] } } } },
        ]),
        Business.find()
          .select(
            "businessName storeHandle plan subscriptionStatus subscriptionRenewsAt storeCurrency billingCurrency",
          )
          .lean<BusinessLean[]>(),
        Order.aggregate<{ _id: string; gmv: number; revenue: number }>([
          { $match: { status: "paid" } },
          { $addFields: { at: paidAt } },
          { $match: { at: { $gte: seriesStart, $lt: seriesEnd } } },
          {
            $group: {
              _id: bucketKeyExpr("$at", "month"),
              gmv: { $sum: "$total" },
              revenue: { $sum: { $ifNull: ["$platformAmount", 0] } },
            },
          },
        ]),
        FeaturedListingOrder.aggregate<{ _id: string; amount: number }>([
          { $match: { status: "paid" } },
          { $addFields: { at: paidAt } },
          { $match: { at: { $gte: seriesStart, $lt: seriesEnd } } },
          {
            $group: {
              _id: bucketKeyExpr("$at", "month"),
              amount: { $sum: { $divide: ["$amountMinorUnits", 100] } },
            },
          },
        ]),
        getPlanConfigs(),
      ]);

    const gmv = orderTotals[0]?.gmv ?? 0;
    const orderPlatformRevenue = orderTotals[0]?.revenue ?? 0;
    const featuredRevenue = featuredTotals[0]?.amount ?? 0;

    const planCounts = { free: 0, boutique: 0, pro: 0 };
    const mrr: Partial<Record<BusinessCurrency, number>> = {};
    for (const b of businesses) {
      planCounts[b.plan] = (planCounts[b.plan] ?? 0) + 1;
      if (b.plan !== "free" && b.subscriptionStatus === "active") {
        const monthly =
          planConfigs.find((p) => p.id === b.plan)?.prices[b.billingCurrency]?.monthly ?? 0;
        mrr[b.billingCurrency] = (mrr[b.billingCurrency] ?? 0) + monthly;
      }
    }

    const orderMap = new Map(orderSeries.map((r) => [r._id, r]));
    const featuredMap = new Map(featuredSeries.map((r) => [r._id, r.amount]));
    const series = bucketKeys(seriesStart, seriesEnd, "month").map((date) => ({
      date,
      gmv: orderMap.get(date)?.gmv ?? 0,
      orderRevenue: orderMap.get(date)?.revenue ?? 0,
      featuredRevenue: featuredMap.get(date) ?? 0,
    }));

    const weeklyPrice = await getFeaturedListingWeeklyPrice(DEFAULT_CURRENCY);

    return jsonOk({
      gmv,
      orderPlatformRevenue,
      featuredRevenue,
      totalPlatformRevenue: orderPlatformRevenue + featuredRevenue,
      paidOrderCount: orderTotals[0]?.count ?? 0,
      planCounts,
      mrr,
      series,
      featuredListingWeeklyPriceNGN: weeklyPrice,
      businesses: businesses.map((b) => ({
        id: String(b._id),
        businessName: b.businessName,
        storeHandle: b.storeHandle,
        plan: b.plan,
        subscriptionStatus: b.subscriptionStatus,
        subscriptionRenewsAt: b.subscriptionRenewsAt ?? null,
        billingCurrency: b.billingCurrency,
      })),
    });
  } catch (err) {
    console.error("[admin/finance GET]", err);
    return jsonError("Could not load finance data.", 500);
  }
}
