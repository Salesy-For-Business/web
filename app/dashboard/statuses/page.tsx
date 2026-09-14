import { redirect } from "next/navigation";

/** Old Statuses route — Grow Biz replaced it. */
export default function StatusesRedirectPage() {
  redirect("/dashboard/grow-biz");
}
