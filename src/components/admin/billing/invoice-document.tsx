import { Banknote, CalendarClock, Smartphone } from "lucide-react";
import { formatDocDate, formatMoney, INVOICE_STATUS_META, invoiceStatus, invoiceTotals, lineAmounts, scheduleProgress } from "@/lib/billing/calc";
import { DELIVERY } from "@/lib/billing/defaults";
import type { BillingType, CompanyProfile, Invoice } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { CornerPattern, PartyBlock, RichText, RunningFooter, RunningHeader } from "./doc-parts";
import { block, PagedDocument, table, type Flow } from "./paged-document";

/** A4 invoice matching the quotation design: line items, payments deducted and a clear balance due. Long invoices continue onto further pages. */

export const BILLING_TYPE_LABEL: Record<BillingType, string> = { "one-time": "One-Time", milestone: "Milestone", monthly: "Monthly", annual: "Annual" };

const th = "px-2.5 py-2 whitespace-nowrap text-left text-[9px] font-semibold uppercase tracking-[0.12em]";
const td = "px-2.5 py-2 align-top";

export function InvoiceDocument({ inv, company }: { inv: Invoice; company: CompanyProfile }) {
  const t = invoiceTotals(inv);
  const status = invoiceStatus(inv);
  const meta = INVOICE_STATUS_META[status];
  const money = (n: number) => formatMoney(n, inv.currency);

  const schedule = scheduleProgress(inv.schedule, t.paid);

  const flows: Flow[] = [
    block(
      "title",
      <div className="grid grid-cols-[1fr_auto] items-start gap-6">
        <div>
          <h1 className="font-display text-[30px] font-semibold leading-none tracking-tight text-ink-900">Invoice</h1>
          <p className="mt-2 font-mono text-[12px] font-semibold text-mist-600">{inv.number}</p>
          {inv.projectTitle && (
            <p className="mt-1.5 text-[11.5px] text-mist-600">
              Project: <span className="font-semibold text-ink-900">{inv.projectTitle}</span>
              {inv.quotationNumber && <span className="text-mist-400"> · Ref. {inv.quotationNumber}</span>}
              {inv.source && <span className="text-mist-400"> · Order {inv.source.orderNumber}</span>}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-white" style={{ background: meta.tone }}>
            {meta.label}
          </span>
          {inv.delivery !== "none" && (
            <span className="inline-flex items-center gap-1 border border-brand-200 bg-brand-50 px-3 py-1 text-[10px] font-semibold text-brand-800">
              <CalendarClock className="size-3" aria-hidden /> Delivery: {DELIVERY[inv.delivery].label}
            </span>
          )}
        </div>
      </div>,
    ),
    block(
      "facts",
      <div className="grid grid-cols-4 overflow-hidden border border-mist-200 text-[10px]">
        {[
          ["Invoice No", inv.number],
          ["Issue Date", formatDocDate(inv.issueDate)],
          ["Due Date", formatDocDate(inv.dueDate)],
          ["Balance Due", money(Math.max(0, t.balance))],
        ].map(([k, v], i) => (
          <div key={k} className={cn("px-3.5 py-2.5", i > 0 && "border-l border-mist-200", i === 3 && "bg-ink-900 text-white")}>
            <p className={cn("text-[8.5px] font-semibold uppercase tracking-[0.14em]", i === 3 ? "text-brand-300" : "text-mist-500")}>{k}</p>
            <p className={cn("mt-0.5 font-semibold tabular-nums", i === 3 ? "font-display text-[14px]" : "text-[11.5px] text-ink-900")}>{v}</p>
          </div>
        ))}
      </div>,
      { gap: 16 },
    ),
    block(
      "parties",
      <div className="grid grid-cols-2 gap-3">
        <PartyBlock eyebrow="Bill To" client={inv.client} />
        <div className="border border-mist-200 px-4 py-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">Pay To</p>
          <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-mist-700">
            <p className="text-[13px] font-semibold text-ink-900">{company.name}</p>
            <p>{company.address}</p>
            <p>{[company.phone, company.email].filter(Boolean).join("  ·  ")}</p>
            {inv.deliveryNote && <p className="pt-1 font-medium text-brand-800">{inv.deliveryNote}</p>}
          </div>
        </div>
      </div>,
      { gap: 12 },
    ),
    table("items", {
      gap: 16,
      className: "text-[10.5px]",
      head: (
        <tr className="bg-ink-900 text-white">
          <th className={cn(th, "w-7")}>#</th>
          <th className={th}>Item &amp; Description</th>
          <th className={th}>Type</th>
          <th className={cn(th, "text-right")}>Qty</th>
          <th className={cn(th, "text-right")}>Unit Price</th>
          <th className={cn(th, "text-right")}>Discount</th>
          {inv.showTax && <th className={cn(th, "text-right")}>Tax</th>}
          <th className={cn(th, "text-right")}>Total</th>
        </tr>
      ),
      rows: inv.items.map((item, i) => {
        const a = lineAmounts(item);
        return {
          key: item.id,
          node: (
            <tr className={cn("[&>td]:border-b [&>td]:border-mist-200", i % 2 && "bg-mist-25")}>
              <td className={cn(td, "font-mono text-[9.5px] text-mist-400")}>{String(i + 1).padStart(2, "0")}</td>
              <td className={td}>
                <p className="font-semibold text-ink-900">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-[9.5px] leading-snug text-mist-600">
                    <RichText text={item.description} />
                  </p>
                )}
              </td>
              <td className={td}>
                <span className="whitespace-nowrap border border-mist-200 bg-white px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide text-mist-600">
                  {BILLING_TYPE_LABEL[item.billingType]}
                </span>
              </td>
              <td className={cn(td, "text-right tabular-nums")}>{item.qty}</td>
              <td className={cn(td, "whitespace-nowrap text-right tabular-nums")}>{money(item.unitPrice)}</td>
              <td className={cn(td, "whitespace-nowrap text-right tabular-nums text-mist-600")}>{a.discount ? `−${money(a.discount)}` : "—"}</td>
              {inv.showTax && <td className={cn(td, "whitespace-nowrap text-right tabular-nums text-mist-600")}>{a.tax ? `${money(a.tax)} (${item.taxRate}%)` : "—"}</td>}
              <td className={cn(td, "whitespace-nowrap text-right font-semibold tabular-nums text-ink-900")}>{money(a.total)}</td>
            </tr>
          ),
        };
      }),
    }),
    block(
      "totals",
      <div className="relative grid grid-cols-[1fr_250px] gap-4">
        {inv.showStamp && (
          <div
            className="pointer-events-none absolute bottom-0 left-[30%] z-10 -rotate-12 border-[3px] px-5 py-2 text-center font-display text-[26px] font-bold uppercase leading-none tracking-[0.08em] opacity-30"
            style={{ color: meta.tone, borderColor: meta.tone }}
            aria-hidden
          >
            {meta.label}
            <span className="mt-1 block text-[8.5px] tracking-[0.2em]">{company.name}</span>
          </div>
        )}
        <div className="space-y-3">
          <div className="border border-mist-200">
            <p className="border-b border-mist-200 bg-mist-25 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-mist-600">Payment Instructions</p>
            <div className="grid grid-cols-2 divide-x divide-mist-100 text-[10px] leading-relaxed text-mist-700">
              <div className="px-3.5 py-2.5">
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink-900">
                  <Banknote className="size-3.5 text-brand-600" aria-hidden /> Bank Transfer
                </p>
                <RichText text={inv.bankDetails} />
              </div>
              <div className="px-3.5 py-2.5">
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink-900">
                  <Smartphone className="size-3.5 text-brand-600" aria-hidden /> bKash / Nagad
                </p>
                <RichText text={inv.mobileBanking} />
              </div>
            </div>
          </div>
          {inv.notes && (
            <p className="text-[10.5px] leading-relaxed text-mist-600">
              <RichText text={inv.notes} />
            </p>
          )}
        </div>

        <div className="text-[10.5px]">
          <dl className="space-y-1.5 px-1">
            <Row k="Subtotal" v={money(t.subtotal)} />
            <Row k="Discount" v={t.discount ? `−${money(t.discount)}` : money(0)} />
            {inv.showTax && <Row k="Tax / VAT" v={money(t.tax)} />}
            <div className="flex justify-between border-t border-mist-200 pt-1.5 text-[12px] font-bold text-ink-900">
              <dt>Grand Total</dt>
              <dd className="tabular-nums">{money(t.grandTotal)}</dd>
            </div>
            {inv.payments.map((p) => (
              <div key={p.id} className="flex justify-between gap-2 text-success-500">
                <dt className="min-w-0">
                  <span className="block font-medium">Less: Payment received</span>
                  <span className="block text-[9px] text-mist-500">{[formatDocDate(p.date), p.method, p.reference].filter(Boolean).join(" · ")}</span>
                </dt>
                <dd className="shrink-0 font-semibold tabular-nums">−{money(p.amount)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 bg-ink-900 px-4 py-3 text-white">
            <p className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-brand-300">{t.balance < 0 ? "Credit Balance" : "Balance Due"}</p>
            <p className="mt-0.5 font-display text-[22px] font-semibold tabular-nums tracking-tight">{money(Math.abs(t.balance))}</p>
            <p className="text-[9px] text-white/55">Due by {formatDocDate(inv.dueDate)}</p>
          </div>
        </div>
      </div>,
      { gap: 12 },
    ),
  ];

  if (inv.showSchedule && schedule.length > 0) {
    flows.push(
      block("schedule-title", <p className="pb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">Payment Schedule</p>, { gap: 16, keepWithNext: true }),
      table("schedule", {
        className: "border border-mist-200 text-[10px]",
        rows: schedule.map((m, i) => ({
          key: m.id,
          node: (
            <tr className={cn(i > 0 && "[&>td]:border-t [&>td]:border-mist-100")}>
              <td className={cn(td, "font-semibold text-ink-900")}>{m.when}</td>
              <td className={cn(td, "text-mist-600")}>{m.description}</td>
              <td className={cn(td, "text-right font-semibold tabular-nums")}>{money(m.amount)}</td>
              <td className={cn(td, "w-20 text-right")}>
                <span
                  className={cn(
                    "px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide",
                    m.state === "Paid" ? "bg-success-50 text-success-500" : m.state === "Part paid" ? "bg-warning-50 text-warning-500" : "bg-mist-100 text-mist-500",
                  )}
                >
                  {m.state}
                </span>
              </td>
            </tr>
          ),
        })),
      }),
    );
  }

  flows.push(
    block(
      "terms",
      <div className="grid grid-cols-[1fr_220px] items-end gap-8">
        <div>
          {inv.terms.filter(Boolean).length > 0 && (
            <>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">Terms</p>
              <ol className="list-decimal space-y-0.5 pl-4 text-[9.5px] leading-relaxed text-mist-600">
                {inv.terms.filter(Boolean).map((x, i) => (
                  <li key={i}>
                    <RichText text={x} />
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
        {inv.showSignature && (
          <div className="text-center">
            <div className="h-9" />
            <div className="border-t border-ink-900 pt-1.5">
              <p className="text-[10.5px] font-semibold text-ink-900">{inv.signatoryName || "Authorized Signature & Date"}</p>
              <p className="text-[9.5px] text-mist-500">{inv.signatoryTitle}</p>
            </div>
          </div>
        )}
      </div>,
      { gap: 16 },
    ),
  );

  return (
    <PagedDocument
      flows={flows}
      header={<RunningHeader company={company} label={`Invoice · ${inv.number}`} />}
      footer={(page, pages) => <RunningFooter company={company} note={inv.number} page={page} pages={pages} />}
      decor={
        <>
          <CornerPattern corner="top-left" />
          <CornerPattern corner="bottom-left" />
        </>
      }
    />
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-mist-700">
      <dt>{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
