import { jsonError, jsonOk } from "@/lib/api/http";
import { getPlatformSettings } from "@/lib/platform-settings";

export async function GET() {
  try {
    const { supportEmail, defaultStoreCurrency } = await getPlatformSettings();
    return jsonOk({ supportEmail, defaultStoreCurrency });
  } catch (err) {
    console.error("[platform GET]", err);
    return jsonError("Could not load platform info.", 500);
  }
}
