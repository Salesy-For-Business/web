import { redirect } from "next/navigation";

/** Old Grow Biz route — Featured Products replaced it. */
export default function GrowBizRedirectPage() {
  redirect("/dashboard/featured-listings");
}
