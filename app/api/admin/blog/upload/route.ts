import { requireAdmin } from "@/lib/admin/require-admin";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { jsonError, jsonOk } from "@/lib/api/http";

/** Mirrors `/api/uploads/image`, which is gated to business owners — blog
 * images are composed by a superadmin, who may not own a business at all. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const form = await request.formData();
    const file = form.get("file");
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
    const uploaded = await uploadImageBuffer(buffer, "blog");

    return jsonOk({ url: uploaded.url, publicId: uploaded.publicId });
  } catch (err) {
    console.error("[admin/blog/upload]", err);
    const message = err instanceof Error ? err.message : "Could not upload image.";
    return jsonError(message, 500);
  }
}
