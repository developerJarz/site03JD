import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { CONTACT_EMAIL, CONTACT_PHONE, OFFICE_CITIES } from "@/config/contact";
import { formatMoney } from "./pricing";
import type { QuoteBreakdown } from "./types";

/**
 * Branded A4 PDF for quotations and invoices (pdf-lib, standard fonts — no
 * files or network needed, so it works on any serverless runtime).
 *
 * A quotation is clearly labelled as an estimate. An invoice shows only
 * payments an admin recorded; it never claims a payment was verified.
 */

export interface PdfDocInput {
  kind: "quotation" | "invoice";
  number: string;
  issuedAt: Date;
  /** Quotation: valid until. Invoice: due date. */
  untilAt?: Date | null;
  reference?: string;
  customer?: { name?: string | null; businessName?: string | null; email?: string | null; phone?: string | null; domain?: string | null } | null;
  breakdown: QuoteBreakdown;
  paymentTerms?: string | null;
  disclaimer?: string | null;
  amountPaid?: number;
  siteUrl: string;
}

const TEAL = rgb(0, 0.686, 0.725);
const INK = rgb(0.024, 0.043, 0.075);
const MUTED = rgb(0.35, 0.41, 0.47);
const RULE = rgb(0.85, 0.88, 0.91);
const SOFT = rgb(0.957, 0.969, 0.976);

const A4 = { w: 595.28, h: 841.89 };
const M = 48;

/** Standard PDF fonts only cover WinAnsi; replace anything else so rendering never throws. */
function clean(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00D7/g, "x")
    .replace(/[^\x20-\x7E\xA0-\xFF\u2022]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split(/\n/)) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width) line = next;
      else {
        if (line) out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

export async function renderPdf(input: PdfDocInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const b = input.breakdown;
  const money = (c: number) => clean(formatMoney(c, b.currency));
  const date = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const title = input.kind === "quotation" ? "QUOTATION" : "INVOICE";

  pdf.setTitle(`${input.kind === "quotation" ? "Quotation" : "Invoice"} ${input.number} - Jarz Digital`);
  pdf.setAuthor("Jarz Digital");
  pdf.setCreator("Jarz Digital e-commerce builder");

  let page: PDFPage = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - M;

  const text = (s: string, x: number, yy: number, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {}) =>
    page.drawText(clean(s), { x, y: yy, size: opts.size ?? 10, font: opts.font ?? regular, color: opts.color ?? INK });
  const right = (s: string, xr: number, yy: number, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {}) => {
    const f = opts.font ?? regular;
    const size = opts.size ?? 10;
    text(s, xr - f.widthOfTextAtSize(clean(s), size), yy, opts);
  };
  const footer = () => {
    page.drawLine({ start: { x: M, y: 46 }, end: { x: A4.w - M, y: 46 }, thickness: 0.5, color: RULE });
    text(`Jarz Digital · ${OFFICE_CITIES.join(" · ")} · ${CONTACT_EMAIL} · ${CONTACT_PHONE}`, M, 32, { size: 8, color: MUTED });
    right(input.siteUrl.replace(/^https?:\/\//, ""), A4.w - M, 32, { size: 8, color: MUTED });
  };
  const ensure = (needed: number) => {
    if (y - needed > 70) return;
    footer();
    page = pdf.addPage([A4.w, A4.h]);
    y = A4.h - M;
  };

  /* Header */
  page.drawRectangle({ x: 0, y: A4.h - 8, width: A4.w, height: 8, color: TEAL });
  page.drawRectangle({ x: M, y: y - 26, width: 26, height: 26, color: TEAL });
  text("JD", M + 5.5, y - 17.5, { size: 11, font: bold, color: INK });
  text("Jarz Digital", M + 34, y - 18, { size: 16, font: bold });
  right(title, A4.w - M, y - 18, { size: 18, font: bold, color: TEAL });
  y -= 50;

  /* Meta */
  const metaRows: [string, string][] = [
    [input.kind === "quotation" ? "Quotation no." : "Invoice no.", input.number],
    ["Date", date(input.issuedAt)],
    ...(input.untilAt ? ([[input.kind === "quotation" ? "Valid until" : "Due date", date(input.untilAt)]] as [string, string][]) : []),
    ...(input.reference ? ([["Reference", input.reference]] as [string, string][]) : []),
    ["Pricebook", `v${b.pricebookVersion}`],
  ];
  let metaY = y;
  for (const [k, v] of metaRows) {
    right(k, A4.w - M - 110, metaY, { size: 9, color: MUTED });
    right(v, A4.w - M, metaY, { size: 9, font: bold });
    metaY -= 14;
  }

  /* Bill to */
  text(input.kind === "quotation" ? "PREPARED FOR" : "BILL TO", M, y, { size: 8, font: bold, color: MUTED });
  let cy = y - 15;
  const c = input.customer;
  const custLines = c ? [c.businessName, c.name, c.email, c.phone, c.domain].filter((v): v is string => Boolean(v)) : [];
  if (!custLines.length) custLines.push("Website visitor (details not provided)");
  custLines.forEach((l, i) => {
    text(l, M, cy, { size: i === 0 ? 11 : 9.5, font: i === 0 ? bold : regular, color: i === 0 ? INK : MUTED });
    cy -= i === 0 ? 15 : 13;
  });
  y = Math.min(cy, metaY) - 18;

  /* Line items */
  const colQty = A4.w - M - 150;
  const colUnit = A4.w - M - 80;
  const colAmt = A4.w - M;
  page.drawRectangle({ x: M, y: y - 6, width: A4.w - 2 * M, height: 22, color: SOFT });
  text("DESCRIPTION", M + 8, y + 1, { size: 8, font: bold, color: MUTED });
  right("QTY", colQty, y + 1, { size: 8, font: bold, color: MUTED });
  right("UNIT", colUnit, y + 1, { size: 8, font: bold, color: MUTED });
  right("AMOUNT", colAmt - 8, y + 1, { size: 8, font: bold, color: MUTED });
  y -= 26;

  const row = (name: string, sub: string | null, qty: string, unit: string, amount: string) => {
    const nameLines = wrap(name, bold, 10, colQty - M - 60);
    const subLines = sub ? wrap(sub, regular, 8.5, colQty - M - 60) : [];
    ensure(16 + (nameLines.length + subLines.length) * 12);
    nameLines.forEach((l, i) => text(l, M + 8, y - i * 12, { size: 10, font: bold }));
    subLines.forEach((l, i) => text(l, M + 8, y - (nameLines.length + i) * 12, { size: 8.5, color: MUTED }));
    right(qty, colQty, y, { size: 10 });
    right(unit, colUnit, y, { size: 10 });
    right(amount, colAmt - 8, y, { size: 10, font: bold });
    y -= (nameLines.length + subLines.length) * 12 + 8;
    page.drawLine({ start: { x: M, y: y + 2 }, end: { x: A4.w - M, y: y + 2 }, thickness: 0.5, color: RULE });
    y -= 10;
  };

  row(`${b.template.name} — website design & base store`, `Includes ${b.included.length} core features (listed below).`, "1", money(b.template.price), money(b.template.price));
  for (const l of b.lines) {
    const sub = [l.categoryName, l.requiredBy?.length ? `Required by ${l.requiredBy.join(", ")}` : null].filter(Boolean).join(" · ");
    row(l.name, sub || null, String(l.qty), money(l.unitPrice), money(l.amount));
  }
  for (const x of b.bundled) row(x.name, `Included with ${x.with}`, "1", money(0), money(0));
  for (const x of b.custom) row(x.name, `${x.categoryName} · Requires review — priced after consultation`, "1", "-", "TBC");

  /* Totals */
  ensure(120);
  const totals: [string, string, boolean][] = [["Subtotal", money(b.subtotal), false]];
  for (const d of b.discounts) totals.push([`${d.label}${d.code ? ` (${d.code})` : ""}`, `-${money(d.amount)}`, false]);
  if (b.tax) totals.push([`${b.tax.label} (${b.tax.ratePercent}%)`, money(b.tax.amount), false]);
  totals.push([input.kind === "quotation" ? "Estimated development total" : "Total", money(b.total), true]);
  if (input.kind === "invoice") {
    const paid = input.amountPaid ?? 0;
    totals.push(["Payments recorded", `-${money(paid)}`, false]);
    totals.push(["Balance due", money(Math.max(0, b.total - paid)), true]);
  }
  for (const [label, value, strong] of totals) {
    right(label, colUnit - 10, y, { size: strong ? 11 : 9.5, font: strong ? bold : regular, color: strong ? INK : MUTED });
    right(value, colAmt - 8, y, { size: strong ? 12 : 10, font: strong ? bold : regular });
    y -= strong ? 20 : 15;
  }
  if (b.custom.length) {
    ensure(20);
    text(`Plus ${b.custom.length} item(s) priced after consultation.`, M, y, { size: 9, color: MUTED });
    y -= 16;
  }
  y -= 6;

  /* Recurring third-party costs */
  if (b.recurring.length) {
    ensure(40);
    text("RECURRING THIRD-PARTY COSTS (NOT INCLUDED ABOVE)", M, y, { size: 8, font: bold, color: MUTED });
    y -= 14;
    for (const r of b.recurring) {
      const amount = r.amount !== null ? `${money(r.amount * r.qty)} per ${r.interval}` : "Billed by provider";
      const lines = wrap(`${r.name}: ${r.note || amount}`, regular, 9, A4.w - 2 * M - 120);
      ensure(lines.length * 12 + 6);
      lines.forEach((l, i) => text(l, M, y - i * 12, { size: 9 }));
      right(amount, colAmt - 8, y, { size: 9, color: MUTED });
      y -= lines.length * 12 + 4;
    }
    y -= 8;
  }

  /* Included features */
  if (b.included.length) {
    ensure(40);
    text("INCLUDED WITH YOUR WEBSITE", M, y, { size: 8, font: bold, color: MUTED });
    y -= 14;
    const names = b.included.map((f) => f.name);
    const colW = (A4.w - 2 * M) / 2;
    for (let i = 0; i < names.length; i += 2) {
      ensure(14);
      text(`• ${names[i]}`, M, y, { size: 8.5 });
      if (names[i + 1]) text(`• ${names[i + 1]}`, M + colW, y, { size: 8.5 });
      y -= 12;
    }
    y -= 10;
  }

  /* Terms */
  const block = (heading: string, body?: string | null) => {
    if (!body?.trim()) return;
    const lines = wrap(body, regular, 8.5, A4.w - 2 * M);
    ensure(20 + lines.length * 11);
    text(heading, M, y, { size: 8, font: bold, color: MUTED });
    y -= 13;
    lines.forEach((l) => {
      text(l, M, y, { size: 8.5, color: MUTED });
      y -= 11;
    });
    y -= 8;
  };
  block("PAYMENT TERMS", input.paymentTerms);
  if (input.kind === "quotation") {
    block("PROJECT SCOPE", input.disclaimer || "This quotation is an estimate and not an invoice or proof of payment.");
  } else {
    block("NOTE", "Payments listed were recorded manually by Jarz Digital. Please contact us if anything on this invoice looks incorrect.");
  }

  footer();
  return pdf.save();
}

/** A PDF response that is never cached by shared caches or indexed. */
export function pdfResponse(bytes: Uint8Array, filename: string, download = false): Response {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename.replace(/[^A-Za-z0-9._-]/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
