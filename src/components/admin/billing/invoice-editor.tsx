"use client";

import { Banknote, CalendarClock, FileText, ListChecks, PenLine, Receipt, RotateCcw, Stamp, User, Wallet } from "lucide-react";
import { addDays, formatMoney, INVOICE_STATUS_META, invoiceStatus, invoiceTotals, lineAmounts, uid } from "@/lib/billing/calc";
import { deliveryNote } from "@/lib/billing/defaults";
import type { BillingType, CompanyProfile, Invoice, InvoiceStatus } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { BILLING_TYPE_LABEL } from "./invoice-document";
import { Area, btn, Field, ListEditor, Num, Panel, Segmented, Select, StringList, Text, Toggle } from "./fields";
import { ClientFields } from "./quotation-editor";

const PAYMENT_METHODS = ["Bank Transfer", "bKash", "Nagad", "Rocket", "Cash", "Card / SSLCommerz", "Cheque"];

export function InvoiceEditor({ inv, company, onChange }: { inv: Invoice; company: CompanyProfile; onChange: (inv: Invoice) => void }) {
  const set = <K extends keyof Invoice>(key: K, value: Invoice[K]) => onChange({ ...inv, [key]: value });
  const t = invoiceTotals(inv);
  const money = (n: number) => formatMoney(n, inv.currency);
  const auto = invoiceStatus({ ...inv, statusOverride: "auto" });

  return (
    <div className="space-y-3">
      <Panel title="Invoice details" icon={FileText} defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Invoice number">
            <Text value={inv.number} onChange={(v) => set("number", v)} className="font-mono" />
          </Field>
          <Field label="Status badge" hint={inv.statusOverride === "auto" ? `Auto: ${INVOICE_STATUS_META[auto].label}` : "Manual override"}>
            <Select<InvoiceStatus | "auto">
              value={inv.statusOverride}
              onChange={(v) => set("statusOverride", v)}
              options={[
                { value: "auto", label: "Auto (from payments)" },
                ...(Object.keys(INVOICE_STATUS_META) as InvoiceStatus[]).map((s) => ({ value: s, label: INVOICE_STATUS_META[s].label })),
              ]}
            />
          </Field>
          <Field label="Issue date">
            <Text type="date" value={inv.issueDate} onChange={(v) => set("issueDate", v)} />
          </Field>
          <Field label="Due date">
            <Text type="date" value={inv.dueDate} onChange={(v) => set("dueDate", v)} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[7, 15, 30].map((d) => (
            <button key={d} type="button" onClick={() => set("dueDate", addDays(inv.issueDate, d))} className="rounded-full border border-mist-200 bg-white px-2.5 py-1 text-xs text-mist-600 hover:border-brand-400 hover:text-brand-700">
              Due in {d} days
            </button>
          ))}
        </div>
        <Field label="Project title">
          <Text value={inv.projectTitle} onChange={(v) => set("projectTitle", v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quotation reference">
            <Text value={inv.quotationNumber} onChange={(v) => set("quotationNumber", v)} placeholder="Optional" className="font-mono" />
          </Field>
          <Field label="Currency">
            <Segmented
              value={inv.currency}
              onChange={(v) => set("currency", v)}
              options={[
                { value: "BDT", label: "BDT (৳)" },
                { value: "USD", label: "USD ($)" },
              ]}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Delivery timeline" icon={CalendarClock}>
        <Segmented
          value={inv.delivery}
          onChange={(v) => onChange({ ...inv, delivery: v, deliveryNote: v === "none" ? "" : deliveryNote(v) })}
          options={[
            { value: "website", label: "7–15 Days" },
            { value: "software", label: "15–30 Days" },
            { value: "none", label: "No badge" },
          ]}
        />
        <Field label="Delivery note">
          <Text value={inv.deliveryNote} onChange={(v) => set("deliveryNote", v)} />
        </Field>
      </Panel>

      <Panel title="Client billing details" icon={User} defaultOpen={!inv.client.name}>
        <ClientFields client={inv.client} onChange={(c) => set("client", c)} />
      </Panel>

      <Panel title="Line items" icon={Receipt} defaultOpen badge={<span className="rounded-full bg-mist-100 px-1.5 text-[0.65rem] font-semibold text-mist-600">{inv.items.length}</span>}>
        <Toggle checked={inv.showTax} onChange={(v) => set("showTax", v)} label="Show Tax / VAT column" />
        <ListEditor
          items={inv.items}
          onChange={(v) => set("items", v)}
          create={() => ({ id: uid(), title: "", description: "", billingType: "one-time" as const, qty: 1, unitPrice: 0, discount: 0, taxRate: 0 })}
          addLabel="Add line item"
          compact
          render={(item, update) => (
            <>
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <Text value={item.title} onChange={(v) => update({ title: v })} placeholder="Item title" />
                <Select<BillingType>
                  value={item.billingType}
                  onChange={(v) => update({ billingType: v })}
                  options={(Object.keys(BILLING_TYPE_LABEL) as BillingType[]).map((b) => ({ value: b, label: BILLING_TYPE_LABEL[b] }))}
                />
              </div>
              <Area value={item.description} onChange={(v) => update({ description: v })} rows={2} placeholder="Detailed description / features" />
              <div className={cn("grid gap-2", inv.showTax ? "grid-cols-4" : "grid-cols-3")}>
                <Field label="Qty">
                  <Num value={item.qty} onChange={(v) => update({ qty: v })} />
                </Field>
                <Field label="Unit price">
                  <Num value={item.unitPrice} onChange={(v) => update({ unitPrice: v })} step={500} />
                </Field>
                <Field label="Discount">
                  <Num value={item.discount} onChange={(v) => update({ discount: v })} step={100} />
                </Field>
                {inv.showTax && (
                  <Field label="Tax %">
                    <Num value={item.taxRate} onChange={(v) => update({ taxRate: v })} step={0.5} />
                  </Field>
                )}
              </div>
              <p className="text-right text-xs text-mist-500">
                Line total <span className="font-semibold tabular-nums text-ink-900">{money(lineAmounts(item).total)}</span>
              </p>
            </>
          )}
        />
        <dl className="grid grid-cols-3 gap-2 rounded-lg bg-mist-50 p-3 text-xs">
          <div>
            <dt className="text-mist-500">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{money(t.subtotal)}</dd>
          </div>
          <div>
            <dt className="text-mist-500">Discount</dt>
            <dd className="font-semibold tabular-nums">−{money(t.discount)}</dd>
          </div>
          <div>
            <dt className="text-mist-500">Grand total</dt>
            <dd className="font-bold tabular-nums text-brand-700">{money(t.grandTotal)}</dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Payments received" icon={Wallet} defaultOpen badge={<span className="rounded-full bg-success-50 px-1.5 text-[0.65rem] font-semibold text-success-500">{money(t.paid)}</span>}>
        <p className="text-xs text-mist-500">Advance and previous payments are deducted from the grand total on the invoice.</p>
        <ListEditor
          items={inv.payments}
          onChange={(v) => set("payments", v)}
          create={() => ({ id: uid(), date: inv.issueDate, method: "bKash", reference: "", amount: Math.max(0, t.balance) })}
          addLabel="Record payment"
          compact
          render={(p, update) => (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Text type="date" value={p.date} onChange={(v) => update({ date: v })} />
                <Num value={p.amount} onChange={(v) => update({ amount: v })} step={500} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={PAYMENT_METHODS.includes(p.method) ? p.method : "Other"} onChange={(v) => update({ method: v === "Other" ? "" : v })} options={[...PAYMENT_METHODS, "Other"].map((m) => ({ value: m, label: m }))} />
                <Text value={p.reference} onChange={(v) => update({ reference: v })} placeholder="TrxID / reference" />
              </div>
              {!PAYMENT_METHODS.includes(p.method) && <Text value={p.method} onChange={(v) => update({ method: v })} placeholder="Payment method" />}
            </>
          )}
        />
        <div className={cn("flex items-center justify-between rounded-lg px-3 py-2.5 text-sm", t.balance > 0 ? "bg-ink-900 text-white" : "bg-success-50 text-success-500")}>
          <span className="font-medium">{t.balance < 0 ? "Credit balance" : "Balance due"}</span>
          <span className="font-display text-base font-semibold tabular-nums">{money(Math.abs(t.balance))}</span>
        </div>
      </Panel>

      <Panel title="Milestone schedule" icon={ListChecks}>
        <Toggle checked={inv.showSchedule} onChange={(v) => set("showSchedule", v)} label="Show payment schedule on invoice" />
        <ListEditor
          items={inv.schedule}
          onChange={(v) => set("schedule", v)}
          create={() => ({ id: uid(), when: "", description: "", amount: 0 })}
          addLabel="Add milestone"
          compact
          render={(m, update) => (
            <>
              <Text value={m.when} onChange={(v) => update({ when: v })} placeholder="When" />
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <Text value={m.description} onChange={(v) => update({ description: v })} placeholder="For what" />
                <Num value={m.amount} onChange={(v) => update({ amount: v })} step={500} />
              </div>
            </>
          )}
        />
      </Panel>

      <Panel title="Payment instructions" icon={Banknote}>
        <Field label="Bank account details">
          <Area value={inv.bankDetails} onChange={(v) => set("bankDetails", v)} rows={4} />
        </Field>
        <Field label="bKash / Nagad">
          <Area value={inv.mobileBanking} onChange={(v) => set("mobileBanking", v)} rows={3} />
        </Field>
        <button type="button" onClick={() => onChange({ ...inv, bankDetails: company.bankDetails, mobileBanking: company.mobileBanking })} className={cn(btn.base, btn.ghost, "px-2.5 py-1.5 text-xs")}>
          <RotateCcw className="size-3.5" aria-hidden /> Reload from company settings
        </button>
      </Panel>

      <Panel title="Notes & terms" icon={PenLine}>
        <Field label="Note to client">
          <Area value={inv.notes} onChange={(v) => set("notes", v)} rows={2} />
        </Field>
        <Field label="Terms">
          <StringList items={inv.terms} onChange={(v) => set("terms", v)} addLabel="Add term" />
        </Field>
      </Panel>

      <Panel title="Stamp & signature" icon={Stamp}>
        <Toggle checked={inv.showStamp} onChange={(v) => set("showStamp", v)} label={`Show "${INVOICE_STATUS_META[invoiceStatus(inv)].label}" watermark stamp`} />
        <Toggle checked={inv.showSignature} onChange={(v) => set("showSignature", v)} label="Show authorized signature block" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Signatory name">
            <Text value={inv.signatoryName} onChange={(v) => set("signatoryName", v)} placeholder="Optional" />
          </Field>
          <Field label="Signatory title">
            <Text value={inv.signatoryTitle} onChange={(v) => set("signatoryTitle", v)} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
