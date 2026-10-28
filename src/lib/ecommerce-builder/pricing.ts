/**
 * E-commerce builder pricing engine — pure functions, no I/O.
 *
 * The same module runs in the browser (instant totals) and on the server
 * (authoritative totals for quotes and orders), so both always agree for
 * the same pricebook. Prices come only from the pricebook — never from the
 * client — and unknown ids are rejected rather than ignored.
 */
import type { Cents, PbFeature, Pricebook, QuoteBreakdown, QuoteLine, QuoteResult, Selection } from "./types";
import { COUPON_CODE_PATTERN, normalizeCouponCode } from "./coupons";
import { CUSTOM_DESIGN_FEE, CUSTOM_DESIGN_LINE_ID, normalizeReferenceUrl, referenceLabel, storeTypeLabel } from "./custom-design";

export const EMPTY_SELECTION: Selection = { templateId: null, features: {}, omitted: [] };

const featureMap = (pb: Pricebook) => new Map(pb.features.map((f) => [f.id, f]));

/** Features a visitor can pick on their own (included and bundled ones are derived). */
export const isSelectable = (f: PbFeature) => f.pricing === "fixed" || f.pricing === "quantity" || f.pricing === "custom";

const defaultQty = (f: PbFeature) => (f.pricing === "quantity" ? Math.max(1, f.minQty) : 1);

/**
 * Expands a feature's requirements into the selectable features (and
 * included features) they stand for. A bundled requirement stands for the
 * feature(s) it comes with.
 */
function expandRequirement(byId: Map<string, PbFeature>, id: string, seen = new Set<string>()): PbFeature[] {
  if (seen.has(id)) return [];
  seen.add(id);
  const f = byId.get(id);
  if (!f) return [];
  if (f.pricing === "bundled") return f.requires.flatMap((r) => expandRequirement(byId, r, seen));
  return [f];
}

/** For each feature in `features`, the names of selected features that need it. */
export function requiredByMap(pb: Pricebook, features: Record<string, number>): Record<string, string[]> {
  const byId = featureMap(pb);
  const out: Record<string, string[]> = {};
  for (const id of Object.keys(features)) {
    const f = byId.get(id);
    if (!f) continue;
    for (const req of f.requires) {
      for (const r of expandRequirement(byId, req)) {
        const names = (out[r.id] ??= []);
        if (!names.includes(f.name)) names.push(f.name);
      }
    }
  }
  return out;
}

/**
 * Validates a selection against the pricebook and resolves dependencies.
 * Returns the normalized selection or human-readable errors.
 */
export function normalizeSelection(pb: Pricebook, input: Selection, opts: { allowNoTemplate?: boolean } = {}): { selection: Selection; errors: string[] } {
  const errors: string[] = [];
  const byId = featureMap(pb);

  const couponCode = typeof input.couponCode === "string" ? normalizeCouponCode(input.couponCode) : "";
  if ((input.couponCode !== undefined && typeof input.couponCode !== "string") || (couponCode && !COUPON_CODE_PATTERN.test(couponCode))) errors.push("Enter a valid coupon code (up to 40 letters, numbers, hyphens or underscores).");

  const templateId = typeof input.templateId === "string" && input.templateId ? input.templateId : null;
  if (!templateId) {
    if (!opts.allowNoTemplate) errors.push("Choose a website design.");
  }
  else if (!pb.templates.some((t) => t.id === templateId)) errors.push(`The website design “${templateId}” is no longer available.`);

  const features: Record<string, number> = {};
  for (const [id, rawQty] of Object.entries(input.features ?? {})) {
    const f = byId.get(id);
    if (!f) {
      errors.push(`Unknown feature “${id}”. Please refresh the page.`);
      continue;
    }
    if (!isSelectable(f)) continue; // included / bundled are derived, never charged directly
    const qty = f.pricing === "quantity" ? rawQty : 1;
    if (!Number.isInteger(qty) || qty < Math.max(1, f.minQty) || qty > f.maxQty) {
      errors.push(`Quantity for ${f.name} must be between ${Math.max(1, f.minQty)} and ${f.maxQty}.`);
      continue;
    }
    features[id] = qty;
  }

  let customDesign: Selection["customDesign"];
  if (input.customDesign) {
    const { storeType, referenceUrl } = input.customDesign;
    const url = typeof referenceUrl === "string" ? normalizeReferenceUrl(referenceUrl) : "";
    if (typeof storeType !== "string" || !storeTypeLabel(storeType)) errors.push("Choose your store type for the custom design.");
    else if (!url) errors.push("Enter a valid website link for the custom design, e.g. https://example.com.");
    else customDesign = { storeType, referenceUrl: url };
  }

  const omitted = new Set<string>();
  for (const id of input.omitted ?? []) {
    const f = byId.get(id);
    if (!f) errors.push(`Unknown feature “${id}”. Please refresh the page.`);
    else if (f.pricing === "included" && !f.mandatory) omitted.add(id);
  }

  // Resolve requirements transitively: add missing paid features, restore omitted included ones.
  const queue = Object.keys(features);
  while (queue.length) {
    const f = byId.get(queue.shift()!)!;
    for (const req of f.requires) {
      for (const r of expandRequirement(byId, req)) {
        if (r.pricing === "included") omitted.delete(r.id);
        else if (!(r.id in features)) {
          features[r.id] = defaultQty(r);
          queue.push(r.id);
        }
      }
    }
  }

  return { selection: { templateId, features, omitted: [...omitted].sort(), ...(couponCode ? { couponCode } : {}), ...(customDesign ? { customDesign } : {}) }, errors };
}

export function selectionKey(sel: Selection): string {
  const f = Object.entries(sel.features)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, q]) => `${id}=${q}`)
    .join(",");
  const code = normalizeCouponCode(sel.couponCode ?? "");
  const design = sel.customDesign ? `;d:${sel.customDesign.storeType}|${sel.customDesign.referenceUrl}` : "";
  return `t:${sel.templateId ?? ""};f:${f};o:${[...sel.omitted].sort().join(",")}${code ? `;c:${code}` : ""}${design}`;
}

const pct = (amount: Cents, percent: number) => Math.round((amount * percent) / 100);

/**
 * Prices a selection. The result is what gets stored as the quote snapshot.
 * `allowNoTemplate` is for the live summary before a design is chosen — the
 * server never uses it, so a quote or order always has a template.
 */
export function calculateQuote(pb: Pricebook, input: Selection, opts: { allowNoTemplate?: boolean } = {}): QuoteResult {
  const { selection, errors } = normalizeSelection(pb, input, opts);
  if (errors.length) return { ok: false, errors };

  const template = pb.templates.find((t) => t.id === selection.templateId) ?? { id: "", name: "", price: 0 };
  const categoryName = new Map(pb.categories.map((c) => [c.id, c.name]));
  const byId = featureMap(pb);
  const requiredBy = requiredByMap(pb, selection.features);
  const omitted = new Set(selection.omitted);

  const included: QuoteBreakdown["included"] = [];
  const omittedOut: QuoteBreakdown["omitted"] = [];
  const lines: QuoteLine[] = [];
  const bundled: QuoteBreakdown["bundled"] = [];
  const custom: QuoteBreakdown["custom"] = [];
  const recurring: QuoteBreakdown["recurring"] = [];

  const design = selection.customDesign ? { ...selection.customDesign, storeTypeLabel: storeTypeLabel(selection.customDesign.storeType) } : undefined;
  if (design) {
    lines.push({
      id: CUSTOM_DESIGN_LINE_ID,
      name: `Custom design — ${design.storeTypeLabel} (ref: ${referenceLabel(design.referenceUrl)})`,
      categoryName: "Custom design",
      pricing: "fixed",
      unitPrice: CUSTOM_DESIGN_FEE,
      qty: 1,
      unitLabel: "",
      amount: CUSTOM_DESIGN_FEE,
    });
  }

  // pb.features is already in display order (category order, then feature order).
  for (const f of pb.features) {
    const cat = categoryName.get(f.categoryId) ?? "";
    if (f.pricing === "included") {
      (omitted.has(f.id) ? omittedOut : included).push({ id: f.id, name: f.name });
      continue;
    }
    if (f.pricing === "bundled") {
      const parents = f.requires.map((r) => byId.get(r)).filter((p): p is PbFeature => Boolean(p));
      if (parents.length && parents.every((p) => p.id in selection.features)) bundled.push({ id: f.id, name: f.name, with: parents.map((p) => p.name).join(" + ") });
      continue;
    }
    const qty = selection.features[f.id];
    if (qty === undefined) continue;
    if (f.pricing === "custom") custom.push({ id: f.id, name: f.name, categoryName: cat });
    else {
      lines.push({
        id: f.id,
        name: f.name,
        categoryName: cat,
        pricing: f.pricing,
        unitPrice: f.price,
        qty,
        unitLabel: f.unitLabel,
        amount: f.price * qty,
        ...(requiredBy[f.id] ? { requiredBy: requiredBy[f.id] } : {}),
      });
    }
    if (f.recurring) recurring.push({ id: f.id, name: f.name, amount: f.recurring.amount, qty: f.pricing === "quantity" ? qty : 1, interval: f.recurring.interval, note: f.recurring.note });
  }

  const subtotal = template.price + lines.reduce((s, l) => s + l.amount, 0);
  const selectedIds = new Set(Object.keys(selection.features));
  const lineAmount = new Map(lines.map((l) => [l.id, l.amount]));

  if (selection.couponCode) {
    const coupon = pb.rules.discounts.find((d) => d.code && normalizeCouponCode(d.code) === selection.couponCode);
    if (!coupon) return { ok: false, errors: ["This coupon code is invalid or no longer active."] };
    if (subtotal < coupon.minSubtotal) return { ok: false, errors: [`This coupon needs a development subtotal of at least ${formatMoney(coupon.minSubtotal, pb.currency)}.`] };
    if (!coupon.requiredFeatures.every((id) => selectedIds.has(id))) return { ok: false, errors: ["This coupon requires additional features. Check the offer or remove the coupon."] };
  }

  const discounts: QuoteBreakdown["discounts"] = [];
  let discountTotal = 0;
  for (const d of pb.rules.discounts) {
    if (d.code && normalizeCouponCode(d.code) !== selection.couponCode) continue;
    if (subtotal < d.minSubtotal) continue;
    if (!d.requiredFeatures.every((id) => selectedIds.has(id))) continue;
    const base = d.appliesTo === "bundle" ? d.requiredFeatures.reduce((s, id) => s + (lineAmount.get(id) ?? 0), 0) : subtotal;
    const requested = d.type === "percent" ? pct(base, Math.min(100, Math.max(0, d.percent))) : Math.min(d.amount, base);
    const amount = Math.min(Math.max(0, requested), subtotal - discountTotal);
    if (amount > 0) {
      discounts.push({ id: d.id, label: d.label, amount, ...(d.code ? { code: normalizeCouponCode(d.code) } : {}) });
      discountTotal += amount;
    }
  }

  const taxable = subtotal - discountTotal;
  const tax = pb.rules.tax.enabled && pb.rules.tax.ratePercent > 0 ? { label: pb.rules.tax.label || "Tax", ratePercent: pb.rules.tax.ratePercent, amount: pct(taxable, pb.rules.tax.ratePercent) } : null;

  return {
    ok: true,
    selection,
    breakdown: {
      pricebookVersion: pb.version,
      currency: pb.currency,
      template: { id: template.id, name: template.name, price: template.price },
      included,
      omitted: omittedOut,
      lines,
      bundled,
      custom,
      discounts,
      subtotal,
      discountTotal,
      taxable,
      tax,
      total: taxable + (tax?.amount ?? 0),
      recurring,
      ...(design ? { customDesign: design } : {}),
      selectionKey: selectionKey(selection),
    },
  };
}

/* ------------------------------ Selection edits ----------------------------- */

/** Adds a feature (and anything it requires). Clicking a bundled feature selects what it comes with. */
export function addFeature(pb: Pricebook, sel: Selection, id: string): Selection {
  const byId = featureMap(pb);
  const f = byId.get(id);
  if (!f) return sel;
  const targets = f.pricing === "bundled" ? f.requires.flatMap((r) => expandRequirement(byId, r)) : [f];
  const features = { ...sel.features };
  for (const t of targets) if (isSelectable(t) && !(t.id in features)) features[t.id] = defaultQty(t);
  return normalizeSelection(pb, { ...sel, features }).selection;
}

export function removeFeature(sel: Selection, id: string): Selection {
  if (id === CUSTOM_DESIGN_LINE_ID) {
    const { customDesign: _removed, ...rest } = sel;
    return rest;
  }
  const { [id]: _removed, ...features } = sel.features;
  return { ...sel, features };
}

export function setQuantity(pb: Pricebook, sel: Selection, id: string, qty: number): Selection {
  const f = pb.features.find((x) => x.id === id);
  if (!f || f.pricing !== "quantity" || !(id in sel.features)) return sel;
  const clamped = Math.min(f.maxQty, Math.max(Math.max(1, f.minQty), Math.round(qty)));
  return { ...sel, features: { ...sel.features, [id]: clamped } };
}

export function toggleIncluded(pb: Pricebook, sel: Selection, id: string): Selection {
  const f = pb.features.find((x) => x.id === id);
  if (!f || f.pricing !== "included" || f.mandatory) return sel;
  const omitted = sel.omitted.includes(id) ? sel.omitted.filter((x) => x !== id) : [...sel.omitted, id];
  return normalizeSelection(pb, { ...sel, omitted }).selection;
}

/** Drops retired ids; a matching valid quotation can preserve its original coupon. */
export function sanitizeSelection(pb: Pricebook, sel: Partial<Selection> | null | undefined, opts: { preserveCoupon?: boolean } = {}): Selection {
  if (!sel || typeof sel !== "object") return EMPTY_SELECTION;
  const byId = featureMap(pb);
  const features: Record<string, number> = {};
  for (const [id, q] of Object.entries(sel.features ?? {})) {
    const f = byId.get(id);
    if (f && isSelectable(f) && typeof q === "number") features[id] = f.pricing === "quantity" ? Math.min(f.maxQty, Math.max(Math.max(1, f.minQty), Math.round(q))) : 1;
  }
  const templateId = typeof sel.templateId === "string" && pb.templates.some((t) => t.id === sel.templateId) ? sel.templateId : null;
  const omitted = (Array.isArray(sel.omitted) ? sel.omitted : []).filter((id) => {
    const f = byId.get(id);
    return f?.pricing === "included" && !f.mandatory;
  });
  const code = typeof sel.couponCode === "string" ? normalizeCouponCode(sel.couponCode) : "";
  const couponCode = code && COUPON_CODE_PATTERN.test(code) && (opts.preserveCoupon || pb.rules.discounts.some((d) => d.code && normalizeCouponCode(d.code) === code)) ? code : undefined;
  const design = sel.customDesign && typeof sel.customDesign === "object" ? sel.customDesign : undefined;
  const customDesign = design && storeTypeLabel(design.storeType) && normalizeReferenceUrl(design.referenceUrl ?? "") ? design : undefined;
  return normalizeSelection(pb, { templateId, features, omitted, couponCode, customDesign }).selection;
}

/* --------------------------------- Formatting -------------------------------- */

export function formatMoney(cents: Cents, currency = "USD"): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(cents / 100);
}

/** Approximate taka amount using the admin-managed rate. */
export function formatBdt(cents: Cents, bdtPerUsd: number): string {
  return `৳${Math.round((cents / 100) * bdtPerUsd).toLocaleString("en-IN")}`;
}

/** Price label shown on a feature card. */
export function priceLabel(f: PbFeature, pb: Pricebook, currency = pb.currency): string {
  switch (f.pricing) {
    case "included":
      return "Included";
    case "fixed":
      return `+${formatMoney(f.price, currency)}`;
    case "quantity":
      return `+${formatMoney(f.price, currency)} per ${f.unitLabel || "unit"}`;
    case "bundled": {
      const names = f.requires.map((r) => pb.features.find((x) => x.id === r)?.name).filter(Boolean);
      return names.length ? `Included with ${names.join(" + ")}` : "Included";
    }
    case "custom":
      return "Contact for pricing";
  }
}
