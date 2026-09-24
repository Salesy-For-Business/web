import type { NextRequest } from "next/server";
import {
  buildGoogleAuthUrl,
  isGoogleConfigured,
  setGoogleStateCookie,
  type GoogleIntent,
} from "@/lib/auth/google";

/** Kicks off "Continue with Google" — a plain top-level redirect, not a
 * fetch, since the browser needs to actually navigate to Google. */
export async function GET(request: NextRequest) {
  const intentParam = request.nextUrl.searchParams.get("intent");
  const intent: GoogleIntent = intentParam === "signup" ? "signup" : "signin";

  if (!isGoogleConfigured()) {
    const fallback = intent === "signup" ? "/signup" : "/signin";
    return Response.redirect(
      new URL(`${fallback}?error=google-unavailable`, request.url),
    );
  }

  const { url, state } = buildGoogleAuthUrl(intent, request.nextUrl.origin);
  await setGoogleStateCookie(state);
  return Response.redirect(url);
}
