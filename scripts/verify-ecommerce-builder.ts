/**
 * Integration check for the e-commerce builder against a throwaway in-memory
 * MongoDB (never your real database):
 *
 *   npx tsx --conditions=react-server scripts/verify-ecommerce-builder.ts
 *
 * Covers: idempotent seeding, pricebook publication, server-side quotes,
 * catalog edits and images, coupon publication, immutable price snapshots,
 * order idempotency and PDF rendering.
 */
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server-core";

async function main() {
  const mongod = await MongoMemoryServer.create();
  // Configure the app's env before any app module reads it.
  process.env.MONGODB_URI = mongod.getUri();
  process.env.MONGODB_DB = "builder-verify";
  process.env.EMAIL_PROVIDER = "console";
  process.env.AUTH_SECRET = "verify-secret-verify-secret-verify-secret";

  const mongoose = (await import("mongoose")).default;
  const { connectDB } = await import("../src/lib/db/connect");
  const { seedEcommerceBuilder } = await import("./seed-ecommerce-builder");
  const { assembleFromDocs, pricebookHash } = await import("../src/lib/ecommerce-builder/catalog");
  const { calculateQuote } = await import("../src/lib/ecommerce-builder/pricing");
  const { issueQuote, findQuoteByToken } = await import("../src/lib/ecommerce-builder/quotes");
  const { loadDraftPricebook, loadPublishedPricebook, readBuilderSettings, nextNumber } = await import("../src/lib/ecommerce-builder/server");
  const { renderPdf } = await import("../src/lib/ecommerce-builder/pdf");
  const { BuilderCategory, BuilderFeature, BuilderOrder, BuilderPricebook, BuilderQuote, BuilderSettingsModel, BuilderTemplate } = await import("../src/models/builder");

  const step = (msg: string) => console.log(`✓ ${msg}`);
  try {
    await connectDB();

    // 1. Idempotent seed
    await seedEcommerceBuilder();
    const counts = async () => [await BuilderTemplate.countDocuments(), await BuilderCategory.countDocuments(), await BuilderFeature.countDocuments(), await BuilderPricebook.countDocuments()];
    const first = await counts();
    await seedEcommerceBuilder();
    assert.deepEqual(await counts(), first, "second seed run must not create duplicates");
    assert.equal(first[0], 4);
    assert.equal(first[3], 1);
    step(`seed is idempotent (${first[0]} templates, ${first[1]} categories, ${first[2]} features, 1 pricebook)`);

    // Admin edits survive a re-seed
    await BuilderFeature.updateOne({ slug: "pos" }, { $set: { price: 9000 } });
    await seedEcommerceBuilder();
    assert.equal((await BuilderFeature.findOne({ slug: "pos" }).lean())?.price, 9000);
    step("re-seeding keeps admin edits");

    // 2. Published pricing v1 still has the original price; quote from it
    const v1 = await loadPublishedPricebook();
    assert.equal(v1.version, 1);
    const selection = { templateId: "beauty-commerce", features: { pos: 1, "customer-crm": 1, "courier-api": 1, "seo-manager": 1 }, omitted: [] };
    const calc = calculateQuote(v1, selection);
    assert.ok(calc.ok);
    assert.equal(calc.breakdown.total, 33000);
    const { doc: quote, token } = await issueQuote(v1, calc, { ip: "127.0.0.1" });
    assert.match(quote.number, /^JDQ-\d{4}-\d{5}$/);
    assert.equal((await findQuoteByToken(token))?.number, quote.number);
    assert.equal(await findQuoteByToken("not-a-real-token-not-a-real-token-xx"), null);
    step(`quote ${quote.number} saved with server total $330 and a working private token`);

    // 3. Publish v2 with the edited POS price; v1 quote snapshot is unchanged
    const [templates, categories, features] = await Promise.all([
      BuilderTemplate.find({ published: true }).sort({ order: 1 }).lean(),
      BuilderCategory.find({ published: true }).sort({ order: 1 }).lean(),
      BuilderFeature.find({}).sort({ order: 1 }).lean(),
    ]);
    const settings = await readBuilderSettings();
    const draft = assembleFromDocs({ templates, categories, features, pricing: settings.pricing, version: 2 });
    assert.deepEqual(draft.issues.filter((i) => i.level === "error"), []);
    assert.notEqual(pricebookHash(draft.pricebook), (await BuilderPricebook.findOne({ version: 1 }).lean())?.hash);
    await BuilderPricebook.create({ version: 2, data: draft.pricebook, hash: pricebookHash(draft.pricebook) });
    const v2 = await loadPublishedPricebook();
    const calc2 = calculateQuote(v2, selection);
    assert.ok(calc2.ok);
    assert.equal(calc2.breakdown.total, 34000);
    const stored = await BuilderQuote.findById(quote._id).lean();
    assert.equal(stored?.total, 33000);
    assert.equal((stored?.breakdown as { pricebookVersion: number }).pricebookVersion, 1);
    step("publishing v2 changes new quotes ($340) but the saved v1 quote keeps $330");

    // 4. Orders: one per quote, idempotency key unique
    const base = {
      quote: quote._id,
      quoteNumber: quote.number,
      customer: { name: "Test Customer", phone: "+8801700000000", email: "test@example.com", businessCategory: "Other", contactMethod: "WhatsApp" },
      pricebookVersion: 1,
      breakdown: calc.breakdown,
      total: calc.breakdown.total,
      termsAcceptedAt: new Date(),
    };
    const order = await BuilderOrder.create({ ...base, number: await nextNumber("order"), idempotencyKey: "verify-key-0000000001" });
    assert.match(order.number, /^JDE-\d{4}-\d{4}$/);
    await assert.rejects(BuilderOrder.create({ ...base, number: await nextNumber("order"), idempotencyKey: "verify-key-0000000001" }), (e: { code?: number }) => e.code === 11000);
    await assert.rejects(BuilderOrder.create({ ...base, number: await nextNumber("order"), idempotencyKey: "verify-key-0000000002" }), (e: { code?: number }) => e.code === 11000);
    assert.equal(await BuilderOrder.countDocuments(), 1);
    step(`order ${order.number} saved; duplicate submissions are rejected by unique indexes`);

    // 5. PDFs render
    const pdf = await renderPdf({ kind: "quotation", number: quote.number, issuedAt: new Date(), untilAt: quote.validUntil, customer: base.customer, breakdown: calc.breakdown, paymentTerms: settings.pricing.paymentTerms, disclaimer: settings.pricing.disclaimer, siteUrl: "https://www.jarzdigital.com" });
    assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), "%PDF-");
    const inv = await renderPdf({ kind: "invoice", number: "JDI-TEST-0001", issuedAt: new Date(), breakdown: calc.breakdown, amountPaid: 10000, siteUrl: "https://www.jarzdigital.com" });
    assert.equal(Buffer.from(inv.slice(0, 5)).toString(), "%PDF-");
    step(`quotation PDF (${Math.round(pdf.length / 1024)} KB) and invoice PDF render`);

    // 6. New admin catalog records, preview images and subsequent edits flow
    // through the same draft loader and published pricebook as the public page.
    const category = await BuilderCategory.create({ name: "Reporting", slug: "reporting", description: "Store reports", published: true });
    const template = await BuilderTemplate.create({ name: "New store", slug: "new-store", description: "Admin-managed design", price: 15000, desktopImage: { src: "/media/store.png", alt: "Store preview", width: 1600, height: 1000 }, published: true });
    const feature = await BuilderFeature.create({ name: "Reports", slug: "reports", category: category._id, summary: "Original description", price: 2500, pricing: "fixed", published: true });
    await BuilderFeature.updateOne({ _id: feature._id }, { $set: { name: "Store reporting", summary: "Updated description", price: 3500 } }, { runValidators: true });
    await BuilderCategory.updateOne({ _id: category._id }, { $set: { name: "Insights", description: "Updated category description" } }, { runValidators: true });
    await BuilderTemplate.updateOne({ _id: template._id }, { $set: { description: "Updated store description" } }, { runValidators: true });
    const discount = { key: "launch", label: "Launch offer", code: "SAVE10", type: "percent", percent: 10, amount: null, minSubtotal: 18000, requiredFeatures: [], appliesTo: "all", active: true };
    await BuilderSettingsModel.updateOne({ key: "ecommerce" }, { $set: { "data.pricing.discounts": [discount] } });
    const draft3 = await loadDraftPricebook();
    assert.deepEqual(draft3.issues.filter((i) => i.level === "error"), []);
    assert.equal(draft3.pricebook.templates.find((t) => t.id === "new-store")?.desktopImage?.alt, "Store preview");
    assert.equal(draft3.pricebook.categories.find((c) => c.id === "reporting")?.name, "Insights");
    assert.equal(draft3.pricebook.features.find((f) => f.id === "reports")?.summary, "Updated description");
    assert.equal(draft3.pricebook.rules.discounts[0].code, "SAVE10");
    assert.equal((await loadPublishedPricebook()).templates.some((t) => t.id === "new-store"), false, "drafts must not change public pricing");
    await BuilderPricebook.create({ version: 3, data: draft3.pricebook, hash: pricebookHash(draft3.pricebook) });
    const v3 = await loadPublishedPricebook();
    const couponSelection = { templateId: "new-store", features: { reports: 1 }, omitted: [], couponCode: "save10" };
    const couponCalc = calculateQuote(v3, couponSelection);
    assert.ok(couponCalc.ok);
    assert.equal(couponCalc.breakdown.total, 16650);
    const couponQuote = await issueQuote(v3, couponCalc);
    const savedCoupon = await findQuoteByToken(couponQuote.token);
    assert.equal((savedCoupon?.selection as { couponCode: string }).couponCode, "SAVE10");
    assert.equal((savedCoupon?.breakdown as { discounts: { code: string }[] }).discounts[0].code, "SAVE10");
    step("new templates with images, categories, feature edits and coupons reach published pricing and saved quotes ($166.50)");

    // 7. Deactivation affects new quotes after publication, preserving issued snapshots.
    await BuilderSettingsModel.updateOne({ key: "ecommerce" }, { $set: { "data.pricing.discounts.0.active": false } });
    const draft4 = await loadDraftPricebook();
    await BuilderPricebook.create({ version: 4, data: draft4.pricebook, hash: pricebookHash(draft4.pricebook) });
    assert.equal(calculateQuote(await loadPublishedPricebook(), couponSelection).ok, false);
    assert.equal((await findQuoteByToken(couponQuote.token))?.total, 16650);
    const couponOrder = await BuilderOrder.create({ ...base, quote: couponQuote.doc._id, quoteNumber: couponQuote.doc.number, pricebookVersion: 3, breakdown: couponCalc.breakdown, total: 16650, templateId: "new-store", number: await nextNumber("order"), idempotencyKey: "verify-coupon-order-0001" });
    assert.equal((couponOrder.breakdown as { discounts: { code: string }[] }).discounts[0].code, "SAVE10");
    const couponPdf = await renderPdf({ kind: "quotation", number: couponQuote.doc.number, issuedAt: new Date(), breakdown: couponCalc.breakdown, siteUrl: "https://www.jarzdigital.com" });
    assert.equal(Buffer.from(couponPdf.slice(0, 5)).toString(), "%PDF-");
    step("disabled coupons are rejected for new quotes; existing quote and order discounts remain unchanged and render in PDFs");

    console.log("\nAll e-commerce builder integration checks passed.");
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
