import { Suspense } from "react";
import type { Metadata } from "next";
import SignupPageClient from "./signup-form";

export const metadata: Metadata = {
  title: "Create account — Salesy",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageClient />
    </Suspense>
  );
}
