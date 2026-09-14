import type { Metadata } from "next";
import SignInPageClient from "./signin-form";

export const metadata: Metadata = {
  title: "Sign in — Salesy",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInPageClient />;
}
