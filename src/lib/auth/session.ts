import { cookies } from "next/headers";
import { COOKIE_NAME, verifyToken, SessionPayload } from "./jwt";
import { findUserById } from "../storage";
import { User } from "@/types/ledger";

export async function getCurrentUser(): Promise<Omit<User, "password"> | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await findUserById(payload.userId);
  if (!user || user.status !== "ACTIVE") return null;

  const { password, ...safeUser } = user;
  return safeUser;
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export function isAdminUser(user: { role?: string } | null): boolean {
  return user?.role === "ADMIN" || user?.role === "GLOBAL_ADMIN";
}
