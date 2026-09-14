import type { Metadata } from "next";
import ForgotPasswordClient from "./forgot-form";

export const metadata: Metadata = {
  title: "Forgot password — Salesy",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
