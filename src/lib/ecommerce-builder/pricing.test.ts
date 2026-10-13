/**
 * Pricing engine tests — run with `npm test`.
 * Uses the seeded catalog so the shipped sample data is validated too.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedPricebook } from "./catalog";
import { addFeature, calculateQuote, removeFeature, sanitizeSelection, selectionKey, toggleIncluded } from "./pricing";
import type { Pricebook, QuoteBreakdown, Selection } from "./types";

const pb = seedPricebook();
const sel = (templateId: string | null, features: Record<string, number> = {}, omitted: string[] = []): Selection => ({ templateId, features, omitted });

function quote(book: Pricebook, s: Selection): QuoteBreakdown {
  const r = calculateQuote(book, s);
  if (!r.ok) assert.fail(`expected a quote, got errors: ${r.errors.join("; ")}`);
  return r.breakdown;
}

function withRules(rules: Partial<Pricebook["rules"]>): Pricebook {
  return { ...pb, rules: { ...pb.rules, ...rules } };
}

describe("seed catalog", () => {
  it("has seed templates and passes catalog validation", async () => {
    const { assemblePricebook } = await import("./catalog");
    assert.equal(pb.templates.length, 5);
    for (const t of pb.templates.filter((t) => t.id !== "custom-service-website")) {
      assert.equal(t.price, 10000);
    }
    assert.equal(pb.templates.find((t) => t.id === "custom-service-website")?.price, 25000);
    // Re-assemble the seed pricebook and expect no blocking issues.
    const again = assemblePricebook({ templates: pb.templates, categories: pb.categories, features: pb.features.map((f) => ({ ...f, recurringAmount: null, recurringInterval: "month", recurringNote: f.recurring?.note ?? "" })), pricing: { tax: { enabled: false, label: "VAT", ratePercent: null }, discounts: [], quoteValidityDays: 14, bdtPerUsd: null, paymentTerms: "", disclaimer: "" }, version: 1, publishedAt: null });
    assert.deepEqual(again.issues.filter((i) => i.level === "error"), []);
  });

  it("has unique feature ids", () => {
    const ids = pb.features.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("template selection", () => {
  it("requires a template", () => {
    const r = calculateQuote(pb, sel(null));
    assert.equal(r.ok, false);
  });

  it("adds the base price once and switching replaces it", () => {
    assert.equal(quote(pb, sel("beauty-commerce")).total, 10000);
    assert.equal(quote(pb, sel("premium-electronics")).total, 10000);
  });

  it("rejects an unknown template", () => {
    const r = calculateQuote(pb, sel("not-a-template"));
    assert.equal(r.ok, false);
  });
});

describe("features", () => {
  it("prices the documented example at $330", () => {
    const q = quote(pb, sel("beauty-commerce", { pos: 1, "customer-crm": 1, "courier-api": 1, "seo-manager": 1 }));
    assert.equal(q.total, 33000);
    assert.equal(q.lines.length, 4);
  });

  it("charges included features $0 and lists them", () => {
    const q = quote(pb, sel("beauty-commerce"));
    assert.ok(q.included.length >= 20);
    assert.equal(q.lines.length, 0);
  });

  it("ignores included and bundled ids submitted as paid features", () => {
    const q = quote(pb, sel("beauty-commerce", { checkout: 1, "advanced-permissions": 1 }));
    assert.equal(q.total, 10000);
  });

  it("removes the charge when a feature is deselected", () => {
    const withPos = addFeature(pb, sel("beauty-commerce"), "pos");
    assert.equal(quote(pb, withPos).total, 18000);
    assert.equal(quote(pb, removeFeature(withPos, "pos")).total, 10000);
  });

  it("cannot double-charge the same feature", () => {
    const once = addFeature(pb, sel("beauty-commerce"), "pos");
    const twice = addFeature(pb, once, "pos");
    assert.equal(quote(pb, twice).total, 18000);
  });

  it("charges quantity-based features per unit and ignores quantity on fixed features", () => {
    assert.equal(quote(pb, sel("beauty-commerce", { "courier-api": 3 })).total, 10000 + 3 * 5000);
    assert.equal(quote(pb, sel("beauty-commerce", { pos: 7 })).total, 18000);
  });

  it("rejects out-of-range quantities and unknown features", () => {
    assert.equal(calculateQuote(pb, sel("beauty-commerce", { "courier-api": 99 })).ok, false);
    assert.equal(calculateQuote(pb, sel("beauty-commerce", { "courier-api": 1.5 })).ok, false);
    assert.equal(calculateQuote(pb, sel("beauty-commerce", { "made-up-module": 1 })).ok, false);
  });

  it("resolves dependencies transitively", () => {
    const q = quote(pb, sel("beauty-commerce", { "vendor-payouts": 1 }));
    const ids = q.lines.map((l) => l.id).sort();
    assert.deepEqual(ids, ["multi-vendor", "vendor-commission", "vendor-payouts"]);
    assert.equal(q.total, 10000 + 6500 + 9000 + 18000);
    assert.deepEqual(q.lines.find((l) => l.id === "multi-vendor")?.requiredBy, ["Vendor Commission Management"]);
  });

  it("restores an omitted included feature that a paid feature requires", () => {
    const omitted = toggleIncluded(pb, sel("beauty-commerce"), "basic-coupons");
    assert.deepEqual(omitted.omitted, ["basic-coupons"]);
    const q = quote(pb, addFeature(pb, omitted, "advanced-coupons"));
    assert.ok(q.included.some((f) => f.id === "basic-coupons"));
  });

  it("never lets a mandatory included feature be omitted", () => {
    const s = toggleIncluded(pb, sel("beauty-commerce"), "checkout");
    assert.deepEqual(s.omitted, []);
    const q = quote(pb, sel("beauty-commerce", {}, ["checkout"]));
    assert.ok(q.included.some((f) => f.id === "checkout"));
  });

  it("includes bundled features free with their parent", () => {
    const s = addFeature(pb, sel("beauty-commerce"), "advanced-permissions");
    const q = quote(pb, s);
    assert.ok("staff-roles" in s.features);
    assert.equal(q.total, 10000 + 6000);
    assert.deepEqual(q.bundled.map((b) => b.id), ["advanced-permissions"]);
  });

  it("lists custom-quote features separately without a price", () => {
    const q = quote(pb, sel("beauty-commerce", { "ai-suite": 1 }));
    assert.equal(q.total, 10000);
    assert.deepEqual(q.custom.map((c) => c.id), ["ai-suite"]);
    assert.equal(q.lines.length, 0);
  });

  it("keeps recurring third-party costs out of the development total", () => {
    const q = quote(pb, sel("beauty-commerce", { "sms-marketing": 1 }));
    assert.equal(q.total, 10000 + 4000);
    assert.equal(q.recurring.length, 1);
    assert.equal(q.recurring[0].amount, null);
  });
});

describe("discounts and tax", () => {
  it("applies a percentage discount over a minimum subtotal", () => {
    const book = withRules({ discounts: [{ id: "launch", label: "Launch 10%", type: "percent", percent: 10, amount: 0, minSubtotal: 20000, requiredFeatures: [], appliesTo: "all" }] });
    assert.equal(quote(book, sel("beauty-commerce")).discountTotal, 0);
    const q = quote(book, sel("beauty-commerce", { pos: 1, "customer-crm": 1 }));
    assert.equal(q.subtotal, 23500);
    assert.equal(q.discountTotal, 2350);
    assert.equal(q.total, 21150);
  });

  it("applies bundle discounts only to the bundled lines", () => {
    const bundle = ["multi-vendor", "vendor-dashboard"];
    const book = withRules({ discounts: [{ id: "mv", label: "Marketplace", type: "percent", percent: 10, amount: 0, minSubtotal: 0, requiredFeatures: bundle, appliesTo: "bundle" }] });
    assert.equal(quote(book, sel("beauty-commerce", { "multi-vendor": 1 })).discountTotal, 0);
    const q = quote(book, sel("beauty-commerce", { "multi-vendor": 1, "vendor-dashboard": 1, pos: 1 }));
    assert.equal(q.discountTotal, Math.round((18000 + 7500) * 0.1));
  });

  it("never discounts below zero", () => {
    const book = withRules({ discounts: [{ id: "big", label: "Big", type: "fixed", percent: 0, amount: 999_999, minSubtotal: 0, requiredFeatures: [], appliesTo: "all" }] });
    assert.equal(quote(book, sel("beauty-commerce")).total, 0);
  });

  it("charges tax on the discounted subtotal", () => {
    const book = withRules({
      tax: { enabled: true, label: "VAT", ratePercent: 15 },
      discounts: [{ id: "f", label: "$20 off", type: "fixed", percent: 0, amount: 2000, minSubtotal: 0, requiredFeatures: [], appliesTo: "all" }],
    });
    const q = quote(book, sel("beauty-commerce", { pos: 1 }));
    assert.equal(q.taxable, 16000);
    assert.equal(q.tax?.amount, 2400);
    assert.equal(q.total, 18400);
  });
});

describe("selection helpers", () => {
  it("builds the same key regardless of insertion order", () => {
    assert.equal(selectionKey(sel("a", { x: 1, y: 2 })), selectionKey(sel("a", { y: 2, x: 1 })));
  });

  it("sanitizes a stale or tampered stored selection", () => {
    const s = sanitizeSelection(pb, { templateId: "gone", features: { pos: 1, ghost: 1, "courier-api": 400 }, omitted: ["checkout", "brands"] } as Selection);
    assert.equal(s.templateId, null);
    assert.deepEqual(Object.keys(s.features).sort(), ["courier-api", "pos"]);
    assert.equal(s.features["courier-api"], 5);
    assert.deepEqual(s.omitted, ["brands"]);
  });
});

describe("coupon codes", () => {
  const launch = { id: "launch", label: "Launch offer", code: "SAVE10", type: "percent" as const, percent: 10, amount: 0, minSubtotal: 0, requiredFeatures: [], appliesTo: "all" as const };
  const book = withRules({ discounts: [launch] });

  it("does not grant a coupon discount until its code is supplied", () => {
    assert.equal(quote(book, sel("beauty-commerce")).total, 10000);
  });

  it("applies and normalizes a percentage coupon", () => {
    const result = calculateQuote(book, { ...sel("beauty-commerce"), couponCode: " save10 " });
    assert.ok(result.ok);
    assert.equal(result.selection.couponCode, "SAVE10");
    assert.equal(result.breakdown.total, 9000);
    assert.equal(result.breakdown.discounts[0].code, "SAVE10");
  });

  it("applies a fixed coupon before tax", () => {
    const fixed = withRules({ tax: { enabled: true, label: "VAT", ratePercent: 15 }, discounts: [{ ...launch, type: "fixed", amount: 2000 }] });
    const q = quote(fixed, { ...sel("beauty-commerce"), couponCode: "SAVE10" });
    assert.equal(q.discountTotal, 2000);
    assert.equal(q.tax?.amount, 1200);
    assert.equal(q.total, 9200);
  });

  it("rejects unknown, malformed and unpublished coupon codes", () => {
    for (const couponCode of ["NOTFOUND", "SAVE10,SAVE20", "X".repeat(41)]) {
      assert.equal(calculateQuote(book, { ...sel("beauty-commerce"), couponCode }).ok, false);
    }
    assert.equal(calculateQuote(pb, { ...sel("beauty-commerce"), couponCode: "SAVE10" }).ok, false);
  });

  it("enforces the minimum subtotal and rechecks it after removing a feature", () => {
    const min = withRules({ discounts: [{ ...launch, minSubtotal: 18000 }] });
    assert.equal(calculateQuote(min, { ...sel("beauty-commerce"), couponCode: "SAVE10" }).ok, false);
    const selected = { ...sel("beauty-commerce", { pos: 1 }), couponCode: "SAVE10" };
    assert.equal(quote(min, selected).total, 16200);
    assert.equal(calculateQuote(min, removeFeature(selected, "pos")).ok, false);
  });

  it("enforces required features for a coupon", () => {
    const bundle = withRules({ discounts: [{ ...launch, requiredFeatures: ["pos"], appliesTo: "bundle" }] });
    assert.equal(calculateQuote(bundle, { ...sel("beauty-commerce"), couponCode: "SAVE10" }).ok, false);
    assert.equal(quote(bundle, { ...sel("beauty-commerce", { pos: 1 }), couponCode: "SAVE10" }).total, 17200);
  });

  it("applies only the entered coupon while keeping automatic discounts", () => {
    const combined = withRules({ discounts: [{ ...launch, code: "", id: "automatic", percent: 5 }, launch, { ...launch, id: "other", code: "SAVE20", percent: 20 }] });
    const q = quote(combined, { ...sel("beauty-commerce"), couponCode: "SAVE10" });
    assert.deepEqual(q.discounts.map((d) => d.id), ["automatic", "launch"]);
    assert.equal(q.total, 8500);
  });

  it("caps each discount so the displayed discounts equal the saved discount total", () => {
    const combined = withRules({ discounts: [{ ...launch, id: "auto", code: "", type: "fixed", amount: 9000 }, { ...launch, type: "fixed", amount: 9000 }] });
    const q = quote(combined, { ...sel("beauty-commerce"), couponCode: "SAVE10" });
    assert.deepEqual(q.discounts.map((d) => d.amount), [9000, 1000]);
    assert.equal(q.discountTotal, 10000);
    assert.equal(q.total, 0);
  });

  it("changes the quotation key when applying, replacing or removing a coupon", () => {
    const base = sel("beauty-commerce");
    const withCoupon = { ...base, couponCode: "SAVE10" };
    assert.notEqual(selectionKey(base), selectionKey(withCoupon));
    assert.notEqual(selectionKey(withCoupon), selectionKey({ ...base, couponCode: "SAVE20" }));
    assert.equal(selectionKey({ ...base, couponCode: "" }), "t:beauty-commerce;f:;o:");
    assert.equal(selectionKey({ ...base, couponCode: " save10 " }), selectionKey(withCoupon));
  });

  it("restores published coupons and removes ones no longer available", () => {
    const saved = { ...sel("beauty-commerce"), couponCode: "save10" };
    assert.equal(sanitizeSelection(book, saved).couponCode, "SAVE10");
    assert.equal(sanitizeSelection(pb, saved).couponCode, undefined);
  });

  it("preserves an unavailable coupon when restoring a matching valid quotation", () => {
    const saved = { ...sel("beauty-commerce"), couponCode: "save10" };
    const restored = sanitizeSelection(pb, saved, { preserveCoupon: true });
    assert.equal(restored.couponCode, "SAVE10");
    assert.equal(selectionKey(restored), selectionKey(saved));
    assert.equal(sanitizeSelection(pb, { ...saved, couponCode: "bad,code" }, { preserveCoupon: true }).couponCode, undefined);
  });
});
