import { clearSessionCookie } from "@/lib/auth/session";
import { jsonOk } from "@/lib/api/http";

export async function POST() {
  await clearSessionCookie();
  return jsonOk({ next: "anonymous" as const });
}
