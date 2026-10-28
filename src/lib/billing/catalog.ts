import type { Pricebook, QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import type { Service } from "@/types/content";
import { formatAmountCode, todayISO, uid } from "./calc";
import { createQuotation, defaultPrerequisites, defaultTerms } from "./defaults";
import type { BillingDoc, CompanyProfile, CostLine, Currency, LineItem, Milestone, OrderSource, Quotation, TextRow } from "./types";

/**
 * The website's priced offering — service plans from the CMS and the
 * E-commerce Builder pricebook — flattened into one list the quotation and
 * invoice editors can pick from. Built on the server, consumed in the browser.
 */

export type CatalogBilling = "one-time" | "monthly" | "annual";

export interface CatalogItem {
  id: string;
  source: "service" | "ecommerce";
  /** Picker heading, e.g. "Website SEO" or "E-commerce · Payments". */
  group: string;
  title: string;
  /** Short line under the title (plan audience / feature summary). */
  description: string;
  /** Comma-separated capabilities for the Scope of Work table. */
  scope: string;
  /** Rate in `currency`; null when the item is priced after consultation. */
  price: number | null;
  currency: Currency;
  billing: CatalogBilling;
  /** As printed on the website, e.g. "$150/month" or "+$40 per courier". */
  priceLabel: string;
  /** Per-unit items (couriers, payment providers…). */
  unitLabel: string;
  /** Link to the page that publishes this rate. */
  href: string;
}

export interface BillingCatalog {
  items: CatalogItem[];
  /** E-commerce Builder display rate (BDT per 1 USD), null when not configured. */
  usdToBdt: number | null;
  pricebookVersion: number;
}

export const EMPTY_CATALOG: BillingCatalog = { items: [], usdToBdt: null, pricebookVersion: 0 };

const centsToUnits = (cents: number) => Math.round(cents) / 100;

/** "$1,000" → { 1000, USD }; "৳5,000" / "5000 BDT" → BDT; anything without a number → null. */
export function parsePlanPrice(text: string | undefined): { amount: number; currency: Currency } | null {
  if (!text) return null;
  const digits = text.replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(digits);
  if (!digits || !Number.isFinite(amount)) return null;
  return { amount, currency: /৳|bdt|tk|taka/i.test(text) ? "BDT" : "USD" };
}

/** "/month", "per month" → monthly; "/year" → annual; everything else is a one-off fee. */
export function planBilling(period: string | undefined): CatalogBilling {
  if (/month|mo\b/i.test(period ?? "")) return "monthly";
  if (/year|annual|yr\b/i.test(period ?? "")) return "annual";
  return "one-time";
}

const USD = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function buildCatalog(services: Pick<Service, "slug" | "title" | "plans" | "included" | "capabilities">[], pricebook: Pricebook | null): BillingCatalog {
  const items: CatalogItem[] = [];

  for (const s of services) {
    const serviceScope = s.included.flatMap((g) => (g.items?.length ? g.items : [g.title])).filter(Boolean);
    for (const [i, plan] of s.plans.entries()) {
      const price = parsePlanPrice(plan.price);
      const period = plan.period?.trim() ?? "";
      items.push({
        id: `svc:${s.slug}:${i}`,
        source: "service",
        group: s.title,
        title: `${s.title} — ${plan.name}`,
        description: [plan.audience, plan.description].filter(Boolean).join(" · "),
        scope: (plan.features.length ? plan.features : serviceScope).join(", "),
        price: price?.amount ?? null,
        currency: price?.currency ?? "USD",
        billing: planBilling(period),
        priceLabel: [plan.price, period && !period.startsWith("/") ? ` ${period}` : period].join("") || "On request",
        unitLabel: "",
        href: `/services/${s.slug}`,
      });
    }
  }

  if (pricebook) {
    const href = "/services/ecommerce-website-development-bangladesh";
    const categoryName = (id: string) => pricebook.categories.find((c) => c.id === id)?.name ?? "Features";
    for (const t of pricebook.templates) {
      const price = centsToUnits(t.price);
      items.push({
        id: `ecom:template:${t.id}`,
        source: "ecommerce",
        group: "E-commerce · Website templates",
        title: `${t.name} (e-commerce website)`,
        description: t.tagline,
        scope: t.description,
        price,
        currency: "USD",
        billing: "one-time",
        priceLabel: USD(price),
        unitLabel: "",
        href,
      });
    }
    for (const f of pricebook.features) {
      if (f.pricing === "included" || f.pricing === "bundled") continue;
      const group = `E-commerce · ${categoryName(f.categoryId)}`;
      const price = f.pricing === "custom" ? null : centsToUnits(f.price);
      items.push({
        id: `ecom:feature:${f.id}`,
        source: "ecommerce",
        group,
        title: f.name,
        description: f.summary,
        scope: f.details || f.summary,
        price,
        currency: "USD",
        billing: "one-time",
        priceLabel: price === null ? "Custom quote" : f.pricing === "quantity" ? `+${USD(price)} per ${f.unitLabel || "unit"}` : `+${USD(price)}`,
        unitLabel: f.pricing === "quantity" ? f.unitLabel || "unit" : "",
        href,
      });
      if (f.recurring?.amount) {
        const amount = centsToUnits(f.recurring.amount);
        items.push({
          id: `ecom:recurring:${f.id}`,
          source: "ecommerce",
          group,
          title: `${f.name} — renewal`,
          description: f.recurring.note,
          scope: "",
          price: amount,
          currency: "USD",
          billing: f.recurring.interval === "month" ? "monthly" : "annual",
          priceLabel: `${USD(amount)}/${f.recurring.interval}`,
          unitLabel: "",
          href,
        });
      }
    }
  }

  return { items, usdToBdt: pricebook?.rules.bdtPerUsd ?? null, pricebookVersion: pricebook?.version ?? 0 };
}

/** Exchange rate for converting website USD rates: company setting first, then the E-commerce Builder rate. */
export const effectiveRate = (company: Pick<CompanyProfile, "usdToBdt">, catalog: Pick<BillingCatalog, "usdToBdt">) => (company.usdToBdt > 0 ? company.usdToBdt : (catalog.usdToBdt ?? 0));

/** Convert between USD and BDT; returns null when a conversion is needed but no rate is set. */
export function convert(amount: number, from: Currency, to: Currency, rate: number): number | null {
  if (from === to) return amount;
  if (!(rate > 0)) return null;
  return from === "USD" ? Math.round(amount * rate) : Math.round((amount / rate) * 100) / 100;
}

/**
 * Type-ahead matches for the editors: every word must appear in the title,
 * group or description; title-prefix and title matches rank first, otherwise
 * catalog order is kept. An empty query lists the first items.
 */
export function searchCatalog(items: CatalogItem[], query: string, limit = 8): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, limit);
  // Punctuation (dashes, brackets, ×) never has to match, so pasted or edited titles still find their item.
  const words = q.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (!words.length) return items.slice(0, limit);
  return items
    .flatMap((item) => {
      const title = item.title.toLowerCase();
      const haystack = `${title} ${item.group} ${item.description}`.toLowerCase();
      if (!words.every((w) => haystack.includes(w))) return [];
      const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : words.every((w) => title.includes(w)) ? 2 : 3;
      return [{ item, score }];
    })
    .sort((x, y) => x.score - y.score)
    .slice(0, limit)
    .map((x) => x.item);
}

export const catalogAmount = (item: CatalogItem, currency: Currency, rate: number) => (item.price === null ? null : convert(item.price, item.currency, currency, rate));

const RECURRING_SUFFIX: Record<CatalogBilling, string> = { "one-time": "", monthly: " (per month)", annual: " (per year)" };

export function catalogToCostLine(item: CatalogItem, currency: Currency, rate: number, qty = 1): CostLine {
  const unit = catalogAmount(item, currency, rate) ?? 0;
  const label = qty > 1 ? `${item.title} × ${qty}${item.unitLabel ? ` ${item.unitLabel}s` : ""}` : item.title;
  return { id: uid(), label: label + RECURRING_SUFFIX[item.billing], amount: unit * qty, type: item.billing };
}

export function catalogToLineItem(item: CatalogItem, currency: Currency, rate: number, qty = 1): LineItem {
  return {
    id: uid(),
    title: item.title,
    description: [item.description, item.price === null ? "Priced after consultation — enter the agreed amount." : ""].filter(Boolean).join(" "),
    billingType: item.billing,
    qty: Math.max(1, qty),
    unitPrice: catalogAmount(item, currency, rate) ?? 0,
    discount: 0,
    taxRate: 0,
  };
}

export const catalogToFeature = (item: CatalogItem): TextRow => ({ id: uid(), title: item.title, detail: item.scope || item.description });

/* ───────────────────────────── E-commerce Builder orders ───────────────────────────── */

/** Everything the billing studio needs from a builder order (plain JSON, money in cents). */
export interface OrderImport {
  id: string;
  number: string;
  quoteNumber: string;
  status: string;
  createdAt: string;
  customer: { name: string; phone: string; email: string; businessName: string; domain: string; requirements: string };
  breakdown: QuoteBreakdown;
  /** Order currency (the builder prices in USD). */
  currency: Currency;
  payments: { amount: number; method: string; reference: string; receivedAt: string }[];
  paymentTerms: string;
  disclaimer: string;
  validityDays: number;
  usdToBdt: number | null;
}

/**
 * Turn a builder order's saved price snapshot into a fully editable studio
 * quotation: every priced line becomes a cost line, the scope table lists what
 * was picked, recurring fees become monthly/annual costs and recorded payments
 * travel along so the invoice shows the right balance.
 */
export function orderToQuotation(
  o: OrderImport,
  { company, docs, currency, rate, today = todayISO() }: { company: CompanyProfile; docs: BillingDoc[]; currency: Currency; rate: number; today?: string },
): Quotation {
  const b = o.breakdown;
  const money = (cents: number) => convert(centsToUnits(cents), o.currency, currency, rate) ?? centsToUnits(cents);
  const base = createQuotation({ company, docs, preset: "ecommerce", today });
  const who = o.customer.businessName || o.customer.name;

  const costs: CostLine[] = [
    { id: uid(), label: `Website template — ${b.template.name}`, amount: money(b.template.price), type: "one-time" },
    ...b.lines.map((l) => ({
      id: uid(),
      label: l.qty > 1 ? `${l.name} × ${l.qty}${l.unitLabel ? ` ${l.unitLabel}s` : ""}` : l.name,
      amount: money(l.amount),
      type: "one-time" as const,
    })),
    ...b.discounts.map((d) => ({ id: uid(), label: `Discount — ${d.label}${d.code ? ` (${d.code})` : ""}`, amount: -money(d.amount), type: "one-time" as const })),
    ...(b.tax && b.tax.amount > 0 ? [{ id: uid(), label: `${b.tax.label} (${b.tax.ratePercent}%)`, amount: money(b.tax.amount), type: "one-time" as const }] : []),
    ...b.recurring
      .filter((r) => r.amount !== null)
      .map((r) => ({
        id: uid(),
        label: `${r.name}${r.qty > 1 ? ` × ${r.qty}` : ""} (per ${r.interval})`,
        amount: money((r.amount ?? 0) * Math.max(1, r.qty)),
        type: r.interval === "month" ? ("monthly" as const) : ("annual" as const),
      })),
  ];

  const byCategory = new Map<string, string[]>();
  for (const l of b.lines) byCategory.set(l.categoryName, [...(byCategory.get(l.categoryName) ?? []), l.qty > 1 ? `${l.name} (× ${l.qty})` : l.name]);
  const features: TextRow[] = [
    { id: uid(), title: "Website Template", detail: b.template.name },
    ...(b.included.length ? [{ id: uid(), title: "Included in the Base Website", detail: b.included.map((f) => f.name).join(", ") }] : []),
    ...[...byCategory].map(([title, names]) => ({ id: uid(), title, detail: names.join(", ") })),
    ...(b.bundled.length ? [{ id: uid(), title: "Bundled at No Extra Cost", detail: b.bundled.map((f) => `${f.name} (with ${f.with})`).join(", ") }] : []),
    ...(b.custom.length ? [{ id: uid(), title: "Custom Work (Quoted Separately)", detail: b.custom.map((f) => f.name).join(", ") }] : []),
  ];

  const oneTime = costs.filter((c) => c.type === "one-time").reduce((s, c) => s + c.amount, 0);
  const advance = Math.round(oneTime / 2);
  const firstYearRecurring = costs.reduce((s, c) => s + (c.type === "annual" ? c.amount : c.type === "monthly" ? c.amount * 12 : 0), 0);
  const milestones: Milestone[] = [
    { id: uid(), when: "Before Starting Work (50% Advance)", description: "E-commerce Website Development", amount: advance },
    { id: uid(), when: "Upon Project Completion (Remaining 50%)", description: "E-commerce Website Development", amount: oneTime - advance },
    ...(firstYearRecurring > 0 ? [{ id: uid(), when: "At the Time of Going Live", description: "First-year recurring services", amount: firstYearRecurring }] : []),
  ];

  const additionalCosts = [
    ...b.recurring.filter((r) => r.amount === null).map((r) => `${r.name}: ${r.note || "billed by the provider at their current rates"}.`),
    ...(b.custom.length ? [`Custom items (${b.custom.map((f) => f.name).join(", ")}) are priced after a consultation and are not included in the total above.`] : []),
    ...(o.disclaimer ? [o.disclaimer] : []),
  ];

  const terms = defaultTerms();
  if (o.paymentTerms) terms[1]?.items.unshift({ id: uid(), text: o.paymentTerms, rates: [] });

  const source: OrderSource = {
    kind: "ecommerce-order",
    orderId: o.id,
    orderNumber: o.number,
    quoteNumber: o.quoteNumber,
    payments: o.payments.map((p) => ({ id: uid(), date: p.receivedAt.slice(0, 10), method: p.method, reference: p.reference, amount: money(p.amount) })),
  };

  const brief = o.customer.requirements.trim();
  return {
    ...base,
    currency,
    projectTitle: who ? `E-Commerce Website — ${who}` : "Custom E-Commerce Website",
    validityDays: o.validityDays,
    executiveSummary: brief ? `${base.executiveSummary}\n\n**Client brief:** ${brief.length > 700 ? `${brief.slice(0, 700)}…` : brief}` : base.executiveSummary,
    client: { name: o.customer.name, company: o.customer.businessName, website: o.customer.domain, phone: o.customer.phone, email: o.customer.email, address: "" },
    costs,
    costKpiAuto: false,
    kpis: base.kpis.map((k) => (k.id === "cost" ? { ...k, value: formatAmountCode(oneTime, currency), caption: "E-commerce Website (one-time)" } : k)),
    features,
    milestones,
    prerequisites: defaultPrerequisites(),
    additionalCosts: additionalCosts.length ? additionalCosts : base.additionalCosts,
    terms,
    signature: { ...base.signature, validityNotice: `This quotation is valid for ${o.validityDays} days from the issue date.` },
    source,
  };
}

/** Studio documents already generated from this order (newest first). */
export const docsForOrder = (docs: BillingDoc[], orderId: string) => docs.filter((d) => d.source?.orderId === orderId);
