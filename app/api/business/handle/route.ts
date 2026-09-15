import { connectDb } from "@/lib/db";
import { isHandleTaken, normalizeHandle } from "@/lib/auth/session-user";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("handle") ?? "";
    const handle = normalizeHandle(raw);

    if (!handle || handle.length < 3) {
      return jsonError("Handle must be at least 3 characters.");
    }

    await connectDb();
    const taken = await isHandleTaken(handle);

    return jsonOk({
      handle,
      available: !taken,
      message: taken
        ? "That store handle is already registered. Choose another."
        : "This handle is available.",
    });
  } catch (err) {
    console.error("[business/handle]", err);
    return jsonError("Could not check handle. Try again.", 500);
  }
}
