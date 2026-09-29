import { connectDb, AdminAuditLog } from "@/lib/db";

/** Never throws — a logging failure shouldn't break the admin action that
 * triggered it. */
export async function logAdminAction(input: {
  actorUserId: string;
  actorEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await connectDb();
    await AdminAuditLog.create({
      actorUserId: input.actorUserId,
      actorEmail: input.actorEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
    });
  } catch (err) {
    console.error("[admin/audit] failed to record action", input.action, err);
  }
}
