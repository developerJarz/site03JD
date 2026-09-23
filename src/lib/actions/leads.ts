"use server";

import { logActivity, notify } from "@/lib/activity";
import { getCurrentUser, getRequestMeta } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/public";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { sendEmail } from "@/lib/email";
import { leadConfirmationEmail, leadNotificationEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/security/rate-limit";
import { contactSchema, fieldErrors } from "@/lib/validations";
import { Service } from "@/models/content";
import { Lead } from "@/models/operations";
import type { ActionResult } from "./types";

const MIN_FILL_MS = 2500;

/**
 * Public contact / quote form. Layers of protection: honeypot field,
 * minimum fill time, per-IP rate limiting and strict schema validation.
 */
export async function submitLead(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.website) return { ok: true, message: "Thanks — we’ll be in touch." }; // honeypot: silently accept
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: errors };
  }
  const input = parsed.data;

  if (input.startedAt && Date.now() - input.startedAt < MIN_FILL_MS) {
    return { ok: true, message: "Thanks — we’ll be in touch." }; // too fast to be human
  }

  const { ip, userAgent } = await getRequestMeta();
  const limited = await rateLimit("contact", ip);
  if (!limited.ok) {
    return { ok: false, error: `Too many submissions. Please try again in ${Math.ceil(limited.retryAfterSeconds / 60)} minutes, or email ${"info@jarzdigital.com"}.` };
  }

  if (!isDbConfigured) {
    console.warn("[lead] Database not configured — lead not stored:", input.email);
    return { ok: false, error: "Our form is temporarily unavailable. Please email info@jarzdigital.com or call +1 267-766-9055." };
  }

  try {
    await connectDB();
    const [user, serviceDoc] = await Promise.all([
      getCurrentUser(),
      input.service ? Service.findOne({ slug: input.service }).select("_id title").lean() : null,
    ]);

    const lead = await Lead.create({
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      company: input.company,
      service: serviceDoc?._id,
      serviceName: serviceDoc?.title ?? input.service,
      budget: input.budget,
      projectType: input.projectType,
      timeline: input.timeline,
      message: input.message,
      source: input.source ?? "contact-form",
      pagePath: input.pagePath,
      user: user?.id,
      ip,
      userAgent,
    });

    const leadId = String(lead._id);
    await Promise.all([
      notify({ type: "lead", title: `New lead: ${input.name}`, body: serviceDoc?.title ?? input.projectType ?? input.message.slice(0, 120), href: `/admin/leads/${leadId}` }),
      logActivity({ actor: user ? { id: user.id, name: user.name, role: user.role } : null, action: "lead.created", entityType: "lead", entityId: leadId, entityLabel: input.name, ip }),
    ]);

    const settings = await getSiteSettings();
    const recipients = [...new Set([...(settings.email.adminRecipients ?? []), env.ADMIN_NOTIFICATION_EMAIL].filter(Boolean) as string[])];
    if (settings.email.notifyOnLead && recipients.length) {
      const mail = leadNotificationEmail({ id: leadId, ...input, service: serviceDoc?.title ?? input.service });
      await sendEmail({ to: recipients, replyTo: input.email, ...mail });
    }
    await sendEmail({ to: input.email, ...leadConfirmationEmail(input.name) });

    return { ok: true, message: "Thanks! Your message has reached our team — we respond within 24 hours." };
  } catch (err) {
    console.error("[lead] failed to save", err);
    return { ok: false, error: "Something went wrong on our side. Please try again or email info@jarzdigital.com." };
  }
}
