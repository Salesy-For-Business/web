import { requireAdmin } from "@/lib/admin/require-admin";
import { connectDb, AdminAuditLog, type AdminAuditLogLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function GET() {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    await connectDb();
    const entries = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(300)
      .lean<AdminAuditLogLean[]>();

    return jsonOk({
      entries: entries.map((e) => ({
        id: String(e._id),
        actorEmail: e.actorEmail,
        action: e.action,
        targetType: e.targetType ?? null,
        targetId: e.targetId ?? null,
        metadata: e.metadata ?? null,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    console.error("[admin/audit-log GET]", err);
    return jsonError("Could not load audit log.", 500);
  }
}
