import type { Metadata } from "next";
import SignupVerifyClient from "./verify-form";

export const metadata: Metadata = {
  title: "Verify email — Salesy",
  robots: { index: false, follow: false },
};

export default function SignupVerifyPage() {
  return <SignupVerifyClient />;
}
