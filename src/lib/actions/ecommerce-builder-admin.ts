"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { logActivity } from "@/lib/activity";
import { AuthError, assertPermission, getRequestMeta, type SessionUser } from "@/lib/auth/session";
import { buildFieldsSchema, unflatten } from "@/lib/cms/server";
import { TAGS } from "@/lib/data/cache-tags";
import { connectDB } from "@/lib/db/connect";
import { BUILDER_PATH, CONFIRMED_STATUSES, ORDER_STATUSES, ORDER_STATUS_META, PAYMENT_METHODS, type OrderStatus } from "@/lib/ecommerce-builder/constants";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import { COUPON_CODE_PATTERN, normalizeCouponCode } from "@/lib/ecommerce-builder/coupons";
import { invoiceLink, newLinkToken, quoteLinks } from "@/lib/ecommerce-builder/quotes";
import { loadDraftPricebook, nextNumber, pricebookHash, readBuilderSettings } from "@/lib/ecommerce-builder/server";
import { SETTINGS_SECTIONS, type SettingsSection } from "@/lib/ecommerce-builder/settings";
import { settingsPageDef } from "@/lib/ecommerce-builder/settings-def";
import { slugify } from "@/lib/utils";
import { BuilderFeature, BuilderInvoice, BuilderOrder, BuilderPricebook, BuilderQuote, BuilderSettingsModel } from "@/models/builder";
import { User } from "@/models/User";
import type { ActionResult } from "./types";

const isId = (id: string) => /^[a-f0-9]{24}$/.test(id);

async function run<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    console.error("[builder-admin]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

function refreshBuilderPage() {
  revalidateTag(TAGS.ecommerceBuilder, { expire: 0 });
  revalidatePath(BUILDER_PATH);
}

const actorOf = (u: SessionUser) => ({ id: u.id, name: u.name, role: u.role });

/* ------------------------------ Pricing publish ------------------------------ */

/** Freezes the current catalog + pricing rules into a new pricebook version. */
export async function publishPricingAction(note: string): Promise<ActionResult<{ version: number }>> {
  return run(async () => {
    const user = await assertPermission("builder:catalog");
    await connectDB();
    const { pricebook, issues } = await loadDraftPricebook();
    const errors = issues.filter((i) => i.level === "error");
    if (errors.length) return { ok: false, error: `Fix ${errors.length} issue${errors.length > 1 ? "s" : ""} before publishing: ${errors[0].message}` };

    const hash = pricebookHash(pricebook);
    const latest = await BuilderPricebook.findOne().sort({ version: -1 }).select("version hash").lean();
    if (latest?.hash === hash) return { ok: false, error: "Nothing to publish — the live pricing already matches the catalog." };

    const version = (latest?.version ?? 0) + 1;
    await BuilderPricebook.create({ version, data: { ...pricebook, version }, hash, note: note.trim().slice(0, 300) || undefined, publishedBy: user.id, publishedByName: user.name });
    const { ip } = await getRequestMeta();
    await logActivity({ actor: actorOf(user), action: "ecommerce-pricing.published", entityType: "ecommerce-pricebook", entityId: String(version), entityLabel: `Pricebook v${version}`, meta: { templates: pricebook.templates.length, features: pricebook.features.length }, ip });
    refreshBuilderPage();
    return { ok: true, message: `Pricing v${version} is live.`, data: { version } };
  });
}

/* --------------------------------- Settings --------------------------------- */

export async function saveBuilderSettingsAction(section: string, values: Record<string, unknown>): Promise<ActionResult> {
  return run(async () => {
    if (!(SETTINGS_SECTIONS as readonly string[]).includes(section)) return { ok: false, error: "Unknown settings section." };
    await connectDB();
    const featureOptions = section === "pricing" ? (await BuilderFeature.find({ pricing: { $in: ["fixed", "quantity"] } }).select("slug name").sort({ order: 1 }).lean()).map((f) => ({ value: f.slug, label: f.name })) : [];
    const def = settingsPageDef(section as SettingsSection, featureOptions);
    const user = await assertPermission(def.permission);

    const fields = def.sections.flatMap((s) => s.fields);
    const parsed = buildFieldsSchema(fields).safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const i of parsed.error.issues) fieldErrors[i.path.map(String).join(".")] ??= i.message;
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
    }
    const data = unflatten(parsed.data as Record<string, unknown>) as Record<string, unknown>;

    if (section === "pricing") {
      const seen = new Set<string>();
      const couponCodes = new Set<string>();
      const discounts = (data.discounts as Record<string, unknown>[]) ?? [];
      for (const [i, d] of discounts.entries()) {
        const code = normalizeCouponCode(String(d.code ?? ""));
        if (code && !COUPON_CODE_PATTERN.test(code)) return { ok: false, error: "Use letters, numbers, hyphens or underscores for coupon codes.", fieldErrors: { [`discounts.${i}.code`]: "Enter a valid coupon code" } };
        if (code && couponCodes.has(code)) return { ok: false, error: `Coupon code “${code}” is already used by another discount.`, fieldErrors: { [`discounts.${i}.code`]: "Coupon codes must be unique" } };
        if (code) couponCodes.add(code);
        d.code = code;
        d.key = slugify(String(d.key || d.label || `discount-${i + 1}`));
        if (seen.has(d.key as string)) return { ok: false, error: `Two discounts share the ID “${d.key}”.`, fieldErrors: { [`discounts.${i}.key`]: "Must be unique" } };
        seen.add(d.key as string);
        if (d.type === "percent" && !(Number(d.percent) > 0)) return { ok: false, error: "Enter a percentage for each percentage discount.", fieldErrors: { [`discounts.${i}.percent`]: "Required" } };
        if (d.type === "fixed" && !(Number(d.amount) > 0)) return { ok: false, error: "Enter an amount for each fixed discount.", fieldErrors: { [`discounts.${i}.amount`]: "Required" } };
      }
    }
    if (section === "general") {
      const bad = ((data.notifyEmails as string[]) ?? []).find((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      if (bad) return { ok: false, error: `“${bad}” isn’t a valid email address.`, fieldErrors: { notifyEmails: "Enter valid email addresses" } };
    }
    if (section === "form") {
      for (const k of ["businessCategories", "contactMethods"] as const) {
        if (!((data[k] as string[]) ?? []).length) return { ok: false, error: "Add at least one option.", fieldErrors: { [k]: "Add at least one option" } };
      }
    }

    await BuilderSettingsModel.updateOne({ key: "ecommerce" }, { $set: { [`data.${section}`]: data } }, { upsert: true });
    const { ip } = await getRequestMeta();
    await logActivity({ actor: actorOf(user), action: `ecommerce-settings.updated`, entityType: "ecommerce-settings", entityId: section, entityLabel: def.title, ip });
    if (!def.draft) refreshBuilderPage();
    return { ok: true, message: def.draft ? "Saved. Publish pricing to make these changes live." : "Saved — the builder page is updated." };
  });
}

/* ---------------------------------- Orders ---------------------------------- */

export async function updateBuilderOrderStatusAction(id: string, status: string): Promise<ActionResult> {
  return run(async () => {
    if (!isId(id) || !(ORDER_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    const order = await BuilderOrder.findOneAndUpdate(
      { _id: id, status: { $ne: status as OrderStatus } },
      { $set: { status }, $push: { statusHistory: { status, at: new Date(), byName: user.name } } },
      { returnDocument: "after" },
    ).lean();
    if (!order) return { ok: false, error: "Status unchanged." };
    await logActivity({ actor: actorOf(user), action: "ecommerce-order.status", entityType: "ecommerce-order", entityId: id, entityLabel: order.number, meta: { status } });
    return { ok: true, message: `Marked as ${ORDER_STATUS_META[status as OrderStatus].label.toLowerCase()}.` };
  });
}

export async function addBuilderOrderNoteAction(id: string, body: string): Promise<ActionResult> {
  return run(async () => {
    const text = body.trim().slice(0, 2000);
    if (!isId(id) || !text) return { ok: false, error: "Write a note first." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    const res = await BuilderOrder.updateOne({ _id: id }, { $push: { notes: { author: user.id, authorName: user.name, body: text } } });
    if (!res.matchedCount) return { ok: false, error: "Order not found." };
    await logActivity({ actor: actorOf(user), action: "ecommerce-order.note", entityType: "ecommerce-order", entityId: id });
    return { ok: true, message: "Note added." };
  });
}

export async function assignBuilderOrderAction(id: string, userId: string): Promise<ActionResult> {
  return run(async () => {
    if (!isId(id) || (userId && !isId(userId))) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    if (userId) {
      const staff = await User.exists({ _id: userId, role: { $in: ["ADMIN", "EDITOR"] }, status: "active" });
      if (!staff) return { ok: false, error: "Choose an active staff member." };
    }
    await BuilderOrder.updateOne({ _id: id }, { $set: { assignee: userId || null } });
    await logActivity({ actor: actorOf(user), action: "ecommerce-order.updated", entityType: "ecommerce-order", entityId: id, meta: { assignee: userId || null } });
    return { ok: true, message: userId ? "Order assigned." : "Assignment cleared." };
  });
}

export async function recordBuilderPaymentAction(id: string, input: { amount: number; method: string; reference: string; note: string; receivedAt: string }): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    if (!isId(id)) return { ok: false, error: "Invalid request." };
    const amount = Math.round(Number(input.amount));
    if (!Number.isInteger(amount) || amount <= 0 || amount > 100_000_000) return { ok: false, error: "Enter the amount received.", fieldErrors: { amount: "Enter an amount" } };
    if (!(PAYMENT_METHODS as readonly string[]).includes(input.method)) return { ok: false, error: "Choose a payment method.", fieldErrors: { method: "Choose a method" } };
    const receivedAt = input.receivedAt ? new Date(input.receivedAt) : new Date();
    if (Number.isNaN(receivedAt.getTime()) || receivedAt.getTime() > Date.now() + 86_400_000) return { ok: false, error: "Enter a valid date.", fieldErrors: { receivedAt: "Invalid date" } };
    const user = await assertPermission("builder:orders");
    await connectDB();
    const order = await BuilderOrder.findById(id);
    if (!order) return { ok: false, error: "Order not found." };
    order.payments.push({ amount, method: input.method, reference: input.reference.trim().slice(0, 120), note: input.note.trim().slice(0, 300), receivedAt, recordedBy: user.id, recordedByName: user.name });
    order.amountPaid = order.payments.reduce((s, p) => s + (p.amount ?? 0), 0);
    await order.save();
    await logActivity({ actor: actorOf(user), action: "ecommerce-order.payment", entityType: "ecommerce-order", entityId: id, entityLabel: order.number, meta: { amount, method: input.method } });
    return { ok: true, message: `Payment of ${formatMoney(amount, order.currency ?? "USD")} recorded.` };
  });
}

export async function deleteBuilderPaymentAction(id: string, paymentId: string): Promise<ActionResult> {
  return run(async () => {
    if (!isId(id) || !isId(paymentId)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    const order = await BuilderOrder.findById(id);
    if (!order) return { ok: false, error: "Order not found." };
    const before = order.payments.length;
    order.payments.pull({ _id: paymentId });
    if (order.payments.length === before) return { ok: false, error: "Payment not found." };
    order.amountPaid = order.payments.reduce((s, p) => s + (p.amount ?? 0), 0);
    await order.save();
    await logActivity({ actor: actorOf(user), action: "ecommerce-order.payment-removed", entityType: "ecommerce-order", entityId: id, entityLabel: order.number });
    return { ok: true, message: "Payment removed." };
  });
}

export async function deleteBuilderOrderAction(id: string): Promise<ActionResult> {
  return run(async () => {
    if (!isId(id)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    if (await BuilderInvoice.exists({ order: id, status: "issued" })) return { ok: false, error: "Void this order’s invoice before deleting it." };
    const order = await BuilderOrder.findByIdAndDelete(id).lean();
    if (!order) return { ok: false, error: "Already deleted." };
    await BuilderQuote.updateOne({ _id: order.quote }, { $set: { order: null } });
    await logActivity({ actor: actorOf(user), action: "ecommerce-order.deleted", entityType: "ecommerce-order", entityId: id, entityLabel: `${order.number} — ${order.customer?.name ?? ""}` });
    return { ok: true, message: "Order deleted." };
  });
}

/* ------------------------------ Quotes & invoices ---------------------------- */

/** Issues a new customer link for a quotation (the old link stops working). Shown once. */
export async function rotateQuoteLinkAction(quoteId: string): Promise<ActionResult<{ url: string; pdfUrl: string }>> {
  return run(async () => {
    if (!isId(quoteId)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    const { token, tokenHash } = newLinkToken();
    const res = await BuilderQuote.updateOne({ _id: quoteId }, { $set: { tokenHash } });
    if (!res.matchedCount) return { ok: false, error: "Quotation not found." };
    await logActivity({ actor: actorOf(user), action: "ecommerce-quote.link", entityType: "ecommerce-quote", entityId: quoteId });
    return { ok: true, message: "New customer link created. The previous link no longer works.", data: quoteLinks(token) };
  });
}

/**
 * Issues an invoice for a confirmed order. A quotation is an estimate; an
 * invoice is created only once the customer has confirmed the scope.
 */
export async function createBuilderInvoiceAction(orderId: string, dueDays: number): Promise<ActionResult<{ id: string; number: string; url: string }>> {
  return run(async () => {
    if (!isId(orderId)) return { ok: false, error: "Invalid request." };
    const days = Math.min(90, Math.max(0, Math.round(Number(dueDays) || 0)));
    const user = await assertPermission("builder:orders");
    await connectDB();
    const order = await BuilderOrder.findById(orderId).lean();
    if (!order) return { ok: false, error: "Order not found." };
    if (!CONFIRMED_STATUSES.includes(order.status as OrderStatus)) return { ok: false, error: "Confirm the order (status “Confirmed” or later) before issuing an invoice." };
    if (await BuilderInvoice.exists({ order: orderId, status: "issued" })) return { ok: false, error: "This order already has an active invoice. Void it to issue a new one." };
    const settings = await readBuilderSettings();
    const { token, tokenHash } = newLinkToken();
    const issuedAt = new Date();
    const invoice = await BuilderInvoice.create({
      number: await nextNumber("invoice"),
      order: order._id,
      orderNumber: order.number,
      tokenHash,
      customer: order.customer,
      currency: order.currency,
      breakdown: order.breakdown,
      total: order.total,
      issuedAt,
      dueAt: new Date(issuedAt.getTime() + days * 86_400_000),
      paymentTerms: settings.pricing.paymentTerms,
      issuedBy: user.id,
      issuedByName: user.name,
    });
    await logActivity({ actor: actorOf(user), action: "ecommerce-invoice.created", entityType: "ecommerce-invoice", entityId: String(invoice._id), entityLabel: `${invoice.number} for ${order.number}` });
    return { ok: true, message: `Invoice ${invoice.number} issued.`, data: { id: String(invoice._id), number: invoice.number, url: invoiceLink(token) } };
  });
}

export async function rotateInvoiceLinkAction(invoiceId: string): Promise<ActionResult<{ url: string }>> {
  return run(async () => {
    if (!isId(invoiceId)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    const { token, tokenHash } = newLinkToken();
    const res = await BuilderInvoice.updateOne({ _id: invoiceId, status: "issued" }, { $set: { tokenHash } });
    if (!res.matchedCount) return { ok: false, error: "Invoice not found or void." };
    await logActivity({ actor: actorOf(user), action: "ecommerce-invoice.link", entityType: "ecommerce-invoice", entityId: invoiceId });
    return { ok: true, message: "New customer link created. The previous link no longer works.", data: { url: invoiceLink(token) } };
  });
}

export async function voidBuilderInvoiceAction(invoiceId: string): Promise<ActionResult> {
  return run(async () => {
    if (!isId(invoiceId)) return { ok: false, error: "Invalid request." };
    const user = await assertPermission("builder:orders");
    await connectDB();
    const inv = await BuilderInvoice.findOneAndUpdate({ _id: invoiceId, status: "issued" }, { $set: { status: "void" } }, { returnDocument: "after" }).lean();
    if (!inv) return { ok: false, error: "Invoice already void." };
    await logActivity({ actor: actorOf(user), action: "ecommerce-invoice.voided", entityType: "ecommerce-invoice", entityId: invoiceId, entityLabel: inv.number });
    return { ok: true, message: `Invoice ${inv.number} voided.` };
  });
}
