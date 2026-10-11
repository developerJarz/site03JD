"use server";

import { CONTACT_EMAIL, CONTACT_PHONE } from "@/config/contact";
import { getRequestMeta } from "@/lib/auth/session";
import { canDeliverEmail, sendEmail } from "@/lib/email";
import { businessAnalysisEmail } from "@/lib/email/templates";
import { rateLimit } from "@/lib/security/rate-limit";
import { businessAnalysisSchema, fieldErrors } from "@/lib/validations";
import type { ActionResult } from "./types";

const MIN_FILL_MS = 2500;
const SENT = "Details sent. We’ll call you within 24 hours.";

/**
 * "Analyze your business in detail" popup beside the calculator video guide.
 * Emails the request to the team inbox (CONTACT_EMAIL). Same spam layers as
 * submitLead: honeypot, minimum fill time and per-IP rate limiting.
 */
export async function requestBusinessAnalysis(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = businessAnalysisSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.website) return { ok: true, message: SENT }; // honeypot: silently accept
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: errors };
  }
  const input = parsed.data;
  if (input.startedAt && Date.now() - input.startedAt < MIN_FILL_MS) return { ok: true, message: SENT };

  const { ip } = await getRequestMeta();
  const limited = await rateLimit("contact", ip);
  if (!limited.ok) {
    return { ok: false, error: `Too many requests. Try again in ${Math.ceil(limited.retryAfterSeconds / 60)} minutes, or WhatsApp us on ${CONTACT_PHONE}.` };
  }

  const fallback = `Your details couldn’t be sent. Please WhatsApp us on ${CONTACT_PHONE} or email ${CONTACT_EMAIL}.`;
  if (!canDeliverEmail()) return { ok: false, error: fallback };
  const sent = await sendEmail({ to: CONTACT_EMAIL, ...businessAnalysisEmail(input) });
  return sent ? { ok: true, message: SENT } : { ok: false, error: fallback };
}
