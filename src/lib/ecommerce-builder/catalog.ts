/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from "node:crypto";
import { builderCategorySeed, builderFeatureSeed, builderSettingsSeed, builderTemplateSeed } from "@/content/seed/ecommerce-builder";
import { COUPON_CODE_PATTERN, normalizeCouponCode } from "./coupons";
import type { PricingSettings } from "./settings";
import type { PbCategory, PbFeature, PbImage, PbRules, PbTemplate, Pricebook } from "./types";

/**
 * Pricebook assembly and validation — pure, so it runs in the server,
 * the seed script and tests alike.
 */

export const int = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : fallback);

export interface CatalogIssue {
  level: "error" | "warning";
  message: string;
}

function rulesFromSettings(p: PricingSettings, features: PbFeature[], issues: CatalogIssue[]): PbRules {
  const byId = new Map(features.map((f) => [f.id, f]));
  const discounts: PbRules["discounts"] = [];
  const couponCodes = new Set<string>();
  for (const d of p.discounts ?? []) {
    const code = normalizeCouponCode(d.code ?? "");
    if (code && !COUPON_CODE_PATTERN.test(code)) issues.push({ level: "error", message: `Coupon “${d.label}” needs a code of up to 40 letters, numbers, hyphens or underscores.` });
    if (code && couponCodes.has(code)) issues.push({ level: "error", message: `Coupon code “${code}” is used more than once.` });
    if (code) couponCodes.add(code);
    if (!d.active) continue;
    const label = d.label || "Discount";
    const unknown = (d.requiredFeatures ?? []).filter((id) => !byId.has(id));
    if (unknown.length) issues.push({ level: "error", message: `Discount “${label}” refers to features that aren’t published: ${unknown.join(", ")}.` });
    if (d.appliesTo === "bundle" && !(d.requiredFeatures ?? []).length) issues.push({ level: "error", message: `Bundle discount “${label}” needs at least one required feature.` });
    if (d.type === "percent" && !(Number(d.percent) > 0 && Number(d.percent) <= 100)) issues.push({ level: "error", message: `Discount “${label}” needs a percentage between 0 and 100.` });
    if (d.type === "fixed" && !(Number(d.amount) > 0)) issues.push({ level: "error", message: `Discount “${label}” needs an amount.` });
    discounts.push({
      id: d.key || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      ...(code ? { code } : {}),
      type: d.type === "fixed" ? "fixed" : "percent",
      percent: Number(d.percent) || 0,
      amount: int(d.amount, 0),
      minSubtotal: int(d.minSubtotal, 0),
      requiredFeatures: d.requiredFeatures ?? [],
      appliesTo: d.appliesTo === "bundle" ? "bundle" : "all",
    });
  }
  const rate = Number(p.tax?.ratePercent) || 0;
  if (p.tax?.enabled && !(rate > 0 && rate <= 100)) issues.push({ level: "error", message: "Tax is enabled but has no valid rate." });
  const validity = int(p.quoteValidityDays, 14);
  const bdt = Number(p.bdtPerUsd);
  return {
    tax: { enabled: Boolean(p.tax?.enabled) && rate > 0, label: p.tax?.label || "Tax", ratePercent: rate },
    discounts,
    quoteValidityDays: Math.min(365, Math.max(1, validity)),
    bdtPerUsd: Number.isFinite(bdt) && bdt > 0 ? bdt : null,
    paymentTerms: p.paymentTerms ?? "",
    disclaimer: p.disclaimer ?? "",
  };
}

interface RawFeature {
  id: string;
  name: string;
  categoryId: string | null;
  summary: string;
  details: string;
  icon: string;
  image: PbImage | null;
  pricing: PbFeature["pricing"];
  mandatory: boolean;
  price: number;
  unitLabel: string;
  minQty: number;
  maxQty: number;
  requires: string[];
  recurringAmount: number | null;
  recurringInterval: "month" | "year";
  recurringNote: string;
  popular: boolean;
}

/** Assembles and validates a pricebook from catalog rows. */
export function assemblePricebook(input: { templates: PbTemplate[]; categories: PbCategory[]; features: RawFeature[]; pricing: PricingSettings; version: number; publishedAt: string | null }): { pricebook: Pricebook; issues: CatalogIssue[] } {
  const issues: CatalogIssue[] = [];
  if (!input.templates.length) issues.push({ level: "error", message: "Publish at least one website template." });
  for (const t of input.templates) if (!(t.price >= 0)) issues.push({ level: "error", message: `Template “${t.name}” needs a price.` });

  const categoryIds = new Set(input.categories.map((c) => c.id));
  const publishedIds = new Set(input.features.filter((f) => f.categoryId && categoryIds.has(f.categoryId)).map((f) => f.id));
  const features: PbFeature[] = [];
  for (const f of input.features) {
    if (!f.categoryId || !categoryIds.has(f.categoryId)) {
      issues.push({ level: "warning", message: `“${f.name}” is hidden: its category is missing or unpublished.` });
      continue;
    }
    const requires = f.requires.filter((r) => r !== f.id);
    const missing = requires.filter((r) => !publishedIds.has(r));
    if (missing.length) issues.push({ level: "error", message: `“${f.name}” requires features that aren’t published: ${missing.join(", ")}.` });
    if (f.pricing === "bundled" && !requires.length) issues.push({ level: "error", message: `Bundled feature “${f.name}” must require the feature it comes with.` });
    const minQty = Math.max(f.pricing === "quantity" ? 1 : 0, f.minQty);
    const maxQty = f.pricing === "quantity" ? f.maxQty : 1;
    if (f.pricing === "quantity" && maxQty < Math.max(1, minQty)) issues.push({ level: "error", message: `“${f.name}”: maximum quantity is below the minimum.` });
    if ((f.pricing === "fixed" || f.pricing === "quantity") && f.price <= 0) issues.push({ level: "warning", message: `“${f.name}” is a paid feature with a $0 price.` });
    features.push({
      id: f.id,
      name: f.name.replace(/^Basic\s+/i, "Standard "),
      categoryId: f.categoryId,
      summary: f.summary,
      details: f.details,
      icon: f.icon || "sparkles",
      image: f.image,
      pricing: f.pricing,
      mandatory: f.pricing === "included" && f.mandatory,
      price: f.pricing === "fixed" || f.pricing === "quantity" ? f.price : 0,
      unitLabel: f.pricing === "quantity" ? f.unitLabel || "unit" : "",
      minQty: f.pricing === "quantity" ? Math.max(1, minQty) : 1,
      maxQty: f.pricing === "quantity" ? Math.max(1, maxQty) : 1,
      requires: requires.filter((r) => publishedIds.has(r)),
      recurring: f.recurringNote || f.recurringAmount ? { amount: f.recurringAmount ?? null, interval: f.recurringInterval, note: f.recurringNote } : null,
      popular: f.popular,
    });
  }
  // Display order: category order first, then each feature's own order.
  const catOrder = new Map(input.categories.map((c, i) => [c.id, i]));
  const original = new Map(features.map((f, i) => [f.id, i]));
  features.sort((a, b) => catOrder.get(a.categoryId)! - catOrder.get(b.categoryId)! || original.get(a.id)! - original.get(b.id)!);

  const rules = rulesFromSettings(input.pricing, features, issues);
  return {
    pricebook: { version: input.version, publishedAt: input.publishedAt, currency: "USD", templates: input.templates, categories: input.categories.filter((c) => features.some((f) => f.categoryId === c.id)), features, rules },
    issues,
  };
}

/** Pricebook built from the seed file — the preview used without a database. */
export function seedPricebook(): Pricebook {
  return assemblePricebook({
    version: 0,
    publishedAt: null,
    templates: builderTemplateSeed.map((t) => ({ id: t.key, name: t.name, tagline: t.tagline, description: t.description, categories: t.categories, demoUrl: t.demoUrl, desktopImage: null, mobileImage: null, price: t.price })),
    categories: builderCategorySeed.map((c) => ({ id: c.key, name: c.name, description: c.description, icon: c.icon })),
    features: builderFeatureSeed.map((f) => ({
      id: f.key,
      name: f.name,
      categoryId: f.category,
      summary: f.summary,
      details: f.details ?? "",
      icon: f.icon,
      image: null,
      pricing: f.pricing,
      mandatory: Boolean(f.mandatory),
      price: f.price ?? 0,
      unitLabel: f.unitLabel ?? "",
      minQty: f.minQty ?? 1,
      maxQty: f.maxQty ?? 1,
      requires: f.requires ?? [],
      recurringAmount: null,
      recurringInterval: "month",
      recurringNote: f.recurringNote ?? "",
      popular: Boolean(f.popular),
    })),
    pricing: builderSettingsSeed.pricing,
  }).pricebook;
}

const image = (v: any): PbImage | null => (v && v.src ? { src: String(v.src), alt: String(v.alt ?? ""), ...(v.width ? { width: v.width } : {}), ...(v.height ? { height: v.height } : {}) } : null);

/** Refresh public preview images without changing the published catalog or prices. */
export function withTemplatePreviews(pricebook: Pricebook, templates: readonly { slug: string; published: boolean; desktopImage?: PbImage | null; mobileImage?: PbImage | null }[]): Pricebook {
  const previews = new Map(templates.filter((t) => t.published).map((t) => [t.slug, t]));
  return {
    ...pricebook,
    templates: pricebook.templates.map((template) => {
      const current = previews.get(template.id);
      return current ? { ...template, desktopImage: image(current.desktopImage), mobileImage: image(current.mobileImage) } : template;
    }),
  };
}

/** Maps catalog documents (lean Mongo rows) to a validated pricebook. */
export function assembleFromDocs(input: { templates: any[]; categories: any[]; features: any[]; pricing: PricingSettings; version: number }): { pricebook: Pricebook; issues: CatalogIssue[] } {
  const catSlug = new Map(input.categories.map((c) => [String(c._id), c.slug as string]));
  const featureSlug = new Map(input.features.map((f) => [String(f._id), f.slug as string]));
  return assemblePricebook({
    version: input.version,
    publishedAt: null,
    templates: input.templates.map((t) => ({
      id: t.slug,
      name: t.name,
      tagline: t.tagline ?? "",
      description: t.description ?? "",
      categories: t.categories ?? [],
      demoUrl: t.demoUrl ?? "",
      desktopImage: image(t.desktopImage),
      mobileImage: image(t.mobileImage),
      price: int(t.price, 0),
    })),
    categories: input.categories.map((c) => ({ id: c.slug, name: c.name, description: c.description ?? "", icon: c.icon ?? "sparkles" })),
    features: input.features
      .filter((f) => f.published)
      .map((f) => ({
        id: f.slug,
        name: String(f.name ?? "").replace(/^Basic\s+/i, "Standard "),
        categoryId: f.category ? catSlug.get(String(f.category)) ?? null : null,
        summary: f.summary ?? "",
        details: f.details ?? "",
        icon: f.icon ?? "sparkles",
        image: image(f.image),
        pricing: f.pricing as PbFeature["pricing"],
        mandatory: Boolean(f.mandatory),
        price: int(f.price, 0),
        unitLabel: f.unitLabel ?? "",
        minQty: int(f.minQty, 1),
        maxQty: int(f.maxQty, 1),
        requires: (f.requires ?? []).map((r: unknown) => featureSlug.get(String(r)) ?? `#${String(r)}`),
        recurringAmount: typeof f.recurringAmount === "number" ? f.recurringAmount : null,
        recurringInterval: f.recurringInterval === "year" ? "year" : "month",
        recurringNote: f.recurringNote ?? "",
        popular: Boolean(f.popular),
      })),
    pricing: input.pricing,
  });
}

/** Stable fingerprint of a pricebook's content (ignores version and date). */
export function pricebookHash(pb: Pricebook): string {
  const { version: _v, publishedAt: _p, ...content } = pb;
  return createHash("sha256").update(JSON.stringify(content)).digest("hex");
}
