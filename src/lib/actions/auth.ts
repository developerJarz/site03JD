"use server";

import { redirect } from "next/navigation";
import { logActivity, notify } from "@/lib/activity";
import { hashPassword, verifyPassword, getDummyHash } from "@/lib/auth/password";
import { isStaff } from "@/lib/auth/permissions";
import { createSession, destroySession, getRequestMeta, revokeUserSessions } from "@/lib/auth/session";
import { OTP_TTL_MINUTES, consumeOtp, hasOtpRecord, issueOtp, verifyOtp } from "@/lib/auth/otp";
import { getSiteSettings } from "@/lib/data/public";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { sendEmail } from "@/lib/email";
import { otpEmail, welcomeEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/security/rate-limit";
import { fieldErrors, forgotPasswordSchema, loginSchema, registerSchema, resendCodeSchema, resetPasswordSchema, verifyEmailSchema } from "@/lib/validations";
import { User } from "@/models/User";
import type { Role } from "@/models/shared";
import type { ActionResult } from "./types";

const DB_DOWN: ActionResult<never> = { ok: false, error: "Accounts are unavailable right now — the database is not configured." };

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

async function registrationOpen() {
  const settings = await getSiteSettings();
  return env.ALLOW_REGISTRATION !== "false" && settings.security.allowRegistration;
}

const CLOSED: ActionResult<never> = { ok: false, error: "New registrations are currently closed. Please contact us instead." };
const SEND_FAILED: ActionResult<never> = { ok: false, error: "We couldn’t send the email right now. Please try again in a few minutes." };
const wait = (seconds: number): ActionResult<never> => ({ ok: false, error: `A code was just sent. You can request a new one in ${seconds} seconds.` });

/** Step 1 of sign-up: validate the details and email a 6-digit code. No account exists until the code is confirmed. */
export async function registerAction(_prev: ActionResult<{ email: string }>, formData: FormData): Promise<ActionResult<{ email: string }>> {
  if (!isDbConfigured) return DB_DOWN;
  if (!(await registrationOpen())) return CLOSED;

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const { name, email, company, password } = parsed.data;

  const { ip } = await getRequestMeta();
  const [byIp, byEmail] = await Promise.all([rateLimit("register", ip), rateLimit("otpSend", `email:${email}`)]);
  if (!byIp.ok || !byEmail.ok) return { ok: false, error: "Too many sign-up attempts. Please try again later." };

  await connectDB();
  if (await User.exists({ email })) {
    return { ok: false, error: "An account with this email already exists.", fieldErrors: { email: "Try signing in or resetting your password." } };
  }

  const issued = await issueOtp(email, "register", { name, company, passwordHash: await hashPassword(password) });
  if (!issued.ok) return { ok: true, message: `We already sent a code to ${email}. Enter it below.`, data: { email } };
  if (!(await sendEmail({ to: email, ...otpEmail(issued.code, "register", OTP_TTL_MINUTES, name) }))) return SEND_FAILED;

  return { ok: true, message: `We sent a 6-digit code to ${email}.`, data: { email } };
}

/** Step 2 of sign-up: check the code, then create the account and sign in. */
export async function verifyRegistrationAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isDbConfigured) return DB_DOWN;
  const parsed = verifyEmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please check the code.", fieldErrors: fieldErrors(parsed.error) };
  const { email, code } = parsed.data;

  const { ip } = await getRequestMeta();
  if (!(await rateLimit("otpVerify", ip)).ok) return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };

  await connectDB();
  const result = await verifyOtp(email, "register", code);
  if (!result.ok) return { ok: false, error: result.error };

  const pending = result.record.pending;
  if (!pending?.name || !pending.passwordHash) {
    await consumeOtp(email, "register");
    return { ok: false, error: "Your sign-up details have expired. Please fill in the form again." };
  }
  if (!(await registrationOpen())) return CLOSED;
  if (await User.exists({ email })) {
    await consumeOtp(email, "register");
    return { ok: false, error: "An account with this email already exists. Please sign in." };
  }

  const { name } = pending;
  const user = await User.create({
    name,
    email,
    company: pending.company || undefined,
    passwordHash: pending.passwordHash,
    role: "USER",
    emailVerifiedAt: new Date(),
  });
  await consumeOtp(email, "register");
  const id = String(user._id);
  await createSession(id);
  await Promise.all([
    notify({ type: "user", title: `New client account: ${name}`, body: email, href: `/admin/users/${id}` }),
    logActivity({ actor: { id, name, role: "USER" }, action: "user.registered", entityType: "user", entityId: id, entityLabel: email, ip }),
    sendEmail({ to: email, ...welcomeEmail(name) }),
  ]);

  redirect("/dashboard?welcome=1");
}

/** Sends a fresh code for a pending sign-up or a password reset. */
export async function resendCodeAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isDbConfigured) return DB_DOWN;
  const parsed = resendCodeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Something went wrong. Please start again." };
  const { email, purpose } = parsed.data;

  const { ip } = await getRequestMeta();
  const [byIp, byEmail] = await Promise.all([rateLimit("otpSend", ip), rateLimit("otpSend", `email:${email}`)]);
  if (!byIp.ok || !byEmail.ok) return { ok: false, error: "Too many codes requested. Please try again later." };

  await connectDB();
  const sent: ActionResult = { ok: true, message: `A new code is on its way to ${email}.` };

  if (purpose === "register") {
    if (!(await hasOtpRecord(email, "register"))) return { ok: false, error: "Your sign-up has expired. Please fill in the form again." };
    const issued = await issueOtp(email, "register");
    if (!issued.ok) return wait(issued.retryAfterSeconds);
    return (await sendEmail({ to: email, ...otpEmail(issued.code, "register", OTP_TTL_MINUTES) })) ? sent : SEND_FAILED;
  }

  // Password reset: same answer whether or not the account exists.
  const user = await User.findOne({ email, status: "active" });
  if (!user) return sent;
  const issued = await issueOtp(email, "reset");
  if (!issued.ok) return wait(issued.retryAfterSeconds);
  await sendEmail({ to: email, ...otpEmail(issued.code, "reset", OTP_TTL_MINUTES, user.name) });
  return sent;
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

/** Step 1 of a password reset: email a 6-digit code. The reply never reveals whether the account exists. */
export async function forgotPasswordAction(_prev: ActionResult<{ email: string }>, formData: FormData): Promise<ActionResult<{ email: string }>> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Enter a valid email address.", fieldErrors: fieldErrors(parsed.error) };
  if (!isDbConfigured) return DB_DOWN;
  const { email } = parsed.data;

  const { ip } = await getRequestMeta();
  const [byIp, byEmail] = await Promise.all([rateLimit("forgot", ip), rateLimit("otpSend", `email:${email}`)]);
  if (!byIp.ok || !byEmail.ok) return { ok: false, error: "Too many requests. Please try again later." };

  const generic = {
    ok: true as const,
    message: `If an account exists for ${email}, we’ve sent it a 6-digit code. It expires in ${OTP_TTL_MINUTES} minutes.`,
    data: { email },
  };
  await connectDB();
  const user = await User.findOne({ email, status: "active" });
  if (!user) return generic;

  const issued = await issueOtp(email, "reset");
  // Within the resend cooldown the earlier code is still valid, so just continue.
  if (issued.ok) await sendEmail({ to: email, ...otpEmail(issued.code, "reset", OTP_TTL_MINUTES, user.name) });
  return generic;
}

/** Step 2 of a password reset: check the code and set the new password. */
export async function resetPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  if (!isDbConfigured) return DB_DOWN;
  const { email, code, password } = parsed.data;

  const { ip } = await getRequestMeta();
  if (!(await rateLimit("otpVerify", ip)).ok) return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };

  await connectDB();
  const result = await verifyOtp(email, "reset", code);
  if (!result.ok) return { ok: false, error: result.error };

  const user = await User.findOne({ email, status: "active" });
  if (!user) {
    await consumeOtp(email, "reset");
    return { ok: false, error: "This code is no longer valid. Please request a new one." };
  }
  user.passwordHash = await hashPassword(password);
  user.passwordChangedAt = new Date();
  user.emailVerifiedAt ??= new Date();
  await user.save();
  await consumeOtp(email, "reset");
  await revokeUserSessions(String(user._id));
  await logActivity({
    actor: { id: String(user._id), name: user.name, role: user.role as Role },
    action: "user.reset",
    entityType: "user",
    entityId: String(user._id),
    entityLabel: user.email,
    ip,
  });

  redirect("/login?reset=1");
}
