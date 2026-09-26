import type { Metadata } from "next";
import PayoutPageClient from "./payout-form";

export const metadata: Metadata = {
  title: "Payout details — Salesy",
  robots: { index: false, follow: false },
};

export default function PayoutPage() {
  return <PayoutPageClient />;
}
