import type { NextRequest } from "next/server";
import { connectDb, Business, User } from "@/lib/db";
import {
  consumeGoogleStateCookie,
  fetchGoogleProfile,
  intentFromState,
  setGooglePendingCookie,
} from "@/lib/auth/google";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { statusFor } from "@/lib/auth/session-user";

function redirectTo(request: NextRequest, path: string) {
  return Response.redirect(new URL(path, request.url));
}

/**
 * Google redirects the browser here with `code`/`state` (or `error`).
 * - Existing account with this email + provider "google" → real session,
 *   straight into the dashboard (or business setup if that's still pending).
 * - No account, intent was "signup" → hand the verified identity to the
 *   signup form via a short-lived signed cookie; it still needs a phone
 *   number before it can create the account.
 * - No account, intent was "signin" → nothing to sign into.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const savedState = await consumeGoogleStateCookie();
  const intent = intentFromState(state);
  const signinPath = "/signin?error=google-failed";
  const signupPath = "/signup?error=google-failed";

  if (error) {
    return redirectTo(
      request,
      intent === "signup" ? "/signup" : "/signin?error=google-cancelled",
    );
  }
  if (!code || !state || !savedState || state !== savedState) {
    return redirectTo(request, intent === "signup" ? signupPath : signinPath);
  }

  try {
    const profile = await fetchGoogleProfile(code);
    await connectDb();
    const existing = await User.findOne({ email: profile.email });

    if (existing) {
      if (existing.provider !== "google") {
        return redirectTo(request, "/signin?error=google-wrong-provider");
      }

      const business = await Business.findOne({ userId: existing._id }).lean();
      const status = statusFor(existing.toObject(), business);
      const token = await createSessionToken({
        sub: String(existing._id),
        email: existing.email,
      });
      await setSessionCookie(token);

      return redirectTo(
        request,
        status === "pendingBusiness" ? "/signup/business" : "/dashboard",
      );
    }

    if (intent === "signin") {
      return redirectTo(request, "/signin?error=google-no-account");
    }

    // New signup — still need a phone number, so hold the verified profile
    // and let the existing signup form collect it.
    await setGooglePendingCookie(profile);
    return redirectTo(request, "/signup?google=1");
  } catch (err) {
    console.error("[auth/google/callback]", err);
    return redirectTo(request, intent === "signup" ? signupPath : signinPath);
  }
}
