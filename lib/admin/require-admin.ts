import { connectDb, User, type ModeratorRole } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getAdminGateFromCookies } from "@/lib/admin/gate";

export type RequireAdminFailure = {
  ok: false;
  status: number;
  error: string;
  reason?: "not-moderator" | "pin-required" | "forbidden";
};

export type RequireAdminSuccess = {
  ok: true;
  userId: string;
  email: string;
  role: ModeratorRole;
};

export async function requireAdmin(
  allowedRoles: ModeratorRole[] | "any",
): Promise<RequireAdminSuccess | RequireAdminFailure> {
  const session = await getSessionFromCookies();
  if (!session) {
    return { ok: false, status: 401, error: "Sign in to continue." };
  }

  await connectDb();
  const user = await User.findById(session.sub);
  if (!user || user.suspended) {
    return { ok: false, status: 401, error: "Sign in to continue." };
  }

  if (!user.isModerator || !user.moderatorRole) {
    return {
      ok: false,
      status: 403,
      error: "You don't have admin access.",
      reason: "not-moderator",
    };
  }

  const gateUserId = await getAdminGateFromCookies();
  if (gateUserId !== String(user._id)) {
    return {
      ok: false,
      status: 401,
      error: "Enter the admin PIN to continue.",
      reason: "pin-required",
    };
  }

  if (allowedRoles !== "any" && !allowedRoles.includes(user.moderatorRole)) {
    return {
      ok: false,
      status: 403,
      error: "You don't have permission to access this section.",
      reason: "forbidden",
    };
  }

  return {
    ok: true,
    userId: String(user._id),
    email: user.email,
    role: user.moderatorRole,
  };
}
