import { SignJWT, jwtVerify } from "jose";

const DEFAULT_SECRET = "c2FuZGVlcC1wYXJ0eS1tYW5hZ2VyLXN1cGVyLXNlY3JldC1rZXktMjAyNi0xMjM0NQ==";
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || DEFAULT_SECRET);

export const COOKIE_NAME = process.env.COOKIE_NAME || "party_ledger_token";
export const TOKEN_EXPIRY = "7d";

export interface SessionPayload {
  userId: string;
  name?: string;
  displayName?: string;
  mobileNumber?: string;
  phoneNumber?: string;
  username?: string;
  role: "ADMIN" | "USER" | "GLOBAL_ADMIN";
  status?: "ACTIVE" | "PENDING" | "DEACTIVATED";
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
