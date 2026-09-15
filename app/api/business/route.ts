import { connectDb, Business, User } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  isHandleTaken,
  normalizeHandle,
  toPublicBusiness,
  toPublicUser,
} from "@/lib/auth/session-user";
import { jsonError, jsonOk } from "@/lib/api/http";
import { businessSchema } from "@/lib/auth-schemas";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return jsonError("Sign in to continue.", 401);
    }

    const body = await request.json();
    const parsed = businessSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Invalid business details",
      );
    }

    const values = parsed.data;
    await connectDb();

    const user = await User.findById(session.sub);
    if (!user) {
      return jsonError("Sign in to continue.", 401);
    }
    if (!user.emailVerified) {
      return jsonError("Verify your email before creating a store.", 403);
    }

    const existingBiz = await Business.findOne({ userId: user._id });
    if (existingBiz) {
      return jsonError("You already have a store on this account.", 409);
    }

    const storeHandle = normalizeHandle(values.storeHandle);
    if (await isHandleTaken(storeHandle)) {
      return jsonError(
        "That store handle is already registered. Choose another.",
        409,
        { field: "storeHandle" },
      );
    }

    const businessEmail = values.usePersonalEmail
      ? user.email
      : (values.businessEmail ?? "").trim().toLowerCase();
    const businessPhone = values.usePersonalPhone
      ? user.phone
      : (values.businessPhone as string);

    const business = await Business.create({
      userId: user._id,
      businessName: values.businessName.trim(),
      businessEmail,
      businessPhone,
      logoDataUrl: values.logoDataUrl,
      hasPhysicalAddress: values.hasPhysicalAddress,
      street: values.hasPhysicalAddress ? values.street : undefined,
      city: values.hasPhysicalAddress ? values.city : undefined,
      state: values.hasPhysicalAddress ? values.state : undefined,
      description: values.description.trim(),
      ownerFirstName: values.useProfileOwner
        ? user.firstName
        : (values.ownerFirstName ?? ""),
      ownerLastName: values.useProfileOwner
        ? user.lastName
        : (values.ownerLastName ?? ""),
      ownerEmail: values.useProfileOwner
        ? user.email
        : (values.ownerEmail ?? "").trim().toLowerCase(),
      ownerPhone: values.useProfileOwner
        ? user.phone
        : (values.ownerPhone as string),
      ownerRole: values.ownerRole,
      isRegistered: values.isRegistered,
      cacNumber: values.isRegistered ? values.cacNumber?.trim() : undefined,
      plan: "free",
      storeHandle,
      liveChatEnabled: false,
      liveChatProvider: "smartsupp",
      liveChatSnippet: "",
    });

    return jsonOk({
      next: "signedIn" as const,
      user: toPublicUser(user.toObject()),
      business: toPublicBusiness(business.toObject()),
    });
  } catch (err) {
    console.error("[business]", err);
    const message = String(err);
    if (message.includes("E11000") && message.includes("storeHandle")) {
      return jsonError(
        "That store handle is already registered. Choose another.",
        409,
        { field: "storeHandle" },
      );
    }
    return jsonError("Could not save your business. Try again.", 500);
  }
}
