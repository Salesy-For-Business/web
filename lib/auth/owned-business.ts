import { Types } from "mongoose";
import { connectDb, Business, User, type IBusiness } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";

export type OwnedBusiness = IBusiness & { _id: Types.ObjectId };

export async function requireOwnedBusiness(): Promise<
  | { ok: true; userId: string; business: OwnedBusiness }
  | { ok: false; status: number; error: string }
> {
  const session = await getSessionFromCookies();
  if (!session) {
    return { ok: false, status: 401, error: "Sign in to continue." };
  }

  await connectDb();
  const user = await User.findById(session.sub);
  if (!user) {
    return { ok: false, status: 401, error: "Sign in to continue." };
  }

  const business = await Business.findOne({
    userId: user._id,
  }).lean<OwnedBusiness | null>();

  if (!business) {
    return {
      ok: false,
      status: 403,
      error: "Create your business profile first.",
    };
  }

  return { ok: true, userId: String(user._id), business };
}

export function slugifyProductName(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "product";
}

export async function uniqueProductSlug(
  businessId: Types.ObjectId,
  base: string,
  excludeId?: Types.ObjectId | string,
) {
  const { Product } = await import("@/lib/db");
  let slug = base;
  let n = 0;
  for (;;) {
    const query: Record<string, unknown> = { businessId, slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await Product.exists(query);
    if (!exists) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}
