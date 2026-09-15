import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashOtp(code: string) {
  return bcrypt.hash(code, 8);
}

export async function verifyOtpCode(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
