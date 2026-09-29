import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { setAdminPin } from "@/lib/admin/pin";
import { jsonError, jsonOk } from "@/lib/api/http";

const pinSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const body = await request.json();
    const parsed = pinSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid code");
    }

    await setAdminPin(parsed.data.code);

    // The code itself is never recorded — only that a change happened.
    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "settings.pin_update",
      targetType: "settings",
    });

    return jsonOk({ updated: true });
  } catch (err) {
    console.error("[admin/settings/pin POST]", err);
    return jsonError("Could not update the admin PIN.", 500);
  }
}
