import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { builderSettingsSeed } from "@/content/seed/ecommerce-builder";
import { TAGS } from "@/lib/data/cache-tags";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { BuilderCategory, BuilderCounter, BuilderFeature, BuilderPricebook, BuilderSettingsModel, BuilderTemplate } from "@/models/builder";
import { assembleFromDocs, pricebookHash, seedPricebook, type CatalogIssue } from "./catalog";
import type { BuilderSettings } from "./settings";
import type { Pricebook } from "./types";

export { seedPricebook, type CatalogIssue } from "./catalog";

/**
 * Server-side data for the e-commerce builder.
 *
 * Public reads (`getPublishedPricebook`, `getBuilderSettings`) are cached
 * under the "ecommerce-builder" tag; publishing pricing or saving builder
 * settings revalidates it. Server actions use the uncached loaders so a
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
const CACHE_VERSION = `${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local"}-${SEED_VERSION}`;

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
  return assembleFromDocs({ templates, categories, features, pricing: settings.pricing, version: (latest?.version ?? 0) + 1 });
}

export { pricebookHash };

/* ------------------------------ Published pricing ---------------------------- */

/** Latest published pricebook, uncached. Falls back to the seed preview (version 0). */
export async function loadPublishedPricebook(): Promise<Pricebook> {
  if (!isDbConfigured) return seedPricebook();
  await connectDB();
  const doc = await BuilderPricebook.findOne().sort({ version: -1 }).lean();
  if (!doc) return seedPricebook();
  return { ...(doc.data as Pricebook), version: doc.version, publishedAt: new Date(doc.createdAt).toISOString() };
}

export const getPublishedPricebook = cache(
  unstable_cache(loadPublishedPricebook, [CACHE_VERSION, "ecommerce-builder-pricebook"], { tags: [TAGS.ecommerceBuilder], revalidate: 3600 }),
);

/* ---------------------------------- Numbers ---------------------------------- */

/** Next human-readable number, e.g. JDQ-2026-00042. Atomic across instances. */
export async function nextNumber(kind: "quote" | "order" | "invoice"): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = { quote: "JDQ", order: "JDE", invoice: "JDI" }[kind];
  const doc = await BuilderCounter.findOneAndUpdate({ _id: `${kind}-${year}` }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" }).lean();
  return `${prefix}-${year}-${String(doc?.seq ?? 1).padStart(kind === "quote" ? 5 : 4, "0")}`;
}
