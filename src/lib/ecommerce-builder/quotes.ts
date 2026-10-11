import "server-only";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { connectDB } from "@/lib/db/connect";
import { BuilderInvoice, BuilderQuote } from "@/models/builder";
import { nextNumber } from "./server";
import type { Pricebook, QuoteBreakdown, Selection } from "./types";

/** Public links for a quote token. Tokens are only ever shown, never stored. */
export const quoteLinks = (token: string) => ({ url: `/quote/${token}`, pdfUrl: `/quote/${token}/pdf` });
export const invoiceLink = (token: string) => `/invoice/${token}`;

const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;

/** Saves a server-calculated quote and returns it with its one-time link token. */
export async function issueQuote(pb: Pricebook, calc: { selection: Selection; breakdown: QuoteBreakdown }, meta: { ip?: string; userAgent?: string } = {}) {
  await connectDB();
  const token = generateToken();
  const number = await nextNumber("quote");
  const validUntil = new Date(Date.now() + pb.rules.quoteValidityDays * 86_400_000);
  const doc = await BuilderQuote.create({
    number,
    tokenHash: hashToken(token),
    pricebookVersion: pb.version,
    currency: pb.currency,
    selection: calc.selection,
    selectionKey: calc.breakdown.selectionKey,
    breakdown: calc.breakdown,
    terms: { paymentTerms: pb.rules.paymentTerms, disclaimer: pb.rules.disclaimer },
    total: calc.breakdown.total,
    templateId: calc.breakdown.template.id,
    validUntil,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
  return { doc, token };
}

export async function findQuoteByToken(token: string) {
  if (!TOKEN_RE.test(token)) return null;
  await connectDB();
  return BuilderQuote.findOne({ tokenHash: hashToken(token) }).lean();
}

export async function findInvoiceByToken(token: string) {
  if (!TOKEN_RE.test(token)) return null;
  await connectDB();
  return BuilderInvoice.findOne({ tokenHash: hashToken(token), status: "issued" }).lean();
}

/** Replaces a record's link token (old links stop working) and returns the new token. */
export function newLinkToken() {
  const token = generateToken();
  return { token, tokenHash: hashToken(token) };
}
