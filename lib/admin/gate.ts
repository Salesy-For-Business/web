import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_GATE_COOKIE = "salesy_admin_gate";
const GATE_HOURS = 8; // re-enter the shared PIN roughly once a day of use

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminGateToken(sub: string) {
  return new SignJWT({ gate: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${GATE_HOURS}h`)
    .sign(secretKey());
}

export async function readAdminGateToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.gate !== "admin" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function setAdminGateCookie(token: string) {
  const jar = await cookies();
  jar.set(ADMIN_GATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GATE_HOURS * 60 * 60,
  });
}

export async function clearAdminGateCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_GATE_COOKIE);
}

/** Returns the moderator's user id if the PIN gate is verified for this
 * browser, or null. */
export async function getAdminGateFromCookies(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_GATE_COOKIE)?.value;
  if (!token) return null;
  return readAdminGateToken(token);
}
