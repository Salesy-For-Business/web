import { jsonError, jsonOk } from "@/lib/api/http";
import { getMarketplaceFeed, searchListings } from "@/lib/listings";

/** Public — backs infinite scroll on /listings, for both the default random
 * feed and the search/category-filtered view. No auth: this is a cross-store
 * discovery feed, not scoped to any one business. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exclude = (searchParams.get("exclude") ?? "")
      .split(",")
      .filter(Boolean);
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";

    const products =
      q || category
        ? await searchListings({ query: q, category, limit: 24, excludeIds: exclude })
        : await getMarketplaceFeed(24, exclude);

    return jsonOk({ products });
  } catch (err) {
    console.error("[listings/more]", err);
    return jsonError("Could not load more products.", 500);
  }
}
