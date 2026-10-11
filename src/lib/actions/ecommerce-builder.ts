"use server";

import { CONTACT_EMAIL, CONTACT_PHONE } from "@/config/contact";
import { logActivity, notify } from "@/lib/activity";
import { getRequestMeta } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/public";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { sendEmail } from "@/lib/email";
import { builderOrderConfirmationEmail, builderOrderNotificationEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { calculateQuote, formatMoney, selectionKey } from "@/lib/ecommerce-builder/pricing";
import { findQuoteByToken, issueQuote, quoteLinks } from "@/lib/ecommerce-builder/quotes";
import { loadPublishedPricebook, nextNumber, readBuilderSettings } from "@/lib/ecommerce-builder/server";
import type { QuoteBreakdown, Selection } from "@/lib/ecommerce-builder/types";
import { rateLimit } from "@/lib/security/rate-limit";
import { builderOrderSchema, builderSelectionSchema, fieldErrors } from "@/lib/validations";
import { BuilderOrder, BuilderQuote } from "@/models/builder";
import type { ActionResult } from "./types";

const MIN_FILL_MS = 3000;
const UNAVAILABLE = `Quotations are temporarily unavailable. Please WhatsApp us on ${CONTACT_PHONE} or email ${CONTACT_EMAIL}.`;

export interface QuotePayload {
  selection: Selection;
  breakdown: QuoteBreakdown;
  quote: { number: string; token: string; url: string; pdfUrl: string; validUntil: string } | null;
}

export interface OrderPayload {
  orderNumber: string;
  quoteNumber: string;
  quoteUrl: string | null;
  pdfUrl: string | null;
  total: string;
  hasCustomItems: boolean;
  emailSent: boolean;
  message: string;
}

const isDuplicateKey = (err: unknown) => typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;

/**
 * Prices a selection on the server from the published pricebook and saves it
 * as a quotation. The client's own total is never trusted or even sent.
 */
export async function createBuilderQuoteAction(rawSelection: unknown): Promise<ActionResult<QuotePayload>> {
  const parsed = builderSelectionSchema.safeParse(rawSelection);
  if (!parsed.success) return { ok: false, error: "Your selection couldn’t be read. Please refresh the page and try again." };

  const { ip, userAgent } = await getRequestMeta();
  const limited = await rateLimit("builderQuote", ip);
  if (!limited.ok) return { ok: false, error: `Too many quotations in a short time. Please try again in ${Math.ceil(limited.retryAfterSeconds / 60)} minutes.` };

  try {
    const pb = await loadPublishedPricebook();
    const calc = calculateQuote(pb, parsed.data);
    if (!calc.ok) return { ok: false, error: calc.errors[0] ?? "Please check your selection." };
    if (!isDbConfigured) return { ok: true, message: "Estimate calculated.", data: { selection: calc.selection, breakdown: calc.breakdown, quote: null } };

    const { doc, token } = await issueQuote(pb, calc, { ip, userAgent });
    return {
      ok: true,
      message: `Quotation ${doc.number} created.`,
      data: { selection: calc.selection, breakdown: calc.breakdown, quote: { number: doc.number, token, ...quoteLinks(token), validUntil: doc.validUntil.toISOString() } },
    };
  } catch (err) {
    console.error("[builder] quote failed", err);
    return { ok: false, error: UNAVAILABLE };
  }
}

/**
 * Customer order request. Protection: honeypot, minimum fill time, per-IP
 * rate limit, strict validation, server-side pricing, and idempotency (a
 * retried or double-clicked submit returns the original order).
 */
export async function submitBuilderOrderAction(_prev: ActionResult<OrderPayload>, formData: FormData): Promise<ActionResult<OrderPayload>> {
  const parsed = builderOrderSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.website) return { ok: false, error: "Something went wrong. Please try again." }; // honeypot
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: errors };
  }
  const input = parsed.data;
  if (input.startedAt && Date.now() - input.startedAt < MIN_FILL_MS) return { ok: false, error: "Please take a moment to review your details, then submit again." };

  let selectionJson: unknown;
  try {
    selectionJson = JSON.parse(input.selection);
  } catch {
    selectionJson = null;
  }
  const selection = builderSelectionSchema.safeParse(selectionJson);
  if (!selection.success) return { ok: false, error: "Your selection couldn’t be read. Please refresh the page and try again." };

  if (!isDbConfigured) return { ok: false, error: `Our order form is temporarily unavailable. Please WhatsApp us on ${CONTACT_PHONE} or email ${CONTACT_EMAIL}.` };

  const { ip, userAgent } = await getRequestMeta();

  try {
    await connectDB();
    const settings = await readBuilderSettings();

    // A retry of a submission that already succeeded returns the same order.
    const existing = await BuilderOrder.findOne({ idempotencyKey: input.idempotencyKey }).lean();
    if (existing) return { ok: true, message: settings.form.successMessage, data: await existingPayload(existing, input.quoteToken, settings.form.successMessage) };

    const limited = await rateLimit("builderOrder", ip);
    if (!limited.ok) return { ok: false, error: `Too many submissions. Please try again in ${Math.ceil(limited.retryAfterSeconds / 60)} minutes, or WhatsApp us on ${CONTACT_PHONE}.` };

    if (!settings.general.acceptingOrders) return { ok: false, error: settings.general.closedMessage };

    const errors: Record<string, string> = {};
    if (settings.form.businessCategories.length && !settings.form.businessCategories.includes(input.businessCategory)) errors.businessCategory = "Choose one of the listed categories";
    if (settings.form.contactMethods.length && !settings.form.contactMethods.includes(input.contactMethod)) errors.contactMethod = "Choose one of the listed contact methods";
    if (Object.keys(errors).length) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: errors };

    // Honour a matching valid quotation, including coupons disabled since it was issued.
    let quote = input.quoteToken ? await findQuoteByToken(input.quoteToken) : null;
    let token = input.quoteToken ?? null;
    const usable = quote && !quote.order && quote.validUntil > new Date() && quote.selectionKey === selectionKey(selection.data);
    if (quote?.order) {
      const prior = await BuilderOrder.findById(quote.order).lean();
      if (prior) return { ok: true, message: settings.form.successMessage, data: await existingPayload(prior, input.quoteToken, settings.form.successMessage) };
    }
    if (!usable) {
      const pb = await loadPublishedPricebook();
      const calc = calculateQuote(pb, selection.data);
      if (!calc.ok) return { ok: false, error: calc.errors[0] ?? "Please check your selection." };
      const expected = Number(formData.get("expectedTotal"));
      // Prices changed since the page loaded: show the new quotation instead of ordering at a different total.
      if (Number.isFinite(expected) && expected !== calc.breakdown.total) {
        return { ok: false, error: "Our prices were updated since you opened this page. Please review your updated quotation and submit again.", fieldErrors: { _quote: "stale" } };
      }
      const issued = await issueQuote(pb, calc, { ip, userAgent });
      quote = issued.doc.toObject();
      token = issued.token;
    }
    const q = quote!;
    const breakdown = q.breakdown as QuoteBreakdown;

    const customer = {
      name: input.name,
      phone: input.phone,
      email: input.email,
      businessName: input.businessName,
      businessCategory: input.businessCategory,
      domain: input.domain,
      requirements: input.requirements,
      contactMethod: input.contactMethod,
    };

    let order;
    try {
      order = await BuilderOrder.create({
        number: await nextNumber("order"),
        quote: q._id,
        quoteNumber: q.number,
        idempotencyKey: input.idempotencyKey,
        customer,
        pricebookVersion: q.pricebookVersion,
        currency: q.currency,
        breakdown,
        templateId: breakdown.template.id,
        templateName: breakdown.template.name,
        featureIds: [...breakdown.lines.map((l) => l.id), ...breakdown.custom.map((c) => c.id)],
        total: q.total,
        statusHistory: [{ status: "new", byName: "Customer" }],
        termsAcceptedAt: new Date(),
        ip,
        userAgent,
      });
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      // Concurrent double submit: return whichever order won.
      const winner = await BuilderOrder.findOne({ $or: [{ idempotencyKey: input.idempotencyKey }, { quote: q._id }] }).lean();
      if (winner) return { ok: true, message: settings.form.successMessage, data: await existingPayload(winner, token ?? undefined, settings.form.successMessage) };
      throw err;
    }
    await BuilderQuote.updateOne({ _id: q._id, order: null }, { $set: { order: order._id, customer } });

    const orderId = String(order._id);
    const total = formatMoney(order.total, order.currency);
    const links = token ? quoteLinks(token) : null;

    await Promise.all([
      notify({ type: "lead", title: `New e-commerce order ${order.number}`, body: `${customer.businessName || customer.name} · ${breakdown.template.name} · ${total}`, href: `/admin/ecommerce-builder/orders/${orderId}` }),
      logActivity({ actor: null, action: "ecommerce-order.created", entityType: "ecommerce-order", entityId: orderId, entityLabel: `${order.number} — ${customer.name}`, ip }),
    ]);

    const mail = {
      orderId,
      orderNumber: order.number,
      quoteNumber: q.number,
      quoteUrl: links ? new URL(links.url, env.SITE_URL).toString() : new URL("/contact", env.SITE_URL).toString(),
      customer,
      templateName: breakdown.template.name,
      lines: [{ name: `${breakdown.template.name} (design + base store)`, amount: formatMoney(breakdown.template.price, order.currency) }, ...breakdown.lines.map((l) => ({ name: l.qty > 1 ? `${l.name} × ${l.qty}` : l.name, amount: formatMoney(l.amount, order.currency) }))],
      customItems: breakdown.custom.map((c) => c.name),
      total,
      validUntil: new Date(q.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    };
    const site = await getSiteSettings();
    const recipients = [...new Set([...(site.email.adminRecipients ?? []), env.ADMIN_NOTIFICATION_EMAIL, ...settings.general.notifyEmails].filter(Boolean) as string[])];
    if (recipients.length) await sendEmail({ to: recipients, replyTo: customer.email, ...builderOrderNotificationEmail(mail) });
    const sent = await sendEmail({ to: customer.email, ...builderOrderConfirmationEmail(mail) });
    // The console provider only logs — don't tell the customer an email is on its way.
    const emailSent = sent && env.EMAIL_PROVIDER !== "console";

    return {
      ok: true,
      message: settings.form.successMessage,
      data: { orderNumber: order.number, quoteNumber: q.number, quoteUrl: links?.url ?? null, pdfUrl: links?.pdfUrl ?? null, total, hasCustomItems: breakdown.custom.length > 0, emailSent, message: settings.form.successMessage },
    };
  } catch (err) {
    console.error("[builder] order failed", err);
    return { ok: false, error: `Something went wrong on our side. Please try again, or WhatsApp us on ${CONTACT_PHONE}.` };
  }
}

async function existingPayload(order: { number: string; quoteNumber: string; quote: unknown; total: number; currency?: string | null; breakdown: unknown }, token: string | undefined, message: string): Promise<OrderPayload> {
  // Only hand back a quote link the visitor already holds for this order's quote.
  let links: ReturnType<typeof quoteLinks> | null = null;
  if (token) {
    const q = await findQuoteByToken(token);
    if (q && String(q._id) === String(order.quote)) links = quoteLinks(token);
  }
  return {
    orderNumber: order.number,
    quoteNumber: order.quoteNumber,
    quoteUrl: links?.url ?? null,
    pdfUrl: links?.pdfUrl ?? null,
    total: formatMoney(order.total, order.currency ?? "USD"),
    hasCustomItems: ((order.breakdown as QuoteBreakdown)?.custom ?? []).length > 0,
    emailSent: false,
    message,
  };
}
