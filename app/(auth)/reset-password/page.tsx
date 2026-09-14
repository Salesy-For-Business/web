import type { Metadata } from "next";
import ResetPasswordClient from "./reset-form";

export const metadata: Metadata = {
  title: "Reset password — Salesy",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
