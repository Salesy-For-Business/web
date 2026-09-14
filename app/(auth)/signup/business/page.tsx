import type { Metadata } from "next";
import BusinessPageClient from "./business-form";

export const metadata: Metadata = {
  title: "Business details — Salesy",
  robots: { index: false, follow: false },
};

export default function BusinessPage() {
  return <BusinessPageClient />;
}
