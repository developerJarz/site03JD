/**
 * Adds or updates ONE service from the seed data, leaving every other service untouched
 * (unlike `npm run db:seed`, which re-applies the whole seed).
 *
 *   npm run db:service -- ai-automation
 *
 * The service keeps its seed `order`; when it's 0 it is listed first everywhere.
 * Existing CMS edits to that one service are overwritten by the seed copy.
 */
import "./_env";
import mongoose from "mongoose";
import { serviceSeed } from "../src/content/seed";
import { Category, Service } from "../src/models/content";

const slug = process.argv[2];
const uri = process.env.MONGODB_URI;
if (!slug) {
  console.error("Usage: npm run db:service -- <service-slug>");
  process.exit(1);
}
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

async function main() {
  const seed = serviceSeed.find((s) => s.slug === slug);
  if (!seed) throw new Error(`No service with slug "${slug}" in src/content/seed/services.ts`);

  await mongoose.connect(uri!, { dbName: process.env.MONGODB_DB ?? "jarzdigital" });
  console.log(`Connected to ${mongoose.connection.name}`);

  const { relatedSlugs, categorySlug, ...data } = seed;
  const category = await Category.findOne({ slug: categorySlug }).select("_id").lean();
  if (!category) console.warn(`! Category "${categorySlug}" not found — service saved without a category.`);
  const related = await Service.find({ slug: { $in: relatedSlugs } }).select("_id").lean();

  const doc = await Service.findOneAndUpdate(
    { slug },
    { $set: { ...data, category: category?._id, related: related.map((r) => r._id) } },
    { upsert: true, returnDocument: "after" },
  );
  console.log(`✓ ${doc.title} (/services/${doc.slug}) saved with order ${doc.order}, ${related.length} related services.`);
  console.log("  The live site picks it up within an hour (revalidate), or immediately after any admin save that revalidates services.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
