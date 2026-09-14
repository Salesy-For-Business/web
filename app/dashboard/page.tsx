import type { Metadata } from "next";
import { OverviewPage } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Overview — Salesy",
};

export default function DashboardOverviewPage() {
  return <OverviewPage />;
}
