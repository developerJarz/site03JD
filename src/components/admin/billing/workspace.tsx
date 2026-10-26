"use client";

import { ArrowLeft, ArrowRightLeft, Check, Copy, Download, Printer, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatMoney, INVOICE_STATUS_META, invoiceStatus, invoiceTotals, quotationTotals } from "@/lib/billing/calc";
import type { BillingDoc, BillingState } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { btn, Segmented } from "./fields";
import { InvoiceDocument } from "./invoice-document";
import { InvoiceEditor } from "./invoice-editor";
import { QuotationDocument } from "./quotation-document";
import { QuotationEditor } from "./quotation-editor";
import { billing, downloadJson } from "./store";

const A4_PX = 793.7; // 210mm at 96dpi

/** Scale the A4 preview to the column width (CSS zoom keeps layout and print untouched). */
function usePreviewZoom() {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setZoom(Math.min(1, Math.max(0.3, (width - 2) / A4_PX)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, zoom };
}

export function printDocument(doc: BillingDoc) {
  const previous = document.title;
  const who = doc.client.company || doc.client.name;
  document.title = [doc.number, who].filter(Boolean).join(" - ");
  const restore = () => {
    document.title = previous;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

export function Workspace({ doc, state, onConvert, onDuplicate }: { doc: BillingDoc; state: BillingState; onConvert: () => void; onDuplicate: () => void }) {
  const { ref, zoom } = usePreviewZoom();
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const saveError = billing.saveError();
  const company = state.company;

  const summary =
    doc.kind === "quotation"
      ? `First year ${formatMoney(quotationTotals(doc).firstYear, doc.currency)}`
      : `${INVOICE_STATUS_META[invoiceStatus(doc)].label} · Balance ${formatMoney(invoiceTotals(doc).balance, doc.currency)}`;

  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-10 print:m-0">
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 border-b border-mist-200 bg-white/90 px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:px-10 print:hidden">
        <Link href="/admin/billing" className={cn(btn.base, btn.ghost, "px-2.5")} aria-label="Back to all documents">
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-2 truncate text-sm font-semibold text-ink-900">
            <span className={cn("rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide", doc.kind === "quotation" ? "bg-brand-50 text-brand-700" : "bg-azure-500/10 text-azure-600")}>
              {doc.kind === "quotation" ? "Quotation" : "Invoice"}
            </span>
            <span className="font-mono">{doc.number}</span>
            <span className="truncate font-normal text-mist-500">{doc.client.company || doc.client.name}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mist-500">
            {saveError ? (
              <span className="flex items-center gap-1 text-danger-500">
                <TriangleAlert className="size-3" aria-hidden /> {saveError}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-success-500">
                <Check className="size-3" aria-hidden /> Saved in this browser
              </span>
            )}
            <span aria-hidden>·</span>
            {summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {doc.kind === "quotation" && (
            <button type="button" onClick={onConvert} className={cn(btn.base, btn.ghost)}>
              <ArrowRightLeft className="size-4" aria-hidden /> <span className="hidden md:inline">Convert to invoice</span>
            </button>
          )}
          <button type="button" onClick={onDuplicate} className={cn(btn.base, btn.ghost)} title="Duplicate">
            <Copy className="size-4" aria-hidden /> <span className="hidden xl:inline">Duplicate</span>
          </button>
          <button type="button" onClick={() => downloadJson(`${doc.number}.json`, doc)} className={cn(btn.base, btn.ghost)} title="Export JSON">
            <Download className="size-4" aria-hidden /> <span className="hidden xl:inline">JSON</span>
          </button>
          <button type="button" onClick={() => printDocument(doc)} className={cn(btn.base, btn.primary)}>
            <Printer className="size-4" aria-hidden /> Download PDF / Print
          </button>
        </div>
      </div>

      <div className="flex justify-center border-b border-mist-200 bg-white py-2 lg:hidden print:hidden">
        <Segmented
          value={mobileView}
          onChange={setMobileView}
          options={[
            { value: "edit", label: "Edit" },
            { value: "preview", label: "Preview" },
          ]}
        />
      </div>

      <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(360px,440px)_minmax(0,1fr)] lg:px-10 print:block print:p-0">
        <aside className={cn("lg:sticky lg:top-[8.5rem] lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto lg:pr-1 print:hidden", mobileView === "preview" && "hidden lg:block")}>
          {doc.kind === "quotation" ? (
            <QuotationEditor key={doc.id} q={doc} onChange={billing.upsert} />
          ) : (
            <InvoiceEditor key={doc.id} inv={doc} company={company} onChange={billing.upsert} />
          )}
        </aside>

        <div className={cn("min-w-0", mobileView === "edit" && "hidden lg:block print:block")}>
          <p className="mb-2 text-center text-[0.7rem] text-mist-500 print:hidden">Live A4 preview · red guides mark approximate page edges; printing adds clean page breaks</p>
          <div ref={ref} className="billing-print-area rounded-2xl bg-mist-200/70 p-0 sm:p-4" style={{ ["--doc-zoom" as string]: zoom }}>
            <div className="billing-zoom">{doc.kind === "quotation" ? <QuotationDocument q={doc} company={company} /> : <InvoiceDocument inv={doc} company={company} />}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
