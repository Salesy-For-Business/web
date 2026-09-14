import type { Metadata } from "next";
import ForgotVerifyClient from "./verify-form";

export const metadata: Metadata = {
  title: "Verify reset code — Salesy",
  robots: { index: false, follow: false },
};

export default function ForgotVerifyPage() {
  return <ForgotVerifyClient />;
}
