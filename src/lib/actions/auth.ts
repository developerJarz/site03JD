"use server";

import { redirect } from "next/navigation";
import { logActivity, notify } from "@/lib/activity";
import { hashPassword, verifyPassword, getDummyHash } from "@/lib/auth/password";
import { isStaff } from "@/lib/auth/permissions";
import { createSession, destroySession, getRequestMeta, revokeUserSessions } from "@/lib/auth/session";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { getSiteSettings } from "@/lib/data/public";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail, welcomeEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/security/rate-limit";
import { fieldErrors, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validations";
import { PasswordReset } from "@/models/Session";
import { User } from "@/models/User";
import type { Role } from "@/models/shared";
import type { ActionResult } from "./types";

const DB_DOWN: ActionResult = { ok: false, error: "Accounts are unavailable right now — the database is not configured." };

/** Only allow same-site relative redirects (prevents open-redirects). */
function safeNext(next: string | undefined, role: Role): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    if (next.startsWith("/admin") && !isStaff(role)) return "/dashboard";
    return next;
  }
  return isStaff(role) ? "/admin" : "/dashboard";
}

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please check your details.", fieldErrors: fieldErrors(parsed.error) };
  if (!isDbConfigured) return DB_DOWN;

  const { email, password, next } = parsed.data;
  const { ip } = await getRequestMeta();
  const [byIp, byEmail] = await Promise.all([rateLimit("login", ip), rateLimit("login", `email:${email}`)]);
  if (!byIp.ok || !byEmail.ok) {
    return { ok: false, error: `Too many sign-in attempts. Try again in ${Math.ceil(Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds) / 60)} minutes.` };
  }

  await connectDB();
  const user = await User.findOne({ email }).select("+passwordHash");
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) return { ok: false, error: "Incorrect email or password." };
  if (user.status !== "active") return { ok: false, error: "This account is suspended. Please contact support@jarzdigital.com." };

  await createSession(String(user._id));
  user.lastLoginAt = new Date();
  await user.save();
  await logActivity({ actor: { id: String(user._id), name: user.name, role: user.role as Role }, action: "user.login", entityType: "user", entityId: String(user._id), entityLabel: user.email, ip });

  redirect(safeNext(next, user.role as Role));
}

export async function registerAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isDbConfigured) return DB_DOWN;
  const settings = await getSiteSettings();
  if (env.ALLOW_REGISTRATION === "false" || !settings.security.allowRegistration) {
    return { ok: false, error: "New registrations are currently closed. Please contact us instead." };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const { name, email, company, password } = parsed.data;

  const { ip } = await getRequestMeta();
  if (!(await rateLimit("register", ip)).ok) return { ok: false, error: "Too many accounts created from this network. Please try again later." };

  await connectDB();
  if (await User.exists({ email })) {
    return { ok: false, error: "An account with this email already exists.", fieldErrors: { email: "Try signing in or resetting your password." } };
  }

  const user = await User.create({ name, email, company, passwordHash: await hashPassword(password), role: "USER" });
  const id = String(user._id);
  await createSession(id);
  await Promise.all([
    notify({ type: "user", title: `New client account: ${name}`, body: email, href: `/admin/users/${id}` }),
    logActivity({ actor: { id, name, role: "USER" }, action: "user.registered", entityType: "user", entityId: id, entityLabel: email, ip }),
    sendEmail({ to: email, ...welcomeEmail(name) }),
  ]);

  redirect("/dashboard?welcome=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Enter a valid email address.", fieldErrors: fieldErrors(parsed.error) };
  if (!isDbConfigured) return DB_DOWN;

  const { ip } = await getRequestMeta();
  if (!(await rateLimit("forgot", ip)).ok) return { ok: false, error: "Too many requests. Please try again later." };

  const generic: ActionResult = { ok: true, message: "If an account exists for that email, we’ve sent a reset link. It expires in 60 minutes." };
  await connectDB();
  const user = await User.findOne({ email: parsed.data.email, status: "active" });
  if (!user) return generic;

  await PasswordReset.deleteMany({ user: user._id });
  const token = generateToken();
  await PasswordReset.create({ tokenHash: hashToken(token), user: user._id, expiresAt: new Date(Date.now() + 60 * 60_000) });
  await sendEmail({ to: user.email, ...passwordResetEmail(user.name, token) });
  return generic;
}

export async function resetPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  if (!isDbConfigured) return DB_DOWN;

  await connectDB();
  const record = await PasswordReset.findOne({ tokenHash: hashToken(parsed.data.token), usedAt: null, expiresAt: { $gt: new Date() } });
  if (!record) return { ok: false, error: "This reset link is invalid or has expired. Please request a new one." };

  const user = await User.findById(record.user);
  if (!user) return { ok: false, error: "This reset link is invalid or has expired." };
  user.passwordHash = await hashPassword(parsed.data.password);
  user.passwordChangedAt = new Date();
  await user.save();
  record.usedAt = new Date();
  await record.save();
  await revokeUserSessions(String(user._id));
  await logActivity({ actor: { id: String(user._id), name: user.name, role: user.role as Role }, action: "user.reset", entityType: "user", entityId: String(user._id), entityLabel: user.email });

  redirect("/login?reset=1");
}
