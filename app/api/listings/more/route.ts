import { jsonError, jsonOk } from "@/lib/api/http";
import { getRandomListings } from "@/lib/listings";

/** Public — backs the "Show more" button on /listings. No auth: this is a
 * cross-store discovery feed, not scoped to any one business. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exclude = (searchParams.get("exclude") ?? "")
      .split(",")
      .filter(Boolean);

    const products = await getRandomListings(24, exclude);
    return jsonOk({ products });
  } catch (err) {
    console.error("[listings/more]", err);
    return jsonError("Could not load more products.", 500);
  }
}
