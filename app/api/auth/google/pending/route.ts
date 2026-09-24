import { readGooglePendingCookie } from "@/lib/auth/google";
import { jsonError, jsonOk } from "@/lib/api/http";

/** Read-back for the signup form after the Google redirect: the name/email
 * Google verified, held in a short-lived signed cookie set by the OAuth
 * callback. Never trust the client to supply these directly. */
export async function GET() {
  const profile = await readGooglePendingCookie();
  if (!profile) {
    return jsonError("Your Google sign-in expired. Try again.", 404);
  }
  return jsonOk({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
  });
}
