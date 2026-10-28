import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedPricebook } from "@/lib/ecommerce-builder/catalog";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { invoiceTotals, quotationTotals } from "./calc";
import { buildCatalog, catalogToCostLine, catalogToLineItem, convert, orderToQuotation, parsePlanPrice, planBilling, searchCatalog, type OrderImport } from "./catalog";
import { defaultCompany, quotationToInvoice } from "./defaults";

const company = defaultCompany();

const service = {
  slug: "seo",
  title: "Website SEO",
  capabilities: [],
  included: [{ title: "Audit", items: ["Keyword research"] }],
  plans: [
    { name: "Standard", price: "$150", period: "/month", features: ["Monthly report"] },
    { name: "Setup", price: "$1,000", period: "one-time", features: [] },
    { name: "Enterprise", price: "Contact us", features: [] },
  ],
};

describe("service catalog", () => {
  it("suggests catalog items as you type, best title matches first", () => {
    const { items } = buildCatalog([service], null);
    assert.deepEqual(
      searchCatalog(items, "standard").map((i) => i.title),
      ["Website SEO — Standard"],
    );
    // Every word must match somewhere; title-prefix matches outrank the rest.
    assert.equal(searchCatalog(items, "seo setup")[0].title, "Website SEO — Setup");
    assert.equal(searchCatalog(items, "website")[0].title, "Website SEO — Standard");
    assert.deepEqual(searchCatalog(items, "seo zzz"), []);
    assert.equal(searchCatalog(items, "Website SEO — Setup")[0].title, "Website SEO — Setup");
    assert.equal(searchCatalog(items, "", 2).length, 2);
  });

  it("parses website price strings and periods", () => {
    assert.deepEqual(parsePlanPrice("$1,000"), { amount: 1000, currency: "USD" });
    assert.deepEqual(parsePlanPrice("৳5,000"), { amount: 5000, currency: "BDT" });
    assert.equal(parsePlanPrice("Contact us"), null);
    assert.equal(planBilling("/month + ad budget"), "monthly");
    assert.equal(planBilling("one-time"), "one-time");
  });

  it("lists service plans and e-commerce templates/features with their rates", () => {
    const pb = seedPricebook();
    const cat = buildCatalog([service], pb);
    const plans = cat.items.filter((i) => i.source === "service");
    assert.deepEqual(
      plans.map((p) => [p.title, p.price, p.billing]),
      [
        ["Website SEO — Standard", 150, "monthly"],
        ["Website SEO — Setup", 1000, "one-time"],
        ["Website SEO — Enterprise", null, "one-time"],
      ],
    );
    assert.equal(plans[1].scope, "Keyword research", "plans without features fall back to the service scope");
    assert.equal(cat.items.filter((i) => i.id.startsWith("ecom:template:")).length, pb.templates.length);
    assert.ok(!cat.items.some((i) => i.id.startsWith("ecom:feature:") && pb.features.find((f) => `ecom:feature:${f.id}` === i.id)?.pricing === "included"));
  });

  it("converts USD rates into taka and keeps per-unit quantities", () => {
    const [monthly] = buildCatalog([service], null).items;
    assert.equal(convert(150, "USD", "BDT", 120), 18000);
    assert.equal(convert(150, "USD", "BDT", 0), null);
    assert.deepEqual([catalogToCostLine(monthly, "BDT", 120).amount, catalogToCostLine(monthly, "BDT", 120).type], [18000, "monthly"]);
    const line = catalogToLineItem({ ...monthly, unitLabel: "courier" }, "USD", 0, 3);
    assert.deepEqual([line.qty, line.unitPrice, line.billingType], [3, 150, "monthly"]);
  });

  it("counts monthly costs twelve times in the first year", () => {
    const t = quotationTotals({
      costs: [
        { id: "a", label: "", amount: 1000, type: "one-time" },
        { id: "b", label: "", amount: 100, type: "monthly" },
        { id: "c", label: "", amount: 50, type: "annual" },
      ],
      milestones: [],
    });
    assert.deepEqual([t.recurringYear, t.firstYear], [1250, 2250]);
  });
});

const breakdown: QuoteBreakdown = {
  pricebookVersion: 3,
  currency: "USD",
  template: { id: "fashion", name: "Fashion Store", price: 30000 },
  included: [{ id: "cart", name: "Cart" }],
  omitted: [],
  lines: [
    { id: "courier", name: "Courier API", categoryName: "Shipping", pricing: "quantity", unitPrice: 4000, qty: 2, unitLabel: "courier", amount: 8000 },
    { id: "bkash", name: "bKash", categoryName: "Payments", pricing: "fixed", unitPrice: 5000, qty: 1, unitLabel: "", amount: 5000 },
  ],
  bundled: [],
  custom: [{ id: "erp", name: "ERP sync", categoryName: "Integrations" }],
  discounts: [{ id: "launch", label: "Launch offer", amount: 3000 }],
  subtotal: 43000,
  discountTotal: 3000,
  taxable: 40000,
  tax: null,
  total: 40000,
  recurring: [
    { id: "hosting", name: "Hosting", amount: 10000, qty: 1, interval: "year", note: "" },
    { id: "sms", name: "SMS credits", amount: null, qty: 1, interval: "month", note: "Billed per SMS" },
  ],
  selectionKey: "k",
};

const order: OrderImport = {
  id: "a".repeat(24),
  number: "JDE-2026-0004",
  quoteNumber: "JDQ-2026-00009",
  status: "confirmed",
  createdAt: "2026-10-20T10:00:00.000Z",
  customer: { name: "Rahim", phone: "017", email: "r@example.com", businessName: "Rahim Fashion", domain: "rahim.com", requirements: "Need COD" },
  breakdown,
  currency: "USD",
  payments: [{ amount: 20000, method: "bKash", reference: "TRX1", receivedAt: "2026-10-21T00:00:00.000Z" }],
  paymentTerms: "50% advance.",
  disclaimer: "Scope as listed.",
  validityDays: 14,
  usdToBdt: 120,
};

describe("e-commerce order → studio quotation", () => {
  it("rebuilds the order total as editable cost lines in the chosen currency", () => {
    const q = orderToQuotation(order, { company, docs: [], currency: "USD", rate: 0, today: "2026-10-27" });
    const t = quotationTotals(q);
    assert.equal(t.oneTime, 400, "template + features − discount = order total");
    assert.equal(t.annual, 100);
    assert.equal(t.milestones, t.firstYear);
    assert.equal(q.source?.orderNumber, "JDE-2026-0004");
    assert.equal(q.client.company, "Rahim Fashion");
    assert.ok(q.costs.some((c) => c.label === "Courier API × 2 couriers" && c.amount === 80));
    assert.ok(q.additionalCosts.some((a) => a.startsWith("SMS credits")));
    assert.ok(q.additionalCosts.some((a) => a.includes("ERP sync")));
    assert.equal(q.validityDays, 14);

    const bdt = orderToQuotation(order, { company, docs: [], currency: "BDT", rate: 120, today: "2026-10-27" });
    assert.equal(quotationTotals(bdt).oneTime, 48000);
  });

  it("carries recorded order payments onto the first invoice only", () => {
    const q = orderToQuotation(order, { company, docs: [], currency: "USD", rate: 0, today: "2026-10-27" });
    const inv = quotationToInvoice(q, { company, docs: [q], mode: "full", today: "2026-10-27" });
    const t = invoiceTotals(inv);
    assert.deepEqual([t.grandTotal, t.paid, t.balance], [500, 200, 300]);
    assert.equal(inv.source?.orderId, order.id);
    const second = quotationToInvoice({ ...q, invoiceIds: [inv.id] }, { company, docs: [q, inv], mode: "full", today: "2026-10-27" });
    assert.equal(invoiceTotals(second).paid, 0);
  });
});
