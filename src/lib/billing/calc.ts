import type { BillingDoc, Currency, Invoice, InvoiceStatus, LineItem, Quotation } from "./types";

/** Pure money/date/numbering helpers shared by the editors and the printed documents. */

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

export const CURRENCY_SYMBOL: Record<Currency, string> = { BDT: "৳", USD: "$" };

export function formatMoney(amount: number, currency: Currency): string {
  const n = round2(amount);
  const digits = Number.isInteger(n) ? 0 : 2;
  const body = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: 2 });
  return `${n < 0 ? "−" : ""}${CURRENCY_SYMBOL[currency]}${body}`;
}

/** "40,000 BDT" style, used in KPI cards and prose. */
export function formatAmountCode(amount: number, currency: Currency): string {
  const n = round2(amount);
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency}`;
}

export function lineAmounts(item: LineItem) {
  const gross = round2(num(item.qty) * num(item.unitPrice));
  // Negative lines (discounts/credits carried over from a quotation) pass through unchanged.
  const discount = Math.min(Math.max(0, gross), Math.max(0, round2(num(item.discount))));
  const tax = round2(((gross - discount) * Math.max(0, num(item.taxRate))) / 100);
  return { gross, discount, tax, total: round2(gross - discount + tax) };
}

export function invoiceTotals(inv: Pick<Invoice, "items" | "payments">) {
  let subtotal = 0;
  let discount = 0;
  let tax = 0;
  for (const item of inv.items) {
    const a = lineAmounts(item);
    subtotal += a.gross;
    discount += a.discount;
    tax += a.tax;
  }
  const grandTotal = round2(subtotal - discount + tax);
  const paid = round2(inv.payments.reduce((s, p) => s + Math.max(0, num(p.amount)), 0));
  return { subtotal: round2(subtotal), discount: round2(discount), tax: round2(tax), grandTotal, paid, balance: round2(grandTotal - paid) };
}

export function invoiceStatus(inv: Invoice, today = todayISO()): InvoiceStatus {
  if (inv.statusOverride !== "auto") return inv.statusOverride;
  const { grandTotal, paid, balance } = invoiceTotals(inv);
  if (grandTotal > 0 && balance <= 0) return "paid";
  if (paid > 0) return "partial";
  if (inv.dueDate && inv.dueDate < today) return "overdue";
  return "unpaid";
}

/** Which schedule milestones the recorded payments cover, in order. */
export function scheduleProgress<T extends { amount: number }>(schedule: T[], paid: number): (T & { state: "Paid" | "Part paid" | "Pending" })[] {
  return schedule.map((m, i) => {
    const start = schedule.slice(0, i).reduce((s, x) => s + num(x.amount), 0);
    const end = start + num(m.amount);
    return { ...m, state: paid >= end && m.amount > 0 ? "Paid" : paid > start ? "Part paid" : "Pending" };
  });
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; tone: string }> = {
  paid: { label: "PAID", tone: "#16a34a" },
  partial: { label: "PARTIALLY PAID", tone: "#d97706" },
  unpaid: { label: "UNPAID", tone: "#2f7bff" },
  overdue: { label: "OVERDUE", tone: "#dc2626" },
};

export function quotationTotals(q: Pick<Quotation, "costs" | "milestones">) {
  const oneTime = round2(q.costs.filter((c) => c.type === "one-time").reduce((s, c) => s + num(c.amount), 0));
  const monthly = round2(q.costs.filter((c) => c.type === "monthly").reduce((s, c) => s + num(c.amount), 0));
  const annual = round2(q.costs.filter((c) => c.type === "annual").reduce((s, c) => s + num(c.amount), 0));
  /** Every recurring cost over one year (annual lines + 12 × monthly lines). */
  const recurringYear = round2(annual + monthly * 12);
  const milestones = round2(q.milestones.reduce((s, m) => s + num(m.amount), 0));
  return { oneTime, monthly, annual, recurringYear, firstYear: round2(oneTime + recurringYear), milestones };
}

/** Development Cost KPI value when it follows the cost table. */
export function primaryCost(q: Pick<Quotation, "costs">): number {
  return num(q.costs.find((c) => c.type === "one-time")?.amount);
}

/** Next JD-QT-2026-001 / JD-INV-2026-001 number for the given year. */
export function nextNumber(docs: Pick<BillingDoc, "kind" | "number">[], kind: BillingDoc["kind"], year: number): string {
  const prefix = `JD-${kind === "quotation" ? "QT" : "INV"}-${year}-`;
  let max = 0;
  for (const d of docs) {
    if (d.kind !== kind || !d.number.startsWith(prefix)) continue;
    const n = Number.parseInt(d.number.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return todayISO(new Date(y, m - 1, d + days));
}

export function formatDocDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso || "—";
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 12) : Math.random().toString(36).slice(2, 14);
