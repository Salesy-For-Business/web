import { Types } from "mongoose";
import {
  connectDb,
  User,
  Business,
  type IUser,
  type IBusiness,
} from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { AuthBusiness, AuthStatus, AuthUser } from "@/lib/auth-store";

type UserLike = IUser & { _id: Types.ObjectId };
type BusinessLike = IBusiness & { _id: Types.ObjectId };

export function toPublicUser(doc: UserLike): AuthUser {
  return {
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    password: null,
    provider: doc.provider as AuthUser["provider"],
    emailVerified: doc.emailVerified,
  };
}

export function toPublicBusiness(doc: BusinessLike): AuthBusiness {
  return {
    businessName: doc.businessName,
    businessEmail: doc.businessEmail,
    businessPhone: doc.businessPhone,
    websiteUrl: doc.websiteUrl || undefined,
    logoDataUrl: doc.logoDataUrl || undefined,
    socialImageUrl: doc.socialImageUrl || undefined,
    hasPhysicalAddress: doc.hasPhysicalAddress,
    street: doc.street || undefined,
    city: doc.city || undefined,
    state: doc.state || undefined,
    description: doc.description,
    ownerFirstName: doc.ownerFirstName,
    ownerLastName: doc.ownerLastName,
    ownerEmail: doc.ownerEmail,
    ownerPhone: doc.ownerPhone,
    ownerRole: doc.ownerRole as AuthBusiness["ownerRole"],
    isRegistered: doc.isRegistered,
    cacNumber: doc.cacNumber || undefined,
    plan: doc.plan as AuthBusiness["plan"],
    storeHandle: doc.storeHandle,
    liveChatEnabled: doc.liveChatEnabled,
    liveChatProvider: doc.liveChatProvider as AuthBusiness["liveChatProvider"],
    liveChatSnippet: doc.liveChatSnippet,
  };
}

export function statusFor(
  user: UserLike | null,
  business: BusinessLike | null,
): AuthStatus {
  if (!user) return "anonymous";
  if (!user.emailVerified) return "pendingVerify";
  if (!business) return "pendingBusiness";
  return "signedIn";
}

export type AuthSession = {
  status: AuthStatus;
  user: AuthUser | null;
  business: AuthBusiness | null;
  userId: string | null;
};

export async function getAuthSession(): Promise<AuthSession> {
  await connectDb();
  const session = await getSessionFromCookies();
  if (!session) {
    return { status: "anonymous", user: null, business: null, userId: null };
  }

  if (!Types.ObjectId.isValid(session.sub)) {
    return { status: "anonymous", user: null, business: null, userId: null };
  }

  const user = await User.findById(session.sub).lean<UserLike | null>();
  if (!user) {
    return { status: "anonymous", user: null, business: null, userId: null };
  }

  const business = await Business.findOne({
    userId: user._id,
  }).lean<BusinessLike | null>();

  return {
    status: statusFor(user, business),
    user: toPublicUser(user),
    business: business ? toPublicBusiness(business) : null,
    userId: String(user._id),
  };
}

export function slugifyHandle(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return slug || "mystore";
}

export function normalizeHandle(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
}

export async function isHandleTaken(
  handle: string,
  excludeUserId?: Types.ObjectId | string,
): Promise<boolean> {
  await connectDb();
  const query: Record<string, unknown> = { storeHandle: handle };
  if (excludeUserId) {
    query.userId = { $ne: excludeUserId };
  }
  const existing = await Business.exists(query);
  return Boolean(existing);
}
