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
    phone: u.phone,
    provider: u.provider,
    emailVerified: u.emailVerified,
    isModerator: Boolean(u.isModerator),
    moderatorRole: u.moderatorRole ?? null,
    suspended: Boolean(u.suspended),
    createdAt: u.createdAt,
  };
}

// Moderator fields are deliberately excluded — role changes only ever
// happen through /api/admin/moderators, one audited code path.
const updateSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(1).optional(),
  suspended: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    await connectDb();
    const user = await User.findById(id).lean<UserLean | null>();
    if (!user) return jsonError("User not found.", 404);

    return jsonOk({ user: toPublic(user) });
  } catch (err) {
    console.error("[admin/users/:id GET]", err);
    return jsonError("Could not load user.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid update");
    }

    await connectDb();
    const user = await User.findByIdAndUpdate(id, parsed.data, {
      new: true,
    }).lean<UserLean | null>();
    if (!user) return jsonError("User not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "user.update",
      targetType: "user",
      targetId: id,
      metadata: { after: parsed.data },
    });

    return jsonOk({ user: toPublic(user) });
  } catch (err) {
    console.error("[admin/users/:id PATCH]", err);
    return jsonError("Could not update user.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { id } = await params;
    if (id === admin.userId) {
      return jsonError("You can't delete your own account.", 400);
    }

    await connectDb();
    const user = await User.findByIdAndDelete(id).lean<UserLean | null>();
    if (!user) return jsonError("User not found.", 404);

    await logAdminAction({
      actorUserId: admin.userId,
      actorEmail: admin.email,
      action: "user.delete",
      targetType: "user",
      targetId: id,
      metadata: { email: user.email },
    });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error("[admin/users/:id DELETE]", err);
    return jsonError("Could not delete user.", 500);
  }
}
