/**
 * E-commerce website builder — shared, client-safe types.
 *
 * Money is always an integer number of minor units (cents) of `currency`.
 * A Pricebook is an immutable, versioned snapshot of the catalog and pricing
 * rules: the public page, the client calculator and the server all price
 * from the same published pricebook, and every quote stores its version.
 */

export type Cents = number;

/**
 * included — part of the base website, $0, auto-selected (optionally removable).
 * fixed    — one-off development fee.
 * quantity — fee per unit (e.g. per courier or payment provider).
 * bundled  — comes free with the feature(s) it requires (e.g. Advanced Permissions with Staff & Roles).
 * custom   — scoped and priced after a consultation; never shown as $0.
 */
export const FEATURE_PRICING = ["included", "fixed", "quantity", "bundled", "custom"] as const;
export type FeaturePricing = (typeof FEATURE_PRICING)[number];

export interface PbImage {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
}

export interface PbTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  demoUrl: string;
  desktopImage: PbImage | null;
  mobileImage: PbImage | null;
  price: Cents;
}

export interface PbCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PbRecurring {
  /** Null when the amount depends on a third party (SMS credits, gateway fees…). */
  amount: Cents | null;
  interval: "month" | "year";
  note: string;
}

export interface PbFeature {
  id: string;
  name: string;
  categoryId: string;
  summary: string;
  details: string;
  icon: string;
  image: PbImage | null;
  pricing: FeaturePricing;
  /** Included features only: cannot be removed from the package. */
  mandatory: boolean;
  price: Cents;
  unitLabel: string;
  minQty: number;
  maxQty: number;
  requires: string[];
  recurring: PbRecurring | null;
  popular: boolean;
}

export interface PbDiscount {
  id: string;
  label: string;
  /** Empty or absent for automatic discounts; otherwise requires this coupon. */
  code?: string;
  type: "percent" | "fixed";
  /** Percent off (0–100) when type is "percent". */
  percent: number;
  /** Amount off when type is "fixed". */
  amount: Cents;
  /** Only applies once the development subtotal reaches this. */
  minSubtotal: Cents;
  /** Bundle: every one of these features must be selected. */
  requiredFeatures: string[];
  /** "all" discounts the whole subtotal; "bundle" only the required features’ lines. */
  appliesTo: "all" | "bundle";
}

export interface PbRules {
  tax: { enabled: boolean; label: string; ratePercent: number };
  discounts: PbDiscount[];
  quoteValidityDays: number;
  /** Admin-managed display rate; null hides BDT estimates (no invented exchange rates). */
  bdtPerUsd: number | null;
  paymentTerms: string;
  disclaimer: string;
}

export interface Pricebook {
  version: number;
  publishedAt: string | null;
  currency: "USD";
  templates: PbTemplate[];
  categories: PbCategory[];
  features: PbFeature[];
  rules: PbRules;
}

/** What the visitor picked. Prices are never part of a selection. */
export interface Selection {
  templateId: string | null;
  /** At most one customer-entered coupon. The server validates its eligibility. */
  couponCode?: string;
  /** Selectable (fixed / quantity / custom) feature id → quantity. */
  features: Record<string, number>;
  /** Non-mandatory included features the visitor doesn't need. */
  omitted: string[];
}

export interface QuoteLine {
  id: string;
  name: string;
  categoryName: string;
  pricing: FeaturePricing;
  unitPrice: Cents;
  qty: number;
  unitLabel: string;
  amount: Cents;
  /** Set when the feature was added because another feature requires it. */
  requiredBy?: string[];
}

export interface QuoteRecurringLine {
  id: string;
  name: string;
  amount: Cents | null;
  qty: number;
  interval: "month" | "year";
  note: string;
}

export interface QuoteBreakdown {
  pricebookVersion: number;
  currency: "USD";
  template: { id: string; name: string; price: Cents };
  included: { id: string; name: string }[];
  omitted: { id: string; name: string }[];
  lines: QuoteLine[];
  bundled: { id: string; name: string; with: string }[];
  custom: { id: string; name: string; categoryName: string }[];
  discounts: { id: string; label: string; amount: Cents; code?: string }[];
  subtotal: Cents;
  discountTotal: Cents;
  taxable: Cents;
  tax: { label: string; ratePercent: number; amount: Cents } | null;
  total: Cents;
  recurring: QuoteRecurringLine[];
  /** Deterministic key of the normalized selection — detects stale quotes. */
  selectionKey: string;
}

export type QuoteResult = { ok: true; selection: Selection; breakdown: QuoteBreakdown } | { ok: false; errors: string[] };
