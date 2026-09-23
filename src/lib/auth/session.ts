import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { env, isProduction } from "@/lib/env";
import { Session } from "@/models/Session";
import { User } from "@/models/User";
import type { Role } from "@/models/shared";
import { SESSION_COOKIE } from "./constants";
import { can, isStaff, type Permission } from "./permissions";
import { generateToken, hashToken } from "./tokens";

export { SESSION_COOKIE };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  company?: string;
  phone?: string;
  title?: string;
}

export async function getRequestMeta() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
  const userAgent = (h.get("user-agent") ?? "").slice(0, 400);
  return { ip, userAgent };
}

export async function createSession(userId: string) {
  await connectDB();
  const token = generateToken();
  const { ip, userAgent } = await getRequestMeta();
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 86400_000);
  await Session.create({ tokenHash: hashToken(token), user: userId, expiresAt, ip, userAgent });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && isDbConfigured) {
    await connectDB();
    await Session.deleteOne({ tokenHash: hashToken(token) });
  }
  jar.delete(SESSION_COOKIE);
}

/** Revokes every session for a user (e.g. after a password change or suspension). */
export async function revokeUserSessions(userId: string, exceptCurrent = false) {
  await connectDB();
  let keep: string | undefined;
  if (exceptCurrent) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    keep = token ? hashToken(token) : undefined;
  }
  await Session.deleteMany({ user: userId, ...(keep ? { tokenHash: { $ne: keep } } : {}) });
}

/**
 * Resolves the current user from the session cookie. Memoised per request.
 * Sessions slide forward when more than a day has passed since last use.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!isDbConfigured) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;
  await connectDB();
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  const user = await User.findById(session.user).lean();
  if (!user || user.status !== "active") return null;

  if (Date.now() - new Date(session.lastSeenAt ?? session.createdAt).getTime() > 86400_000) {
    await Session.updateOne(
      { _id: session._id },
      { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + env.SESSION_TTL_DAYS * 86400_000) },
    );
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as Role,
    avatar: user.avatar ?? undefined,
    company: user.company ?? undefined,
    phone: user.phone ?? undefined,
    title: user.title ?? undefined,
  };
});

/* --------------------------------- Guards --------------------------------- */

export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (!isStaff(user.role)) redirect("/forbidden");
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (!can(user.role, permission)) redirect("/forbidden");
  return user;
}

export class AuthError extends Error {
  constructor(message = "You are not allowed to perform this action.") {
    super(message);
    this.name = "AuthError";
  }
}

/** For server actions / route handlers: throws instead of redirecting. */
export async function assertPermission(permission: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, permission)) throw new AuthError();
  return user;
}

export async function assertUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Please sign in to continue.");
  return user;
}
