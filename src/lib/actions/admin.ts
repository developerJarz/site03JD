"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { logActivity, notify } from "@/lib/activity";
import { AuthError, assertPermission, assertUser, revokeUserSessions } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/permissions";
import { TAGS } from "@/lib/data/cache-tags";
import { connectDB } from "@/lib/db/connect";
import { sendEmail } from "@/lib/email";
import { requestUpdateEmail } from "@/lib/email/templates";
import { LEAD_STATUSES, ROLES } from "@/models/shared";
import { Lead, Message, Notification, ProjectRequest, SiteSettingsModel } from "@/models/operations";
import { User } from "@/models/User";
import type { ActionResult } from "./types";

const oid = z.string().regex(/^[a-f0-9]{24}$/);
const status = z.enum(LEAD_STATUSES);

async function guard<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    console.error("[admin action]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/* ---------------------------------- Leads ---------------------------------- */

export async function updateLeadStatusAction(id: string, next: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertPermission("leads:manage");
    const p = z.object({ id: oid, next: status }).safeParse({ id, next });
    if (!p.success) return { ok: false, error: "Invalid status." };
    const lead = await Lead.findByIdAndUpdate(id, { status: p.data.next }).lean();
    if (!lead) return { ok: false, error: "Lead not found." };
    await logActivity({ actor: user, action: "lead.status", entityType: "lead", entityId: id, entityLabel: lead.name, meta: { from: lead.status, to: p.data.next } });
    revalidatePath(`/admin/leads/${id}`);
    revalidatePath("/admin/leads");
    return { ok: true, message: "Status updated." };
  });
}

export async function addLeadNoteAction(id: string, body: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertPermission("leads:manage");
    const p = z.object({ id: oid, body: z.string().trim().min(1, "Write a note").max(2000) }).safeParse({ id, body });
    if (!p.success) return { ok: false, error: p.error.issues[0].message };
    const lead = await Lead.findByIdAndUpdate(id, { $push: { notes: { author: user.id, authorName: user.name, body: p.data.body } } }).lean();
    if (!lead) return { ok: false, error: "Lead not found." };
    await logActivity({ actor: user, action: "lead.note", entityType: "lead", entityId: id, entityLabel: lead.name });
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true, message: "Note added." };
  });
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertPermission("leads:manage");
    if (!oid.safeParse(id).success) return { ok: false, error: "Invalid lead." };
    const lead = await Lead.findByIdAndDelete(id).lean();
    if (!lead) return { ok: false, error: "Lead not found." };
    await logActivity({ actor: user, action: "lead.deleted", entityType: "lead", entityId: id, entityLabel: lead.name });
    revalidatePath("/admin/leads");
    return { ok: true, message: "Lead deleted." };
  });
}

/* ----------------------------- Project requests ---------------------------- */

export async function updateRequestAction(id: string, patch: { status?: string; progress?: number }): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertPermission("requests:manage");
    const p = z.object({ id: oid, status: status.optional(), progress: z.number().int().min(0).max(100).optional() }).safeParse({ id, ...patch });
    if (!p.success) return { ok: false, error: "Invalid update." };
    const before = await ProjectRequest.findById(id).populate<{ user: { _id: string; name: string; email: string; preferences?: { emailNotifications?: boolean } } }>("user", "name email preferences").lean();
    if (!before) return { ok: false, error: "Request not found." };
    const set: Record<string, unknown> = {};
    if (p.data.status) set.status = p.data.status;
    if (p.data.progress !== undefined) set.progress = p.data.progress;
    if (p.data.status === "COMPLETED") set.progress = 100;
    await ProjectRequest.updateOne({ _id: id }, { $set: set });

    if (p.data.status && p.data.status !== before.status && before.user) {
      const label = p.data.status.replace("_", " ").toLowerCase();
      await notify({ type: "request", title: `“${before.title}” is now ${label}`, href: `/dashboard/requests/${id}`, recipient: String(before.user._id) });
      if (before.user.preferences?.emailNotifications !== false) {
        await sendEmail({ to: before.user.email, ...requestUpdateEmail(before.user.name, before.title, `Status changed to ${label}.`, id) });
      }
    }
    await logActivity({ actor: user, action: "project-request.status", entityType: "request", entityId: id, entityLabel: before.title, meta: set });
    revalidatePath(`/admin/requests/${id}`);
    return { ok: true, message: "Request updated." };
  });
}

/** A message on a project request, from staff or from the owning client. */
export async function sendRequestMessageAction(requestId: string, body: string): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const p = z.object({ requestId: oid, body: z.string().trim().min(1, "Write a message").max(4000) }).safeParse({ requestId, body });
    if (!p.success) return { ok: false, error: p.error.issues[0].message };
    const req = await ProjectRequest.findById(requestId).populate<{ user: { _id: string; name: string; email: string; preferences?: { emailNotifications?: boolean } } }>("user", "name email preferences").lean();
    if (!req) return { ok: false, error: "Request not found." };

    const staff = isStaff(user.role);
    if (staff) await assertPermission("requests:manage");
    else if (String(req.user?._id) !== user.id) return { ok: false, error: "You can only message on your own requests." };

    await Message.create({ request: requestId, sender: user.id, senderName: user.name, fromStaff: staff, body: p.data.body, readByStaff: staff, readByClient: !staff });
    await ProjectRequest.updateOne({ _id: requestId }, { lastMessageAt: new Date() });

    if (staff && req.user) {
      await notify({ type: "message", title: `New message on “${req.title}”`, body: p.data.body.slice(0, 140), href: `/dashboard/requests/${requestId}`, recipient: String(req.user._id) });
      if (req.user.preferences?.emailNotifications !== false) await sendEmail({ to: req.user.email, ...requestUpdateEmail(req.user.name, req.title, p.data.body, requestId) });
      await logActivity({ actor: user, action: "project-request.replied", entityType: "request", entityId: requestId, entityLabel: req.title });
    } else {
      await notify({ type: "message", title: `${user.name} replied on “${req.title}”`, body: p.data.body.slice(0, 140), href: `/admin/requests/${requestId}` });
    }
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath(`/dashboard/requests/${requestId}`);
    return { ok: true, message: "Message sent." };
  });
}

/* ---------------------------------- Users ---------------------------------- */

export async function updateUserRoleAction(id: string, role: string): Promise<ActionResult> {
  return guard(async () => {
    const actor = await assertPermission("users:manage");
    const p = z.object({ id: oid, role: z.enum(ROLES) }).safeParse({ id, role });
    if (!p.success) return { ok: false, error: "Invalid role." };
    if (id === actor.id && p.data.role !== "ADMIN") return { ok: false, error: "You can’t remove your own admin role." };
    const target = await User.findById(id);
    if (!target) return { ok: false, error: "User not found." };
    if (target.role === "ADMIN" && p.data.role !== "ADMIN" && (await User.countDocuments({ role: "ADMIN", status: "active" })) <= 1) {
      return { ok: false, error: "At least one active admin is required." };
    }
    const from = target.role;
    target.role = p.data.role;
    await target.save();
    await revokeUserSessions(id);
    await logActivity({ actor, action: "user.role", entityType: "user", entityId: id, entityLabel: target.email, meta: { from, to: p.data.role } });
    revalidatePath(`/admin/users/${id}`);
    return { ok: true, message: `Role changed to ${p.data.role}. They'll need to sign in again.` };
  });
}

export async function setUserStatusAction(id: string, next: "active" | "suspended"): Promise<ActionResult> {
  return guard(async () => {
    const actor = await assertPermission("users:manage");
    const p = z.object({ id: oid, next: z.enum(["active", "suspended"]) }).safeParse({ id, next });
    if (!p.success) return { ok: false, error: "Invalid request." };
    if (id === actor.id) return { ok: false, error: "You can’t suspend your own account." };
    const target = await User.findByIdAndUpdate(id, { status: p.data.next }).lean();
    if (!target) return { ok: false, error: "User not found." };
    if (p.data.next === "suspended") await revokeUserSessions(id);
    await logActivity({ actor, action: p.data.next === "suspended" ? "user.suspended" : "user.activated", entityType: "user", entityId: id, entityLabel: target.email });
    revalidatePath(`/admin/users/${id}`);
    return { ok: true, message: p.data.next === "suspended" ? "User suspended and signed out." : "User reactivated." };
  });
}

/* ------------------------------ Notifications ------------------------------ */

export async function markNotificationsReadAction(ids: string[] | "all"): Promise<ActionResult> {
  return guard(async () => {
    const user = await assertUser();
    const scope: Record<string, unknown> = isStaff(user.role) ? { $or: [{ audience: "staff" }, { recipient: user.id }] } : { recipient: user.id };
    const filter: Record<string, unknown> = ids === "all" ? scope : { ...scope, _id: { $in: ids.filter((i) => oid.safeParse(i).success) } };
    await Notification.updateMany(filter, { $addToSet: { readBy: user.id } });
    revalidatePath("/admin", "layout");
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Marked as read." };
  });
}

/* --------------------------------- Settings -------------------------------- */

const settingsSections = {
  general: z.object({
    siteName: z.string().trim().min(1).max(80),
    tagline: z.string().trim().max(160),
    description: z.string().trim().max(600),
    foundedYear: z.coerce.number().int().min(1900).max(2100),
  }),
  contact: z.object({
    email: z.email(),
    phone: z.string().trim().max(40),
    whatsapp: z.string().trim().max(40),
    mailingAddress: z.string().trim().max(200),
    responseTime: z.string().trim().max(120),
    hours: z.array(z.object({ days: z.string().trim().max(60), hours: z.string().trim().max(60) })).max(10),
  }),
  socials: z.object({
    facebook: z.url().or(z.literal("")),
    instagram: z.url().or(z.literal("")),
    linkedin: z.url().or(z.literal("")),
    twitter: z.url().or(z.literal("")),
    youtube: z.url().or(z.literal("")),
  }),
  seo: z.object({
    titleTemplate: z.string().trim().max(80).refine((v) => v.includes("%s"), "Template must contain %s"),
    defaultTitle: z.string().trim().min(1).max(120),
    defaultDescription: z.string().trim().max(320),
    keywords: z.array(z.string().trim().max(60)).max(30),
    googleVerification: z.string().trim().max(120).optional(),
  }),
  email: z.object({ notifyOnLead: z.boolean(), adminRecipients: z.array(z.email()).max(10) }),
  security: z.object({ allowRegistration: z.boolean() }),
  branding: z.object({ logo: z.string().trim().max(500), mark: z.string().trim().max(500) }),
  stats: z.array(z.object({ value: z.string().trim().min(1).max(20), label: z.string().trim().min(1).max(80) })).max(8),
  trust: z.array(z.string().trim().min(1).max(80)).max(6),
} as const;

export type SettingsSection = keyof typeof settingsSections;

export async function saveSettingsAction(section: SettingsSection, data: unknown): Promise<ActionResult> {
  return guard(async () => {
    const actor = await assertPermission(section === "seo" ? "seo:global" : "settings:manage");
    const schema = settingsSections[section];
    if (!schema) return { ok: false, error: "Unknown settings section." };
    const p = schema.safeParse(data);
    if (!p.success) {
      const fieldErrors: Record<string, string> = {};
      for (const i of p.error.issues) fieldErrors[i.path.join(".")] ??= i.message;
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
    }
    await SiteSettingsModel.updateOne({ key: "site" }, { $set: { [`data.${section}`]: p.data } }, { upsert: true });
    await logActivity({ actor, action: "settings.updated", entityType: "settings", entityLabel: section });
    revalidateTag(TAGS.settings, { expire: 0 });
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved." };
  });
}
