import { requireAdmin } from "@/lib/admin/require-admin";
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

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    await connectDb();
    const filter = q
      ? {
          $or: [
            { email: { $regex: q, $options: "i" } },
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<UserLean[]>();

    return jsonOk({ users: users.map(toPublic) });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return jsonError("Could not load users.", 500);
  }
}
