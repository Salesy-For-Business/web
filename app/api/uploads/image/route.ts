import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    const form = await request.formData();
    const file = form.get("file");
    const folderRaw = form.get("folder");
    const folder =
      typeof folderRaw === "string" && folderRaw.trim()
        ? folderRaw.trim()
        : "products";

    if (!(file instanceof File)) {
      return jsonError("Choose an image to upload.");
    }
    if (!file.type.startsWith("image/")) {
      return jsonError("Only image files are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return jsonError("Image must be under 5MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageBuffer(buffer, folder);

    return jsonOk({
      url: uploaded.url,
      publicId: uploaded.publicId,
    });
  } catch (err) {
    console.error("[uploads/image]", err);
    const message =
      err instanceof Error ? err.message : "Could not upload image.";
    return jsonError(message, 500);
  }
}
