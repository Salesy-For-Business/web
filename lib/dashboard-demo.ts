import type { AuthPlan } from "@/lib/auth-store";
import { salesyFeeRate } from "@/lib/auth-store";

export type RevenuePeriod = "today" | "7d" | "30d" | "all";

export type PeriodMetrics = {
  revenue: number;
  totalOrders: number;
  paidOrders: number;
  avgOrderValue: number;
  /** Conversion rate as percent, e.g. 2.4 */
  storeViewsConv: number;
  storeViews: number;
};

export type MonthPoint = {
  label: string;
  revenue: number;
};

export type ChannelPoint = {
  channel: string;
  orders: number;
  share: number;
};

export type TopProduct = {
  name: string;
  units: number;
  revenue: number;
};

export type RecentTransaction = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded";
  date: string;
};

const periodMetrics: Record<RevenuePeriod, PeriodMetrics> = {
  today: {
    revenue: 48_500,
    totalOrders: 3,
    paidOrders: 2,
    avgOrderValue: 16_166,
    storeViewsConv: 4.2,
    storeViews: 71,
  },
  "7d": {
    revenue: 312_000,
    totalOrders: 18,
    paidOrders: 15,
    avgOrderValue: 17_333,
    storeViewsConv: 3.1,
    storeViews: 580,
  },
  "30d": {
    revenue: 1_245_000,
    totalOrders: 67,
    paidOrders: 58,
    avgOrderValue: 18_582,
    storeViewsConv: 2.8,
    storeViews: 2_410,
  },
  all: {
    revenue: 4_890_000,
    totalOrders: 241,
    paidOrders: 218,
    avgOrderValue: 20_290,
    storeViewsConv: 2.4,
    storeViews: 10_050,
  },
};

export const revenueTrajectory: MonthPoint[] = [
  { label: "Apr", revenue: 420_000 },
  { label: "May", revenue: 510_000 },
  { label: "Jun", revenue: 680_000 },
  { label: "Jul", revenue: 745_000 },
  { label: "Aug", revenue: 890_000 },
  { label: "Sep", revenue: 1_245_000 },
];

export const acquisitionChannels: ChannelPoint[] = [
  { channel: "WhatsApp", orders: 28, share: 42 },
  { channel: "Instagram", orders: 18, share: 27 },
  { channel: "Direct link", orders: 12, share: 18 },
  { channel: "Telegram", orders: 9, share: 13 },
];

export const topProducts: TopProduct[] = [
  { name: "Ankara tote bag", units: 34, revenue: 680_000 },
  { name: "Leather card wallet", units: 22, revenue: 440_000 },
  { name: "Beaded bracelet set", units: 41, revenue: 328_000 },
  { name: "Canvas shopper", units: 15, revenue: 225_000 },
];

export const recentTransactions: RecentTransaction[] = [
  {
    id: "ORD-1042",
    customer: "Amaka Eze",
    product: "Ankara tote bag",
    amount: 20_000,
    status: "Paid",
    date: "Today, 9:14 AM",
  },
  {
    id: "ORD-1041",
    customer: "Tunde Bakare",
    product: "Leather card wallet",
    amount: 20_000,
    status: "Paid",
    date: "Yesterday, 6:02 PM",
  },
  {
    id: "ORD-1040",
    customer: "Ngozi Okoro",
    product: "Beaded bracelet set",
    amount: 8_000,
    status: "Pending",
    date: "Yesterday, 1:40 PM",
  },
  {
    id: "ORD-1039",
    customer: "Ibrahim Musa",
    product: "Canvas shopper",
    amount: 15_000,
    status: "Paid",
    date: "12 Sep, 11:20 AM",
  },
  {
    id: "ORD-1038",
    customer: "Funke Adeyemi",
    product: "Ankara tote bag",
    amount: 20_000,
    status: "Refunded",
    date: "11 Sep, 4:55 PM",
  },
];

/** Demo catalog usage for Free (limit 5). */
export const demoProductCount = 3;
export const demoUniqueBuyers = 47;
/** Available balance ready to withdraw (demo). */
export const demoAvailableBalance = 186_450;

export function getPeriodMetrics(period: RevenuePeriod): PeriodMetrics {
  return periodMetrics[period];
}

export function earningsBreakdown(gross: number, plan: AuthPlan) {
  const rate = salesyFeeRate(plan);
  const fee = Math.round(gross * rate);
  const credited = gross - fee;
  return { gross, fee, credited, rate };
}
