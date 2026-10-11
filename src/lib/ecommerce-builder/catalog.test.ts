import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { builderSettingsSeed } from "@/content/seed/ecommerce-builder";
import { builderSelectionSchema } from "@/lib/validations";
import { assemblePricebook, seedPricebook } from "./catalog";
import { calculateQuote } from "./pricing";
import type { DiscountRow } from "./settings";

const pb = seedPricebook();
const coupon = { key: "launch", label: "Launch offer", code: " save10 ", type: "percent", percent: 10, amount: null, minSubtotal: null, requiredFeatures: [], appliesTo: "all", active: true } as DiscountRow;

function assemble(discounts: DiscountRow[]) {
  return assemblePricebook({
    templates: pb.templates,
    categories: pb.categories,
    features: pb.features.map((f) => ({ ...f, recurringAmount: null, recurringInterval: "month", recurringNote: "" })),
    pricing: { ...builderSettingsSeed.pricing, discounts },
    version: 1,
    publishedAt: null,
  });
}

describe("publishing coupons", () => {
  it("preserves a normalized coupon code in the published pricing", () => {
    const result = assemble([coupon]);
    assert.deepEqual(result.issues.filter((i) => i.level === "error"), []);
    assert.equal(result.pricebook.rules.discounts[0].code, "SAVE10");
  });

  it("blocks duplicate coupon codes regardless of case", () => {
    const result = assemble([coupon, { ...coupon, key: "other", code: "SAVE10" }]);
    assert.ok(result.issues.some((i) => i.level === "error"));
  });

  it("blocks malformed coupon codes", () => {
    for (const code of ["SAVE 10", "SAVE10,SAVE20", "X".repeat(41)]) {
      assert.ok(assemble([{ ...coupon, code }]).issues.some((i) => i.level === "error"));
    }
  });

  it("omits disabled coupons from new quotations", () => {
    const result = assemble([{ ...coupon, active: false }]);
    assert.equal(result.pricebook.rules.discounts.length, 0);
    assert.equal(calculateQuote(result.pricebook, { templateId: "beauty-commerce", features: {}, omitted: [], couponCode: "SAVE10" }).ok, false);
  });
});

describe("customer coupon input", () => {
  it("retains and normalizes the coupon sent to the server", () => {
    const result = builderSelectionSchema.parse({ templateId: "beauty-commerce", features: {}, omitted: [], couponCode: " save10 " });
    assert.equal(result.couponCode, "SAVE10");
  });

  it("rejects a list of coupon codes", () => {
    assert.equal(builderSelectionSchema.safeParse({ templateId: "beauty-commerce", features: {}, omitted: [], couponCode: ["SAVE10", "SAVE20"] }).success, false);
  });
});
