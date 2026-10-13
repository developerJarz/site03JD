import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { builderSettingsSeed } from "@/content/seed/ecommerce-builder";
import { TAGS } from "@/lib/data/cache-tags";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { BuilderCategory, BuilderCounter, BuilderFeature, BuilderPricebook, BuilderSettingsModel, BuilderTemplate } from "@/models/builder";
import { assembleFromDocs, pricebookHash, seedPricebook, withTemplatePreviews, type CatalogIssue } from "./catalog";
import type { BuilderSettings } from "./settings";
import type { PbTemplate, Pricebook } from "./types";

export { seedPricebook, type CatalogIssue } from "./catalog";

/**
 * Server-side data for the e-commerce builder.
 *
 * Public reads (`getPublishedPricebook`, `getBuilderSettings`) are cached
 * under the "ecommerce-builder" tag; publishing pricing or saving builder
 * settings or template preview images revalidates it. Server actions use the uncached loaders so a
 * price is never taken from a stale cache.
 */

// Cached reads fall back to the seed catalog until pricing is published, so the key
// includes a fingerprint of the seed data: editing it (e.g. a template's preview URL)
// takes effect at once, locally and on every deploy, instead of after the cache expires.
const SEED_VERSION = createHash("sha256")
  .update(pricebookHash(seedPricebook()))
  .update(JSON.stringify(builderSettingsSeed))
  .digest("hex")
  .slice(0, 12);
const CACHE_VERSION = `${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local"}-${SEED_VERSION}-standard-v5`;

/* --------------------------------- Settings -------------------------------- */

function mergeDeep<T>(base: T, override: unknown): T {
  if (Array.isArray(base) || typeof base !== "object" || base === null) return (override === undefined || override === null ? base : override) as T;
  if (typeof override !== "object" || override === null || Array.isArray(override)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    out[k] = k in out ? mergeDeep(out[k], v) : v;
  }
  return out as T;
}

export async function readBuilderSettings(): Promise<BuilderSettings> {
  if (!isDbConfigured) return builderSettingsSeed;
  await connectDB();
  const doc = await BuilderSettingsModel.findOne({ key: "ecommerce" }).lean();
  return mergeDeep(builderSettingsSeed, doc?.data ?? {});
}

export const getBuilderSettings = cache(
  unstable_cache(readBuilderSettings, [CACHE_VERSION, "ecommerce-builder-settings"], { tags: [TAGS.ecommerceBuilder], revalidate: 3600 }),
);

/* ------------------------------ Pricebook build ----------------------------- */

/** Builds the pricebook that publishing would create right now, from the editable catalog. */
export async function loadDraftPricebook(): Promise<{ pricebook: Pricebook; issues: CatalogIssue[] }> {
  await connectDB();
  const [templates, categories, features, settings, latest] = await Promise.all([
    BuilderTemplate.find({ published: true }).sort({ order: 1, name: 1 }).lean(),
    BuilderCategory.find({ published: true }).sort({ order: 1, name: 1 }).lean(),
    BuilderFeature.find({}).sort({ order: 1, name: 1 }).lean(),
    readBuilderSettings(),
    BuilderPricebook.findOne().sort({ version: -1 }).select("version").lean(),
  ]);
  const mappedFeatures = features.map((f: any) => ({
    ...f,
    name: typeof f.name === "string" ? f.name.replace(/^Basic\s+/i, "Standard ") : f.name,
  }));
  return assembleFromDocs({ templates, categories, features: mappedFeatures, pricing: settings.pricing, version: (latest?.version ?? 0) + 1 });
}

export { pricebookHash };

/* ------------------------------ Published pricing ---------------------------- */

/** Latest published pricebook, uncached. Falls back to the seed preview (version 0). */
export async function loadPublishedPricebook(): Promise<Pricebook> {
  if (!isDbConfigured) return seedPricebook();
  await connectDB();
  const doc = await BuilderPricebook.findOne().sort({ version: -1 }).lean();
  if (!doc) return seedPricebook();
  const data = doc.data as Pricebook;
  const customTemplate: PbTemplate = {
    id: "custom-service-website",
    name: "Custom Service & Business Website",
    tagline: "For school, college, builder, hospital, news, personal & corporate sites",
    description: "A tailored, high-converting website built specifically for your service or business model — with custom layouts, lead capture, dynamic content sections and full brand identity.",
    categories: ["School & College", "Builder / Real Estate", "Corporate", "Healthcare", "News Portal", "Personal", "Business"],
    demoUrl: "",
    desktopImage: null,
    mobileImage: null,
    price: 25000,
  };
  const templates = (data.templates || []).some((t) => t.id === "custom-service-website")
    ? data.templates
    : [...(data.templates || []), customTemplate];
  const features = (data.features || []).map((f) => ({
    ...f,
    name: f.name.replace(/^Basic\s+/i, "Standard "),
  }));
  const rules = {
    ...data.rules,
    bdtPerUsd: data.rules?.bdtPerUsd ?? 123.14,
  };
  return { ...data, templates, features, rules, version: doc.version, publishedAt: new Date(doc.createdAt).toISOString() };
}

/** Public presentation uses saved preview images; quoting keeps the published snapshot. */
export async function loadPublicPricebook(): Promise<Pricebook> {
  const pricebook = await loadPublishedPricebook();
  if (!isDbConfigured) return pricebook;
  const templates = await BuilderTemplate.find({ published: true, slug: { $in: pricebook.templates.map((t) => t.id) } })
    .select("slug published desktopImage mobileImage")
    .lean();
  return withTemplatePreviews(pricebook, templates);
}

export const getPublishedPricebook = cache(
  unstable_cache(loadPublicPricebook, [CACHE_VERSION, "ecommerce-builder-public-pricebook"], { tags: [TAGS.ecommerceBuilder], revalidate: 3600 }),
);

/* ---------------------------------- Numbers ---------------------------------- */

/** Next human-readable number, e.g. JDQ-2026-00042. Atomic across instances. */
export async function nextNumber(kind: "quote" | "order" | "invoice"): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = { quote: "JDQ", order: "JDE", invoice: "JDI" }[kind];
  const doc = await BuilderCounter.findOneAndUpdate({ _id: `${kind}-${year}` }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" }).lean();
  return `${prefix}-${year}-${String(doc?.seq ?? 1).padStart(kind === "quote" ? 5 : 4, "0")}`;
}
