"use client";

import { ArrowRightLeft, ChevronDown, Copy, Download, FileText, Plus, Printer, Receipt, RotateCcw, Search, Settings2, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/admin/ui";
import { formatDocDate, formatMoney, INVOICE_STATUS_META, invoiceStatus, invoiceTotals, quotationTotals } from "@/lib/billing/calc";
import { createInvoice, createQuotation, duplicateDocument, normalizeDoc, normalizeState, PRESET_IDS, PRESETS, sampleState } from "@/lib/billing/defaults";
import type { BillingDoc, BillingState, PresetId, Quotation } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { CompanySettingsDialog, ConvertDialog } from "./dialogs";
import { btn, ConfirmAction } from "./fields";
import { QUOTE_STATUS_OPTIONS } from "./quotation-editor";
import { billing, downloadJson, useBilling } from "./store";
import { Workspace } from "./workspace";

/**
 * Quotation & invoice studio: dashboard list, split-screen editors and A4
 * print output. The open document lives in `?doc=<id>` so back/forward work.
 */
export function BillingStudio() {
  const state = useBilling();
  const params = useSearchParams();
  const router = useRouter();
  const [settings, setSettings] = useState(false);
  const [converting, setConverting] = useState<Quotation | null>(null);

  if (!state) return <div className="h-96 animate-shimmer rounded-2xl bg-[linear-gradient(90deg,var(--color-mist-100)_0%,var(--color-mist-50)_50%,var(--color-mist-100)_100%)] bg-[length:200%_100%]" />;

  const open = (id: string) => router.push(`/admin/billing?doc=${encodeURIComponent(id)}`);
  const docId = params.get("doc");
  const current = docId ? state.documents.find((d) => d.id === docId) : undefined;

  const duplicate = (doc: BillingDoc) => {
    const copy = duplicateDocument(doc, state.documents);
    billing.upsert(copy);
    open(copy.id);
  };

  const dialogs = (
    <>
      {settings && <CompanySettingsDialog company={state.company} onSave={billing.setCompany} onClose={() => setSettings(false)} />}
      {converting && (
        <ConvertDialog
          quote={converting}
          company={state.company}
          docs={state.documents}
          onClose={() => setConverting(null)}
          onConvert={(quote, invoice) => {
            billing.upsertMany([quote, invoice]);
            setConverting(null);
            open(invoice.id);
          }}
        />
      )}
    </>
  );

  if (docId) {
    if (!current) {
      return (
        <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
          <p className="font-semibold text-ink-900">Document not found in this browser</p>
          <p className="mt-1 text-sm text-mist-500">It may have been deleted, or created on another device. Import its JSON to open it here.</p>
          <Link href="/admin/billing" className={cn(btn.base, btn.primary, "mt-5")}>
            Back to all documents
          </Link>
        </div>
      );
    }
    return (
      <>
        <Workspace doc={current} state={state} onConvert={() => current.kind === "quotation" && setConverting(current)} onDuplicate={() => duplicate(current)} />
        {dialogs}
      </>
    );
  }

  return (
    <>
      <Dashboard state={state} open={open} duplicate={duplicate} onConvert={setConverting} onSettings={() => setSettings(true)} />
      {dialogs}
    </>
  );
}

type Tab = "all" | "quotation" | "invoice";

function Dashboard({
  state,
  open,
  duplicate,
  onConvert,
  onSettings,
}: {
  state: BillingState;
  open: (id: string) => void;
  duplicate: (doc: BillingDoc) => void;
  onConvert: (q: Quotation) => void;
  onSettings: () => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const docs = state.documents;

  const quotes = docs.filter((d): d is Quotation => d.kind === "quotation");
  const invoices = docs.filter((d) => d.kind === "invoice");
  const pipeline = quotes.filter((d) => d.status === "draft" || d.status === "sent" || d.status === "approved").reduce((s, d) => s + quotationTotals(d).firstYear, 0);
  const invoiced = invoices.reduce((s, d) => s + invoiceTotals(d).grandTotal, 0);
  const outstanding = invoices.reduce((s, d) => s + Math.max(0, invoiceTotals(d).balance), 0);
  const overdue = invoices.filter((d) => invoiceStatus(d) === "overdue").length;

  const needle = q.trim().toLowerCase();
  const rows = docs
    .filter((d) => tab === "all" || d.kind === tab)
    .filter((d) => !needle || [d.number, d.client.name, d.client.company, d.projectTitle].some((v) => v.toLowerCase().includes(needle)))
    .sort((a, b) => (b.issueDate + b.updatedAt).localeCompare(a.issueDate + a.updatedAt));

  const newQuote = (preset: PresetId | "custom") => {
    const doc = createQuotation({ company: state.company, docs, preset });
    billing.upsert(doc);
    open(doc.id);
  };
  const newInvoice = () => {
    const doc = createInvoice({ company: state.company, docs });
    billing.upsert(doc);
    open(doc.id);
  };

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      const raw: unknown = JSON.parse(await file.text());
      const whole = normalizeState(raw);
      const incoming = whole ? whole.documents : (Array.isArray(raw) ? raw : [raw]).map((d) => normalizeDoc(d, state.company)).filter((d): d is BillingDoc => d !== null);
      if (!incoming.length && !whole) throw new Error("No quotations or invoices found in that file.");
      const ids = new Set(incoming.map((d) => d.id));
      billing.replaceAll({ version: 2, company: whole?.company ?? state.company, documents: [...incoming, ...docs.filter((d) => !ids.has(d.id))] });
      setNotice(`Imported ${incoming.length} document${incoming.length === 1 ? "" : "s"}${whole ? " and the company profile" : ""}.`);
    } catch (e) {
      setNotice(e instanceof Error && !(e instanceof SyntaxError) ? e.message : "That file isn’t valid billing JSON.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const money = (n: number) => formatMoney(n, state.company.defaultCurrency);

  return (
    <>
      <PageHeader
        title="Quotations & invoices"
        description="Build proposals from service presets, convert approved quotations into invoices and export print-ready A4 PDFs."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Quotations & invoices" }]}
        actions={
          <>
            <button type="button" onClick={onSettings} className={cn(btn.base, btn.ghost)}>
              <Settings2 className="size-4" aria-hidden /> Company profile
            </button>
            <button type="button" onClick={newInvoice} className={cn(btn.base, btn.ghost)}>
              <Receipt className="size-4" aria-hidden /> New invoice
            </button>
            <NewQuoteMenu onPick={newQuote} />
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Quotations" value={String(quotes.length)} hint={`${quotes.filter((d) => d.status === "approved" || d.status === "converted").length} approved or converted`} />
        <StatCard label="Open pipeline" value={money(pipeline)} hint="Draft, sent & approved · first-year value" />
        <StatCard label="Invoiced" value={money(invoiced)} hint={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`} />
        <StatCard label="Outstanding" value={money(outstanding)} hint={overdue ? `${overdue} overdue` : "Nothing overdue"} tone={overdue ? "danger" : undefined} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <nav aria-label="Document type" className="flex gap-2">
          {(
            [
              ["all", `All ${docs.length}`],
              ["quotation", `Quotations ${quotes.length}`],
              ["invoice", `Invoices ${invoices.length}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn("shrink-0 rounded-xl border px-4 py-2 text-sm", tab === value ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-600")}
            >
              {label}
            </button>
          ))}
        </nav>
        <label className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
          <span className="sr-only">Search documents</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search number, client or project…"
            className="h-10 w-full rounded-xl border border-mist-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
        <div className="flex gap-2 sm:ml-auto">
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => onImport(e.target.files?.[0])} aria-label="Import JSON file" />
          <button type="button" onClick={() => fileRef.current?.click()} className={cn(btn.base, btn.ghost)}>
            <Upload className="size-4" aria-hidden /> Import
          </button>
          <button type="button" onClick={() => downloadJson(`jarz-billing-${new Date().toISOString().slice(0, 10)}.json`, state)} className={cn(btn.base, btn.ghost)}>
            <Download className="size-4" aria-hidden /> Export all
          </button>
        </div>
      </div>

      {notice && (
        <p className="mb-4 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-900" role="status">
          {notice}
          <button type="button" onClick={() => setNotice("")} className="text-xs font-medium underline">
            Dismiss
          </button>
        </p>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist-300 bg-white p-12 text-center">
          <FileText className="mx-auto size-8 text-mist-300" aria-hidden />
          <p className="mt-3 font-semibold text-ink-900">{needle ? "No matching documents" : "No documents yet"}</p>
          <p className="mt-1 text-sm text-mist-500">Start a quotation from a service preset, or create an invoice directly.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-mist-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-mist-200 bg-mist-25 text-left text-xs font-semibold uppercase tracking-wide text-mist-500">
              <tr>
                <th scope="col" className="px-4 py-3">Document</th>
                <th scope="col" className="px-4 py-3">Client</th>
                <th scope="col" className="px-4 py-3">Issued</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {rows.map((d) => (
                <DocRow key={d.id} doc={d} open={open} duplicate={duplicate} onConvert={onConvert} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mist-200 bg-white px-4 py-3 text-xs text-mist-500">
        <span>Documents are saved in this browser. Export all regularly as a backup — the JSON can be imported on any device or loaded into a database.</span>
        <ConfirmAction confirmLabel="Replace everything with sample data" onConfirm={() => billing.replaceAll(sampleState())} className={cn(btn.base, btn.ghost, "px-2.5 py-1.5 text-xs")}>
          <RotateCcw className="size-3.5" aria-hidden /> Reset to sample data
        </ConfirmAction>
      </div>
    </>
  );
}

function DocRow({ doc, open, duplicate, onConvert }: { doc: BillingDoc; open: (id: string) => void; duplicate: (d: BillingDoc) => void; onConvert: (q: Quotation) => void }) {
  const isQuote = doc.kind === "quotation";
  const amount = isQuote ? quotationTotals(doc).firstYear : invoiceTotals(doc).grandTotal;
  const balance = isQuote ? 0 : invoiceTotals(doc).balance;
  return (
    <tr className="hover:bg-mist-25">
      <td className="px-4 py-3">
        <button type="button" onClick={() => open(doc.id)} className="text-left">
          <span className="flex items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide", isQuote ? "bg-brand-50 text-brand-700" : "bg-azure-500/10 text-azure-600")}>{isQuote ? "Quote" : "Invoice"}</span>
            <span className="font-mono text-[0.8rem] font-semibold text-ink-900 hover:text-brand-700">{doc.number}</span>
          </span>
          <span className="mt-0.5 block max-w-[280px] truncate text-xs text-mist-500">{doc.projectTitle || "Untitled project"}</span>
        </button>
      </td>
      <td className="px-4 py-3">
        <span className="block font-medium text-ink-900">{doc.client.company || doc.client.name || "—"}</span>
        {doc.client.company && doc.client.name && <span className="block text-xs text-mist-500">{doc.client.name}</span>}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-mist-600">{formatDocDate(doc.issueDate)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
        <span className="font-semibold text-ink-900">{formatMoney(amount, doc.currency)}</span>
        {!isQuote && balance > 0 && <span className="block text-xs text-mist-500">Due {formatMoney(balance, doc.currency)}</span>}
      </td>
      <td className="px-4 py-3">
        <StatusPill doc={doc} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {isQuote && (
            <RowAction label="Convert to invoice" onClick={() => onConvert(doc)}>
              <ArrowRightLeft className="size-4" />
            </RowAction>
          )}
          <RowAction label="Open & print" onClick={() => open(doc.id)}>
            <Printer className="size-4" />
          </RowAction>
          <RowAction label="Duplicate" onClick={() => duplicate(doc)}>
            <Copy className="size-4" />
          </RowAction>
          <RowAction label="Export JSON" onClick={() => downloadJson(`${doc.number}.json`, doc)}>
            <Download className="size-4" />
          </RowAction>
          <ConfirmAction confirmLabel="Delete" onConfirm={() => billing.remove(doc.id)} className="rounded-lg p-2 text-mist-400 hover:bg-danger-50 hover:text-danger-500">
            <Trash2 className="size-4" aria-label="Delete" />
          </ConfirmAction>
        </div>
      </td>
    </tr>
  );
}

function RowAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="rounded-lg p-2 text-mist-400 hover:bg-mist-100 hover:text-ink-900">
      {children}
    </button>
  );
}

const QUOTE_TONE: Record<Quotation["status"], string> = {
  draft: "bg-mist-100 text-mist-600",
  sent: "bg-info-50 text-info-500",
  approved: "bg-success-50 text-success-500",
  rejected: "bg-danger-50 text-danger-500",
  converted: "bg-brand-50 text-brand-700",
};

function StatusPill({ doc }: { doc: BillingDoc }) {
  if (doc.kind === "quotation") {
    return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", QUOTE_TONE[doc.status])}>{QUOTE_STATUS_OPTIONS.find((o) => o.value === doc.status)?.label}</span>;
  }
  const meta = INVOICE_STATUS_META[invoiceStatus(doc)];
  return (
    <span className="rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-white" style={{ background: meta.tone }}>
      {meta.label}
    </span>
  );
}

function StatCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "danger" }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-4">
      <p className="text-xs font-medium text-mist-500">{label}</p>
      <p className={cn("mt-1 font-display text-xl font-semibold tabular-nums tracking-tight sm:text-2xl", tone === "danger" ? "text-danger-500" : "text-ink-900")}>{value}</p>
      <p className={cn("mt-0.5 text-xs", tone === "danger" ? "text-danger-500" : "text-mist-500")}>{hint}</p>
    </div>
  );
}

function NewQuoteMenu({ onPick }: { onPick: (preset: PresetId | "custom") => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className={cn(btn.base, btn.primary)}>
        <Plus className="size-4" aria-hidden /> New quotation <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-mist-200 bg-white py-1 shadow-lift">
          {[...PRESET_IDS, "custom" as const].map((id) => (
            <button
              key={id}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onPick(id);
              }}
              className="block w-full px-4 py-2.5 text-left hover:bg-mist-50"
            >
              <span className="block text-sm font-medium text-ink-900">{id === "custom" ? "Blank quotation" : PRESETS[id].label}</span>
              <span className="block text-xs text-mist-500">{id === "custom" ? "Standard costs, terms and timeline — add your own scope" : PRESETS[id].description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
