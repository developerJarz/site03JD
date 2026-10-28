"use client";

import { ExternalLink, FileInput, Library, Minus, Plus, Search } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useId, useMemo, useState } from "react";
import { formatDocDate, formatMoney, todayISO } from "@/lib/billing/calc";
import { catalogAmount, convert, docsForOrder, effectiveRate, EMPTY_CATALOG, orderToQuotation, searchCatalog, type BillingCatalog, type CatalogItem, type OrderImport } from "@/lib/billing/catalog";
import { quotationToInvoice } from "@/lib/billing/defaults";
import type { BillingDoc, CompanyProfile, Currency, Invoice, OrderSource, Quotation } from "@/lib/billing/types";
import { cn } from "@/lib/utils";
import { Modal } from "./dialogs";
import { btn, Field, inputCls, Num, Segmented, Toggle } from "./fields";

/** The website's service rates, loaded on the server and shared by every editor. */
const CatalogContext = createContext<BillingCatalog>(EMPTY_CATALOG);
export const CatalogProvider = CatalogContext.Provider;
export const useCatalog = () => useContext(CatalogContext);

const BILLING_SUFFIX = { "one-time": "", monthly: "/mo", annual: "/yr" } as const;

export interface PickedItem {
  item: CatalogItem;
  qty: number;
}

/**
 * Searchable list of every service plan and e-commerce feature with its
 * website rate, converted to the document currency. Picked items are copied
 * into the document, so they stay editable afterwards.
 */
export function CatalogPicker({
  currency,
  company,
  scopeOption,
  onAdd,
  onClose,
}: {
  currency: Currency;
  company: Pick<CompanyProfile, "usdToBdt">;
  /** Quotations can also copy each item's capabilities into the Scope of Work table. */
  scopeOption?: boolean;
  onAdd: (picked: PickedItem[], opts: { withScope: boolean; rate: number }) => void;
  onClose: () => void;
}) {
  const catalog = useCatalog();
  const [rate, onRate] = useState(() => effectiveRate(company, catalog));
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [withScope, setWithScope] = useState(true);

  const groups = useMemo(() => [...new Set(catalog.items.map((i) => i.group))], [catalog.items]);
  const needle = q.trim().toLowerCase();
  const visible = catalog.items.filter(
    (i) => (group === "all" || i.group === group) && (!needle || [i.title, i.group, i.description].some((v) => v.toLowerCase().includes(needle))),
  );
  const needsRate = catalog.items.some((i) => i.currency !== currency);
  const chosen = catalog.items.filter((i) => picked[i.id]).map((item) => ({ item, qty: picked[item.id] }));
  const total = chosen.reduce((s, { item, qty }) => s + (catalogAmount(item, currency, rate) ?? 0) * qty, 0);

  const toggle = (id: string) => setPicked(({ [id]: had, ...rest }) => (had ? rest : { ...rest, [id]: 1 }));
  const setQty = (id: string, qty: number) => setPicked((p) => ({ ...p, [id]: Math.max(1, Math.min(99, qty)) }));

  return (
    <Modal
      title="Add from website services & rates"
      onClose={onClose}
      wide
      footer={
        <>
          <span className="mr-auto self-center text-xs text-mist-500">
            {chosen.length ? (
              <>
                {chosen.length} selected · <span className="font-semibold tabular-nums text-ink-900">{formatMoney(total, currency)}</span>
              </>
            ) : (
              "Select one or more items"
            )}
          </span>
          <button type="button" onClick={onClose} className={cn(btn.base, btn.ghost)}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!chosen.length}
            onClick={() => {
              onAdd(chosen, { withScope, rate });
              onClose();
            }}
            className={cn(btn.base, btn.primary)}
          >
            <Plus className="size-4" aria-hidden /> Add {chosen.length || ""} item{chosen.length === 1 ? "" : "s"}
          </button>
        </>
      }
    >
      {catalog.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-mist-300 p-6 text-center text-sm text-mist-500">
          No priced services found. Add plans to your services, or publish E-commerce Builder pricing.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
              <span className="sr-only">Search services</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search services, plans, features…"
                autoFocus
                className="h-10 w-full rounded-lg border border-mist-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Service group" className="h-10 rounded-lg border border-mist-200 bg-white px-3 text-sm sm:w-56">
              <option value="all">All services ({catalog.items.length})</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {needsRate && (
            <div className="flex flex-wrap items-end gap-3 rounded-lg bg-mist-50 p-3">
              <Field label="USD → BDT rate" hint={rate > 0 ? `Website rates are in USD; $1 = ৳${rate}.` : "Set a rate to convert USD website rates into taka."} className="w-48">
                <Num value={rate} onChange={onRate} step={0.5} />
              </Field>
              {currency === "BDT" && !(rate > 0) && <p className="pb-6 text-xs text-danger-500">Without a rate, USD items are added at 0.</p>}
            </div>
          )}

          <ul className="max-h-[46dvh] divide-y divide-mist-100 overflow-y-auto rounded-xl border border-mist-200">
            {visible.length === 0 && <li className="p-6 text-center text-sm text-mist-500">No matching services.</li>}
            {visible.map((item) => {
              const on = Boolean(picked[item.id]);
              const amount = catalogAmount(item, currency, rate);
              return (
                <li key={item.id} className={cn("flex items-start gap-3 px-3.5 py-3", on && "bg-brand-50/50")}>
                  <input type="checkbox" checked={on} onChange={() => toggle(item.id)} aria-label={`Select ${item.title}`} className="mt-1 size-4 accent-brand-600" />
                  <button type="button" onClick={() => toggle(item.id)} className="min-w-0 flex-1 text-left">
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-mist-400">{item.group}</span>
                    <span className="block text-sm font-medium text-ink-900">{item.title}</span>
                    {item.description && <span className="mt-0.5 line-clamp-2 block text-xs text-mist-500">{item.description}</span>}
                  </button>
                  <div className="shrink-0 text-right">
                    <span className="block text-sm font-semibold tabular-nums text-ink-900">
                      {amount === null ? "Custom" : `${formatMoney(amount, currency)}${BILLING_SUFFIX[item.billing]}`}
                    </span>
                    <span className="block text-[0.7rem] text-mist-500">{item.priceLabel}</span>
                    {on && item.unitLabel && (
                      <span className="mt-1.5 inline-flex items-center gap-1">
                        <button type="button" onClick={() => setQty(item.id, picked[item.id] - 1)} className="rounded border border-mist-200 p-0.5" aria-label="Fewer">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-10 text-center text-xs tabular-nums">
                          {picked[item.id]} {item.unitLabel}
                        </span>
                        <button type="button" onClick={() => setQty(item.id, picked[item.id] + 1)} className="rounded border border-mist-200 p-0.5" aria-label="More">
                          <Plus className="size-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {scopeOption ? <Toggle checked={withScope} onChange={setWithScope} label="Also add each item to the Scope of Work table" /> : <span />}
            <span className="text-[0.7rem] text-mist-500">
              Rates from your published service pages{catalog.pricebookVersion ? ` and E-commerce pricebook v${catalog.pricebookVersion}` : ""}. Everything stays editable after adding.
            </span>
          </div>
        </>
      )}
    </Modal>
  );
}

/**
 * Text input that suggests website services and e-commerce features as you
 * type. Picking one fills the row with the website's name, description and rate
 * (converted to the document currency); typing anything else stays free text.
 */
export function CatalogSuggest({
  value,
  onChange,
  onPick,
  currency,
  company,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (item: CatalogItem, rate: number) => void;
  currency: Currency;
  company: Pick<CompanyProfile, "usdToBdt">;
  placeholder?: string;
}) {
  const catalog = useCatalog();
  const rate = effectiveRate(company, catalog);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = useMemo(() => searchCatalog(catalog.items, value), [catalog.items, value]);
  const show = open && matches.length > 0;
  const current = Math.min(active, matches.length - 1);

  const pick = (item: CatalogItem) => {
    onPick(item, rate);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={show ? `${listId}-${current}` : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") return setOpen(false);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!show) return setOpen(true);
            const step = e.key === "ArrowDown" ? 1 : -1;
            setActive((current + step + matches.length) % matches.length);
          } else if (e.key === "Enter" && show) {
            e.preventDefault();
            pick(matches[current]);
          }
        }}
        className={inputCls}
      />
      {show && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[23rem] min-w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-mist-200 bg-white shadow-lg shadow-ink-900/10">
          <ul id={listId} role="listbox" aria-label="Website services and rates" className="max-h-72 overflow-y-auto py-1">
            {matches.map((item, i) => {
              const amount = catalogAmount(item, currency, rate);
              return (
                <li
                  key={item.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === current}
                  // mousedown + preventDefault keeps focus in the input, so blur doesn't close the list first.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(item);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex cursor-pointer items-start gap-3 px-3 py-2", i === current && "bg-brand-50")}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.62rem] font-semibold uppercase tracking-wide text-mist-400">{item.group}</span>
                    <span className="block truncate text-sm font-medium text-ink-900">{item.title}</span>
                    {item.description && <span className="block truncate text-xs text-mist-500">{item.description}</span>}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold tabular-nums text-ink-900">
                      {amount === null ? "Custom" : `${formatMoney(amount, currency)}${BILLING_SUFFIX[item.billing]}`}
                    </span>
                    {item.currency !== currency && <span className="block text-[0.65rem] text-mist-500">{item.priceLabel}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-mist-100 bg-mist-25 px-3 py-1.5 text-[0.65rem] text-mist-500">
            Website rates · ↑↓ to move, Enter to fill{currency === "BDT" && rate > 0 && catalog.items.some((i) => i.currency === "USD") ? ` · $1 = ৳${rate}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

/** Banner tying a studio document back to the E-commerce Builder order it came from. */
export function OrderLink({ source }: { source: OrderSource }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-azure-500/30 bg-azure-500/5 px-3.5 py-2.5 text-xs">
      <span className="text-mist-700">
        Generated from E-commerce order <span className="font-mono font-semibold text-ink-900">{source.orderNumber}</span>
        <span className="text-mist-500"> · website quotation {source.quoteNumber}</span>
      </span>
      <Link href={`/admin/ecommerce-builder/orders/${source.orderId}`} className="inline-flex shrink-0 items-center gap-1 font-medium text-brand-700 hover:underline">
        Open order <ExternalLink className="size-3" aria-hidden />
      </Link>
    </div>
  );
}

/** Button that opens the picker; used in the cost and line-item panels. */
export function CatalogButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn(btn.base, btn.ghost, "w-full border-dashed border-brand-300 text-brand-800 hover:border-brand-500 hover:bg-brand-50")}>
      <Library className="size-4" aria-hidden /> Add from website services & rates
    </button>
  );
}

/**
 * Hook from an E-commerce Builder order into the studio: converts the order's
 * price snapshot into an editable quotation (and optionally its invoice).
 */
export function OrderImportDialog({
  order,
  company,
  docs,
  initialAs,
  onCreate,
  onOpen,
  onClose,
}: {
  order: OrderImport;
  company: CompanyProfile;
  docs: BillingDoc[];
  initialAs: "quotation" | "invoice";
  onCreate: (docs: (Quotation | Invoice)[], open: string) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const [currency, setCurrency] = useState<Currency>(company.defaultCurrency);
  const [rate, setRate] = useState(company.usdToBdt > 0 ? company.usdToBdt : (order.usdToBdt ?? 0));
  const linked = docsForOrder(docs, order.id);
  const b = order.breakdown;
  const totalUsd = b.total / 100;
  const converted = convert(totalUsd, order.currency, currency, rate);
  const blocked = converted === null;
  const paid = order.payments.reduce((s, p) => s + p.amount, 0) / 100;

  function create(as: "quotation" | "invoice") {
    const quote = orderToQuotation(order, { company, docs, currency, rate, today: todayISO() });
    if (as === "quotation") return onCreate([quote], quote.id);
    const invoice = quotationToInvoice(quote, { company, docs: [...docs, quote], mode: "full" });
    onCreate([{ ...quote, status: "converted", invoiceIds: [invoice.id] }, invoice], invoice.id);
  }

  return (
    <Modal
      title={`Bring order ${order.number} into Quotations & invoices`}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className={cn(btn.base, btn.ghost)}>
            Cancel
          </button>
          <button type="button" disabled={blocked} onClick={() => create("quotation")} className={cn(btn.base, initialAs === "quotation" ? btn.primary : btn.ghost)}>
            <FileInput className="size-4" aria-hidden /> Create quotation
          </button>
          <button type="button" disabled={blocked} onClick={() => create("invoice")} className={cn(btn.base, initialAs === "invoice" ? btn.primary : btn.ghost)}>
            <FileInput className="size-4" aria-hidden /> Create quotation + invoice
          </button>
        </>
      }
    >
      <div className="rounded-xl border border-mist-200 bg-mist-25 p-4 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-ink-900">{order.customer.businessName || order.customer.name}</p>
            <p className="text-xs text-mist-500">
              {order.number} · quotation {order.quoteNumber} · submitted {formatDocDate(order.createdAt.slice(0, 10))}
            </p>
          </div>
          <Link href={`/admin/ecommerce-builder/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
            View order <ExternalLink className="size-3" aria-hidden />
          </Link>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt className="text-mist-500">Template</dt>
            <dd className="font-medium text-ink-900">{b.template.name}</dd>
          </div>
          <div>
            <dt className="text-mist-500">Paid features</dt>
            <dd className="font-medium text-ink-900">
              {b.lines.length}
              {b.custom.length > 0 && ` + ${b.custom.length} custom`}
            </dd>
          </div>
          <div>
            <dt className="text-mist-500">Order total</dt>
            <dd className="font-semibold tabular-nums text-ink-900">
              {formatMoney(totalUsd, order.currency)}
              {paid > 0 && <span className="block font-normal text-success-500">{formatMoney(paid, order.currency)} paid</span>}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Document currency">
          <Segmented
            value={currency}
            onChange={setCurrency}
            options={[
              { value: "BDT", label: "BDT (৳)" },
              { value: "USD", label: "USD ($)" },
            ]}
          />
        </Field>
        {currency !== order.currency && (
          <Field label="USD → BDT rate" hint={order.usdToBdt ? `E-commerce Builder rate: ${order.usdToBdt}` : "Not set in the E-commerce Builder."}>
            <Num value={rate} onChange={setRate} step={0.5} />
          </Field>
        )}
      </div>

      <p className="rounded-lg bg-brand-50/60 px-3.5 py-2.5 text-sm text-brand-900">
        {converted === null ? (
          "Enter an exchange rate to convert the order into taka."
        ) : (
          <>
            Every template, feature, discount, tax and recurring fee becomes an editable line ({formatMoney(converted, currency)} total). Client details, scope of work, payment
            milestones, terms and recorded payments are filled in for you — change anything before downloading the PDF.
          </>
        )}
      </p>

      {linked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-900">Already created from this order in this browser:</p>
          <ul className="divide-y divide-mist-100 rounded-xl border border-mist-200">
            {linked.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                <span>
                  <span className="mr-2 rounded bg-mist-100 px-1.5 py-0.5 text-[0.62rem] font-bold uppercase text-mist-600">{d.kind === "quotation" ? "Quote" : "Invoice"}</span>
                  <span className="font-mono font-semibold text-ink-900">{d.number}</span>
                </span>
                <button type="button" onClick={() => onOpen(d.id)} className={cn(btn.base, btn.ghost, "px-2.5 py-1.5 text-xs")}>
                  Open
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
