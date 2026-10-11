/**
 * Seeds the e-commerce website builder catalog (idempotent).
 *
 *   npm run db:seed:builder
 *
 * Templates, categories and features are inserted by key only when missing —
 * existing rows (and admin edits) are never overwritten. Settings sections
 * are added only when absent. Pricing v1 is published only if no pricebook
 * exists yet. Also runs as part of `npm run db:seed`.
 */
import "./_env";
import mongoose, { type Types } from "mongoose";
import { builderCategorySeed, builderFeatureSeed, builderSettingsSeed, builderTemplateSeed } from "../src/content/seed/ecommerce-builder";
import { assembleFromDocs, pricebookHash } from "../src/lib/ecommerce-builder/catalog";
import type { BuilderSettings } from "../src/lib/ecommerce-builder/settings";
import { BuilderCategory, BuilderFeature, BuilderPricebook, BuilderSettingsModel, BuilderTemplate } from "../src/models/builder";

export async function seedEcommerceBuilder() {
  await Promise.all([BuilderTemplate, BuilderCategory, BuilderFeature, BuilderPricebook, BuilderSettingsModel].map((m) => m.syncIndexes()));

  /* Categories */
  const catIds = new Map<string, Types.ObjectId>();
  let newCats = 0;
  for (const c of builderCategorySeed) {
    const res = await BuilderCategory.updateOne({ slug: c.key }, { $setOnInsert: { name: c.name, slug: c.key, description: c.description, icon: c.icon, order: c.order, published: true } }, { upsert: true });
    newCats += res.upsertedCount;
  }
  for (const doc of await BuilderCategory.find({}).select("slug").lean()) catIds.set(doc.slug, doc._id);

  /* Features (second pass links dependencies for rows created in this run) */
  const inserted = new Set<string>();
  for (const [i, f] of builderFeatureSeed.entries()) {
    const category = catIds.get(f.category);
    if (!category) throw new Error(`Unknown category ${f.category} for ${f.key}`);
    const res = await BuilderFeature.updateOne(
      { slug: f.key },
      {
        $setOnInsert: {
          name: f.name,
          slug: f.key,
          category,
          summary: f.summary,
          details: f.details ?? "",
          icon: f.icon,
          pricing: f.pricing,
          mandatory: Boolean(f.mandatory),
          price: f.price ?? 0,
          unitLabel: f.unitLabel ?? "",
          minQty: f.minQty ?? 1,
          maxQty: f.maxQty ?? 1,
          requires: [],
          recurringAmount: null,
          recurringInterval: "month",
          recurringNote: f.recurringNote ?? "",
          popular: Boolean(f.popular),
          order: (builderCategorySeed.find((c) => c.key === f.category)?.order ?? 0) * 100 + i,
          published: true,
        },
      },
      { upsert: true },
    );
    if (res.upsertedCount) inserted.add(f.key);
  }
  const featureIds = new Map((await BuilderFeature.find({}).select("slug").lean()).map((d) => [d.slug, d._id]));
  for (const f of builderFeatureSeed) {
    if (!inserted.has(f.key) || !f.requires?.length) continue;
    await BuilderFeature.updateOne({ slug: f.key }, { $set: { requires: f.requires.map((r) => featureIds.get(r)).filter(Boolean) } });
  }

  /* Templates */
  let newTemplates = 0;
  for (const t of builderTemplateSeed) {
    const res = await BuilderTemplate.updateOne(
      { slug: t.key },
      { $setOnInsert: { name: t.name, slug: t.key, tagline: t.tagline, description: t.description, categories: t.categories, demoUrl: t.demoUrl, referenceUrl: t.referenceUrl, price: t.price, order: t.order, published: true } },
      { upsert: true },
    );
    newTemplates += res.upsertedCount;
  }
  console.log(`✓ builder catalog: ${newTemplates} new templates, ${newCats} new categories, ${inserted.size} new features (existing rows kept)`);

  /* Settings — add missing sections only */
  const existing = await BuilderSettingsModel.findOne({ key: "ecommerce" }).lean();
  const data = (existing?.data ?? {}) as Partial<BuilderSettings>;
  const missing = (Object.keys(builderSettingsSeed) as (keyof BuilderSettings)[]).filter((k) => !data[k]);
  if (missing.length) {
    await BuilderSettingsModel.updateOne({ key: "ecommerce" }, { $set: Object.fromEntries(missing.map((k) => [`data.${k}`, builderSettingsSeed[k]])) }, { upsert: true });
    console.log(`✓ builder settings: added ${missing.join(", ")}`);
  } else console.log("• builder settings already exist (kept)");

  /* Pricing v1 — only when nothing has been published yet */
  if (!(await BuilderPricebook.exists({}))) {
    const settings = { ...builderSettingsSeed, ...((await BuilderSettingsModel.findOne({ key: "ecommerce" }).lean())?.data ?? {}) } as BuilderSettings;
    const [templates, categories, features] = await Promise.all([
      BuilderTemplate.find({ published: true }).sort({ order: 1, name: 1 }).lean(),
      BuilderCategory.find({ published: true }).sort({ order: 1, name: 1 }).lean(),
      BuilderFeature.find({}).sort({ order: 1, name: 1 }).lean(),
    ]);
    const { pricebook, issues } = assembleFromDocs({ templates, categories, features, pricing: settings.pricing, version: 1 });
    const errors = issues.filter((i) => i.level === "error");
    if (errors.length) {
      console.warn(`! pricing not published — fix in Admin → E-commerce Builder:\n  ${errors.map((e) => e.message).join("\n  ")}`);
    } else {
      await BuilderPricebook.create({ version: 1, data: pricebook, hash: pricebookHash(pricebook), note: "Initial catalog (seed)", publishedByName: "Seed script" });
      console.log(`✓ builder pricing v1 published (${pricebook.templates.length} templates, ${pricebook.features.length} features)`);
    }
  } else console.log("• builder pricing already published (kept)");
}

// Run directly: `tsx --conditions=react-server scripts/seed-ecommerce-builder.ts`
if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/seed-ecommerce-builder.ts")) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local (run `npm run db:dev` for a local database).");
    process.exit(1);
  }
  mongoose
    .connect(uri, { dbName: process.env.MONGODB_DB ?? "jarzdigital" })
    .then(seedEcommerceBuilder)
    .then(() => mongoose.disconnect())
    .catch(async (err) => {
      console.error(err);
      await mongoose.disconnect();
      process.exit(1);
    });
}
