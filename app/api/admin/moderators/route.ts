import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { logAdminAction } from "@/lib/admin/audit";
import { connectDb, User, type UserLean } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";

function toPublic(u: UserLean) {
  return {
    id: String(u._id),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    moderatorRole: u.moderatorRole ?? null,
  };
}

export async function GET() {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    await connectDb();
    const moderators = await User.find({ isModerator: true })
      .sort({ createdAt: -1 })
      .lean<UserLean[]>();

    return jsonOk({ moderators: moderators.map(toPublic) });
  } catch (err) {
    console.error("[admin/moderators GET]", err);
    return jsonError("Could not load moderators.", 500);
  }
}

const assignSchema = z.object({
  email: z.string().trim().email(),
  moderatorRole: z.enum(["support", "finance", "superadmin"]).nullable(),
});

/** The single code path for role changes — deliberately separate from the
 * generic user editor so every promotion/revocation is easy to audit. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");
    }

    await connectDb();
    const target = await User.findOne({
      email: parsed.data.email.trim().toLowerCase(),
    });
    if (!target) return jsonError("No account found for that email.", 404);

    if (parsed.data.moderatorRole) {
      target.isModerator = true;
      target.moderatorRole = parsed.data.moderatorRole;
    } else {
      target.isModerator = false;
      target.moderatorRole = undefined;
    }
    await target.save();

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: parsed.data.moderatorRole ? "moderator.assign" : "moderator.revoke",
      targetType: "user",
      targetId: String(target._id),
      metadata: { email: target.email, role: parsed.data.moderatorRole },
    });

    return jsonOk({ moderator: toPublic(target.toObject()) });
  } catch (err) {
    console.error("[admin/moderators POST]", err);
    return jsonError("Could not update moderator.", 500);
  }
}
