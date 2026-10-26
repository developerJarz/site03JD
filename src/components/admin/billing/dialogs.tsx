"use client";

import { ArrowRightLeft, ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { formatMoney, invoiceTotals } from "@/lib/billing/calc";
import { DEFAULT_LOGO, quotationToInvoice, type ConvertMode } from "@/lib/billing/defaults";
import type { BillingDoc, CompanyProfile, Invoice, Quotation } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { BrandMark } from "./doc-parts";
import { Area, btn, Field, Segmented, Text } from "./fields";

const MAX_LOGO_BYTES = 300 * 1024;

export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const id = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6 print:hidden" role="dialog" aria-modal="true" aria-labelledby={id}>
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-lift sm:rounded-2xl", wide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <header className="flex items-center justify-between border-b border-mist-100 px-5 py-4">
          <h2 id={id} className="font-display text-lg font-semibold text-ink-900">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-mist-500 hover:bg-mist-100" aria-label="Close">
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-mist-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export function CompanySettingsDialog({ company, onSave, onClose }: { company: CompanyProfile; onSave: (c: CompanyProfile) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(company);
  const [logoError, setLogoError] = useState("");
  const set = (k: keyof CompanyProfile) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));

  function onFile(file: File | undefined) {
    setLogoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setLogoError("Choose an image file (PNG, JPG, SVG or WebP).");
    if (file.size > MAX_LOGO_BYTES) return setLogoError("Logo must be under 300 KB — it is stored in this browser. Use a URL for larger files.");
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, logoUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  return (
    <Modal
      title="Company profile & branding"
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className={cn(btn.base, btn.ghost)}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className={cn(btn.base, btn.primary)}
          >
            Save profile
          </button>
        </>
      }
    >
      <div className="flex items-center gap-4 rounded-xl border border-mist-200 bg-mist-25 p-4">
        <BrandMark company={draft} size={52} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className={cn(btn.base, btn.ghost, "cursor-pointer px-2.5 py-1.5 text-xs")}>
              <Upload className="size-3.5" aria-hidden /> Upload logo
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <button type="button" onClick={() => setDraft((d) => ({ ...d, logoUrl: DEFAULT_LOGO }))} className={cn(btn.base, btn.ghost, "px-2.5 py-1.5 text-xs")}>
              <ImageIcon className="size-3.5" aria-hidden /> Use website logo
            </button>
            {draft.logoUrl && (
              <button type="button" onClick={() => setDraft((d) => ({ ...d, logoUrl: "" }))} className={cn(btn.base, btn.ghost, "px-2.5 py-1.5 text-xs")}>
                Use “{draft.monogram || "JD"}” monogram
              </button>
            )}
          </div>
          <Text value={draft.logoUrl.startsWith("data:") ? "" : draft.logoUrl} onChange={set("logoUrl")} placeholder={draft.logoUrl.startsWith("data:") ? "Uploaded image in use — paste a URL to replace" : "…or paste a logo URL"} />
          {logoError && <p className="text-xs text-danger-500">{logoError}</p>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Company name">
          <Text value={draft.name} onChange={set("name")} />
        </Field>
        <Field label="Monogram (logo fallback)">
          <Text value={draft.monogram} onChange={(v) => set("monogram")(v.slice(0, 3))} />
        </Field>
        <Field label="Tagline" className="sm:col-span-2">
          <Text value={draft.tagline} onChange={set("tagline")} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <Text value={draft.address} onChange={set("address")} />
        </Field>
        <Field label="Mobile / WhatsApp">
          <Text value={draft.phone} onChange={set("phone")} />
        </Field>
        <Field label="Email">
          <Text value={draft.email} onChange={set("email")} />
        </Field>
        <Field label="Website">
          <Text value={draft.website} onChange={set("website")} />
        </Field>
        <Field label="Default currency">
          <Segmented
            value={draft.defaultCurrency}
            onChange={(v) => setDraft((d) => ({ ...d, defaultCurrency: v }))}
            options={[
              { value: "BDT", label: "BDT (৳)" },
              { value: "USD", label: "USD ($)" },
            ]}
          />
        </Field>
        <Field label="Default signatory name">
          <Text value={draft.signatoryName} onChange={set("signatoryName")} placeholder="Optional" />
        </Field>
        <Field label="Default signatory title">
          <Text value={draft.signatoryTitle} onChange={set("signatoryTitle")} />
        </Field>
        <Field label="Bank account details" hint="Copied onto new invoices." className="sm:col-span-2">
          <Area value={draft.bankDetails} onChange={set("bankDetails")} rows={4} />
        </Field>
        <Field label="bKash / Nagad numbers" hint="Copied onto new invoices." className="sm:col-span-2">
          <Area value={draft.mobileBanking} onChange={set("mobileBanking")} rows={3} />
        </Field>
      </div>
      <p className="text-xs text-mist-500">Branding and contact details update every document instantly. Payment instructions and signatory are copied when a document is created.</p>
    </Modal>
  );
}

export function ConvertDialog({
  quote,
  company,
  docs,
  onConvert,
  onClose,
}: {
  quote: Quotation;
  company: CompanyProfile;
  docs: BillingDoc[];
  onConvert: (quote: Quotation, invoice: Invoice) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<ConvertMode>("full");
  const preview = quotationToInvoice(quote, { company, docs, mode });
  const total = invoiceTotals(preview).grandTotal;
  return (
    <Modal
      title="Convert quotation to invoice"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={cn(btn.base, btn.ghost)}>
            Cancel
          </button>
          <button type="button" onClick={() => onConvert({ ...quote, status: "converted", invoiceIds: [...quote.invoiceIds, preview.id] }, preview)} className={cn(btn.base, btn.brand)}>
            <ArrowRightLeft className="size-4" aria-hidden /> Create {preview.number}
          </button>
        </>
      }
    >
      <p className="text-sm text-mist-600">
        Pulls client details, delivery note and the milestone schedule from <span className="font-mono font-semibold text-ink-900">{quote.number}</span>.
        {quote.invoiceIds.length > 0 && ` This quotation already has ${quote.invoiceIds.length} invoice${quote.invoiceIds.length > 1 ? "s" : ""}.`}
      </p>
      <div className="space-y-2">
        {(
          [
            ["full", "Full project", "One line per cost (development, setup, hosting)."],
            ["milestones", "Milestone billing", "One line per payment milestone (advance, completion, go-live)."],
          ] as const
        ).map(([value, label, hint]) => (
          <label key={value} className={cn("flex cursor-pointer gap-3 rounded-xl border p-3.5", mode === value ? "border-brand-500 bg-brand-50/50" : "border-mist-200")}>
            <input type="radio" name="convert-mode" checked={mode === value} onChange={() => setMode(value)} className="mt-1 accent-brand-600" />
            <span>
              <span className="block text-sm font-semibold text-ink-900">{label}</span>
              <span className="block text-xs text-mist-500">{hint}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="rounded-lg bg-mist-50 px-3.5 py-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-mist-600">{preview.items.length} line items</span>
          <span className="font-semibold tabular-nums text-ink-900">{formatMoney(total, preview.currency)}</span>
        </div>
        {preview.deliveryNote && <p className="mt-1 text-xs text-brand-700">{preview.deliveryNote}</p>}
      </div>
    </Modal>
  );
}
