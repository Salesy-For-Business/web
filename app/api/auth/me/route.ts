import { getAuthSession } from "@/lib/auth/session-user";
import { jsonOk } from "@/lib/api/http";

export async function GET() {
  try {
    const session = await getAuthSession();
    return jsonOk({
      status: session.status,
      user: session.user,
      business: session.business,
    });
  } catch (err) {
    console.error("[auth/me]", err);
    return jsonOk({
      status: "anonymous" as const,
      user: null,
      business: null,
    });
  }
}
