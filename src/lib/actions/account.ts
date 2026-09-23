"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity, notify } from "@/lib/activity";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { AuthError, assertUser, getRequestMeta, revokeUserSessions } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/public";
import { connectDB } from "@/lib/db/connect";
import { sendEmail } from "@/lib/email";
import { projectRequestNotificationEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/security/rate-limit";
import { changePasswordSchema, fieldErrors, preferencesSchema, profileSchema, projectRequestSchema } from "@/lib/validations";
import { Service } from "@/models/content";
import { ProjectRequest } from "@/models/operations";
import { User } from "@/models/User";
import type { ActionResult } from "./types";

async function guard(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    if (err && typeof err === "object" && "digest" in err) throw err; // let redirect() through
    console.error("[account action]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function createProjectRequestAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await assertUser().catch(() => null);
  if (!user) return { ok: false, error: "Please sign in again." };
  const parsed = projectRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  if (!(await rateLimit("contact", `user:${user.id}`)).ok) return { ok: false, error: "You’ve submitted several requests recently. Please try again later." };

  await connectDB();
  const service = parsed.data.service ? await Service.findOne({ slug: parsed.data.service }).select("_id title").lean() : null;
  const req = await ProjectRequest.create({
    user: user.id,
    title: parsed.data.title,
    service: service?._id,
    serviceName: service?.title,
    description: parsed.data.description,
    budget: parsed.data.budget,
    timeline: parsed.data.timeline,
    website: parsed.data.website,
  });
  const id = String(req._id);
  const { ip } = await getRequestMeta();
  await Promise.all([
    notify({ type: "request", title: `New project request: ${parsed.data.title}`, body: `${user.name}${service ? ` · ${service.title}` : ""}`, href: `/admin/requests/${id}` }),
    logActivity({ actor: user, action: "project-request.created", entityType: "request", entityId: id, entityLabel: parsed.data.title, ip }),
  ]);
  const settings = await getSiteSettings();
  const recipients = [...new Set([...(settings.email.adminRecipients ?? []), env.ADMIN_NOTIFICATION_EMAIL].filter(Boolean) as string[])];
  if (recipients.length) await sendEmail({ to: recipients, ...projectRequestNotificationEmail({ id, title: parsed.data.title, clientName: user.name, service: service?.title }) });

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/requests/${id}?created=1`);
}

export async function updateProfileAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const parsed = profileSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
    await User.updateOne({ _id: user.id }, { $set: { name: parsed.data.name, company: parsed.data.company ?? "", phone: parsed.data.phone ?? "", title: parsed.data.title ?? "" } });
    revalidatePath("/dashboard", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Profile updated." };
  });
}

export async function changePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
    if (!(await rateLimit("login", `pw:${user.id}`)).ok) return { ok: false, error: "Too many attempts. Please wait a few minutes." };
    const doc = await User.findById(user.id).select("+passwordHash");
    if (!doc || !(await verifyPassword(parsed.data.currentPassword, doc.passwordHash))) {
      return { ok: false, error: "Your current password is incorrect.", fieldErrors: { currentPassword: "Incorrect password" } };
    }
    doc.passwordHash = await hashPassword(parsed.data.password);
    doc.passwordChangedAt = new Date();
    await doc.save();
    await revokeUserSessions(user.id, true);
    await logActivity({ actor: user, action: "user.reset", entityType: "user", entityId: user.id, entityLabel: user.email });
    return { ok: true, message: "Password changed. Other devices have been signed out." };
  });
}

export async function updatePreferencesAction(prefs: { emailNotifications: boolean; productUpdates: boolean }): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const parsed = preferencesSchema.safeParse(prefs);
    if (!parsed.success) return { ok: false, error: "Invalid preferences." };
    await User.updateOne({ _id: user.id }, { $set: { preferences: parsed.data } });
    return { ok: true, message: "Preferences saved." };
  });
}

export async function signOutOtherSessionsAction(): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    await revokeUserSessions(user.id, true);
    return { ok: true, message: "Signed out of all other devices." };
  });
}
