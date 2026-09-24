import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const GOOGLE_STATE_COOKIE = "salesy_google_state";
export const GOOGLE_PENDING_COOKIE = "salesy_google_pending";

export type GoogleIntent = "signin" | "signup";

export type GoogleProfile = {
  email: string;
  firstName: string;
  lastName: string;
};

function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function googleRedirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI || `${appUrl()}/api/auth/google/callback`
  );
}

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Builds the Google consent-screen URL for the given intent, plus a fresh
 * CSRF `state` value the caller must stash in a cookie (`setGoogleStateCookie`)
 * and compare against on the way back.
 */
export function buildGoogleAuthUrl(intent: GoogleIntent) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured");

  const state = `${intent}.${crypto.randomUUID()}`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return { url: `${GOOGLE_AUTH_URL}?${params}`, state };
}

export function intentFromState(state: string | null): GoogleIntent {
  return state?.startsWith("signup.") ? "signup" : "signin";
}

export async function setGoogleStateCookie(state: string) {
  const jar = await cookies();
  jar.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
}

/** Reads and deletes the state cookie (single use, like the code itself). */
export async function consumeGoogleStateCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(GOOGLE_STATE_COOKIE)?.value ?? null;
  jar.delete(GOOGLE_STATE_COOKIE);
  return value;
}

/**
 * Exchanges an authorization code for tokens, then asks Google's userinfo
 * endpoint for the profile behind them — the access token itself is the
 * proof of identity, so there's no need to verify an id_token signature
 * separately.
 */
export async function fetchGoogleProfile(code: string): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google sign-in is not configured");
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed (${tokenRes.status})`);
  }
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) {
    throw new Error("Google did not return an access token");
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileRes.ok) {
    throw new Error(`Google userinfo request failed (${profileRes.status})`);
  }
  const profile = (await profileRes.json()) as {
    email?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
    name?: string;
  };

  if (!profile.email || !profile.email_verified) {
    throw new Error("Google account has no verified email");
  }

  return {
    email: profile.email.trim().toLowerCase(),
    firstName:
      profile.given_name?.trim() || profile.name?.split(" ")[0] || "there",
    lastName: profile.family_name?.trim() || "",
  };
}

/**
 * Short-lived, signed record of a Google-verified identity that hasn't
 * finished signup yet (we still ask for a phone number, which Google
 * doesn't reliably provide). Lets `/api/auth/signup` trust the email/name
 * without believing whatever a client claims — the client only ever
 * supplies the phone number on top of this.
 */
export async function setGooglePendingCookie(profile: GoogleProfile) {
  const token = await new SignJWT({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(GOOGLE_PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
}

export async function readGooglePendingCookie(): Promise<GoogleProfile | null> {
  const jar = await cookies();
  const token = jar.get(GOOGLE_PENDING_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { email, firstName, lastName } = payload as Record<string, unknown>;
    if (
      typeof email !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string"
    ) {
      return null;
    }
    return { email, firstName, lastName };
  } catch {
    return null;
  }
}

export async function clearGooglePendingCookie() {
  const jar = await cookies();
  jar.delete(GOOGLE_PENDING_COOKIE);
}
